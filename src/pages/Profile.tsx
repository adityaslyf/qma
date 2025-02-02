import { useEffect, useState } from 'react'
import { useProfile } from "@/contexts/profile-context"
import { Button } from "@/components/ui/button"
import { BasicInfoSection } from "@/components/profile/basic-info-section"
import { ExperienceSection } from "@/components/profile/experience-section"
import { EducationSection } from "@/components/profile/education-section"
import { ProjectsSection } from "@/components/profile/projects-section"
import { AchievementsSection } from "@/components/profile/achievements-section"
import { useResume } from '@/contexts/resume-context'
import { useToast } from "@/components/ui/custom-toaster"
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/hooks/user-auth"
import { Save, Briefcase, GraduationCap, Trophy, FolderGit2, User, ChevronLeft, Settings, Bell, Search, Mail } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { TemplateGenerator } from '@/components/template-generator'

export default function ProfilePage() {
  const { parsedResume } = useResume()
  const { userDetails, fetchUserDetails } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const { profile, updateProfile } = useProfile()
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState('basic-info')
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  } | null>(null)

  // Load existing profile or parsed resume data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        
        if (!userDetails?.user_id) {
          throw new Error('User not authenticated')
        }

        if (parsedResume) {
          // If we have parsed resume data, use that
          updateProfile(parsedResume)
        } else {
          // Try to load existing profile
          const { data: existingProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userDetails.user_id)
            .maybeSingle()

          if (existingProfile && !error) {
            updateProfile(existingProfile)
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [userDetails, parsedResume, updateProfile])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[Profile] Current auth session:', {
        userId: session?.user?.id,
        matchesUserDetails: session?.user?.id === userDetails?.user_id
      })
    }
    checkAuth()
  }, [userDetails?.user_id])

  useEffect(() => {
    const refreshSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        console.error('[Profile] Session refresh error:', error)
        // Redirect to login or show error
        return
      }
      console.log('[Profile] Session refreshed:', {
        userId: session.user.id,
        email: session.user.email
      })
    }
    refreshSession()
  }, [])

  const handleSave = async () => {
    try {
      if (!userDetails?.user_id) {
        throw new Error('User not authenticated')
      }

      // Show saving alert
      setAlertInfo({
        show: true,
        type: 'success',
        message: 'Saving changes...'
      });

      // Step 1: Save profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: userDetails.user_id,
          basic_info: profile?.basic_info,
          experience: profile?.experience,
          education: profile?.education,
          projects: profile?.projects,
          achievements: profile?.achievements
        }, {
          onConflict: 'user_id'
        })

      if (profileError) {
        throw profileError
      }

      console.log('[Profile] Profile saved successfully')

      // Step 2: Get current session
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[Profile] Current session:', {
        sessionUserId: session?.user?.id,
        userDetailsId: userDetails.user_id
      })

      // Step 3: First verify the user exists
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userDetails.user_id)
        .single()

      console.log('[Profile] Found user:', { 
        existingUser,
        findError,
        userMatch: session?.user?.id === existingUser?.user_id
      })

      if (findError) {
        console.error('[Profile] Error finding user:', findError)
        throw findError
      }

      if (!existingUser) {
        throw new Error('User not found')
      }

      // Step 4: Update has_profile flag using a simpler update
      const { data: updatedUser, error: userError } = await supabase
        .from('users')
        .update({ has_profile: true })
        .eq('id', existingUser.id)
        .select()

      console.log('[Profile] User update attempt:', {
        updateQuery: {
          table: 'users',
          id: existingUser.id,
          user_id: existingUser.user_id,
          update: { has_profile: true }
        },
        result: {
          data: updatedUser,
          error: userError ? {
            code: userError.code,
            message: userError.message,
            details: userError.details,
            hint: userError.hint
          } : null
        }
      })

      if (userError) {
        console.error('[Profile] User update error:', userError)
        throw userError
      }

      // Step 5: Verify the update
      const { data: verifyUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', existingUser.id)
        .single()

      console.log('[Profile] Verification:', {
        before: existingUser.has_profile,
        after: verifyUser?.has_profile
      })

      // Step 6: Refresh user details
      await fetchUserDetails()

      // Show success alert
      setAlertInfo({
        show: true,
        type: 'success',
        message: 'Changes saved successfully!'
      });

      // Hide alert after 3 seconds
      setTimeout(() => {
        setAlertInfo(null);
      }, 3000);

    } catch (error) {
      console.error('[Profile] Save error:', error)
      // Show error alert
      setAlertInfo({
        show: true,
        type: 'error',
        message: error instanceof Error 
          ? `Failed to save: ${error.message}`
          : 'Failed to save profile. Please try again.'
      });

      // Hide error alert after 5 seconds
      setTimeout(() => {
        setAlertInfo(null);
      }, 5000);
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-card border-r border-border/50 transition-all duration-300 
        ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.basic_info?.avatar} />
                  <AvatarFallback>
                    {profile?.basic_info?.name 
                      ? profile.basic_info.name.split(' ').map(n => n[0]).join('').toUpperCase()
                      : userDetails?.email?.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {profile?.basic_info?.name || userDetails?.email?.split('@')[0] || 'User'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {profile?.basic_info?.title || 'Profile'}
                  </p>
                </div>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            >
              <ChevronLeft className={`h-4 w-4 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-3 space-y-2">
          <NavButton
            icon={<User />}
            label="Basic Info"
            isActive={activeSection === 'basic-info'}
            isCollapsed={isSidebarCollapsed}
            onClick={() => setActiveSection('basic-info')}
          />
          <NavButton
            icon={<Briefcase />}
            label="Experience"
            isActive={activeSection === 'experience'}
            isCollapsed={isSidebarCollapsed}
            onClick={() => setActiveSection('experience')}
          />
          <NavButton
            icon={<GraduationCap />}
            label="Education"
            isActive={activeSection === 'education'}
            isCollapsed={isSidebarCollapsed}
            onClick={() => setActiveSection('education')}
          />
          <NavButton
            icon={<FolderGit2 />}
            label="Projects"
            isActive={activeSection === 'projects'}
            isCollapsed={isSidebarCollapsed}
            onClick={() => setActiveSection('projects')}
          />
          <NavButton
            icon={<Trophy />}
            label="Achievements"
            isActive={activeSection === 'achievements'}
            isCollapsed={isSidebarCollapsed}
            onClick={() => setActiveSection('achievements')}
          />
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50">
          {alertInfo && alertInfo.show && (
            <div 
              className={`absolute bottom-full left-4 right-4 mb-2 p-3 rounded-lg shadow-lg transition-all duration-300 ${
                alertInfo.type === 'success' 
                  ? 'bg-green-100 border border-green-400 text-green-800'
                  : 'bg-red-100 border border-red-400 text-red-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {alertInfo.type === 'success' ? (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="font-medium">{alertInfo.message}</span>
                </div>
                <button 
                  onClick={() => setAlertInfo(null)}
                  className="text-sm hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          <Button 
            className="w-full relative group"
            onClick={handleSave}
            variant="default"
          >
            <Save className="h-4 w-4 mr-2" />
            {!isSidebarCollapsed && (
              <>
                Save Changes
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Click to save your changes
                </div>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        {/* Top Bar */}
        <div className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm fixed top-0 right-0 left-72 z-10 flex items-center justify-between px-6">
          <div className="flex items-center flex-1 max-w-xl">
            <Search className="h-4 w-4 text-muted-foreground absolute ml-3" />
            <Input 
              placeholder="Search..." 
              className="pl-10 bg-background/50"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 pt-24 max-w-5xl mx-auto">
          <div className="grid gap-6">
            {activeSection === 'basic-info' && (
              <ContentCard title="Basic Information" icon={<User />}>
                <BasicInfoSection />
              </ContentCard>
            )}
            {activeSection === 'experience' && (
              <ContentCard title="Professional Experience" icon={<Briefcase />}>
                <ExperienceSection />
              </ContentCard>
            )}
            {activeSection === 'education' && (
              <ContentCard title="Education" icon={<GraduationCap />}>
                <EducationSection />
              </ContentCard>
            )}
            {activeSection === 'projects' && (
              <ContentCard title="Projects" icon={<FolderGit2 />}>
                <ProjectsSection />
              </ContentCard>
            )}
            {activeSection === 'achievements' && (
              <ContentCard title="Achievements" icon={<Trophy />}>
                <AchievementsSection />
              </ContentCard>
            )}
            <ContentCard title="Email Templates" icon={<Mail />}>
              <TemplateGenerator />
            </ContentCard>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Components
interface NavButtonProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  isCollapsed: boolean
  onClick: () => void
}

function NavButton({ icon, label, isActive, isCollapsed, onClick }: NavButtonProps) {
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={`w-full justify-start ${isActive ? 'bg-primary/10' : ''}`}
      onClick={onClick}
    >
      <span className="h-4 w-4">{icon}</span>
      {!isCollapsed && <span className="ml-3">{label}</span>}
    </Button>
  )
}

interface ContentCardProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

function ContentCard({ title, icon, children }: ContentCardProps) {
  return (
    <div className="bg-card rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-border/50 flex items-center">
        <span className="h-5 w-5 text-primary mr-2">{icon}</span>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}
