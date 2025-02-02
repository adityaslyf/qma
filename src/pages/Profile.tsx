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
import { Save, Briefcase, GraduationCap, Trophy, FolderGit2, User, ChevronLeft, Settings, Bell, Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"

export default function ProfilePage() {
  const { parsedResume } = useResume()
  const { userDetails, fetchUserDetails } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const { profile, updateProfile } = useProfile()
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState('basic-info')
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)

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
        console.error('[Profile] Profile save error:', profileError)
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

      toast({
        title: "Success",
        description: "Profile saved successfully",
      })
    } catch (error) {
      console.error('[Profile] Save error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save profile",
        variant: "destructive",
      })
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
                  <AvatarImage src="/path-to-avatar.jpg" />
                  <AvatarFallback>JP</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">John Doe</h3>
                  <p className="text-xs text-muted-foreground">Premium Profile</p>
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
          <Button 
            className="w-full"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            {!isSidebarCollapsed && 'Save Changes'}
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
