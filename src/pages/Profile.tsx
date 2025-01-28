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
  const { userDetails } = useAuth()
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

  const handleSave = async () => {
    try {
      if (!userDetails?.user_id) {
        throw new Error('User not authenticated')
      }

      const profileData = {
        user_id: userDetails.user_id,
        ...profile
      }

      const { error: supabaseError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'user_id'
        })

      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        throw supabaseError
      }

      // Update user details to indicate they now have a profile
      await supabase
        .from('users')
        .update({ hasProfile: true })
        .eq('user_id', userDetails.user_id)

      toast({
        title: "Success",
        description: "Profile saved successfully",
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null ? (error as any).message : "Failed to save profile",
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
