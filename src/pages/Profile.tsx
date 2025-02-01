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



export default function ProfilePage() {
  const { parsedResume } = useResume()
  const { userDetails, fetchUserDetails } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const { profile, updateProfile } = useProfile()
  const { toast } = useToast()

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
          basic_info: profile.basic_info,
          experience: profile.experience,
          education: profile.education,
          projects: profile.projects,
          achievements: profile.achievements
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button onClick={handleSave}>Save Profile</Button>
      </div>
      
      <div className="space-y-8">
        <BasicInfoSection />
        <ExperienceSection />
        <EducationSection />
        <ProjectsSection />
        <AchievementsSection />
      </div>
    </div>
  )
}
