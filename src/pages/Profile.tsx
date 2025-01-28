import { useEffect, useState } from 'react'
import { useProfile } from "@/contexts/profile-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BasicInfoSection } from "@/components/profile/basic-info-section"
import { ExperienceSection } from "@/components/profile/experience-section"
import { EducationSection } from "@/components/profile/education-section"
import { ProjectsSection } from "@/components/profile/projects-section"
import { AchievementsSection } from "@/components/profile/achievements-section"
import { useResume } from '@/contexts/resume-context'
import { useToast } from "@/components/ui/custom-toaster"
import { supabase } from '@/lib/supabase'
import { useOkto } from 'okto-sdk-react'
import { Profile } from '@/types/profile'
import { isEqual } from 'lodash'
import { Loader } from "../components/ui/loader"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/hooks/user-auth"

export default function ProfilePage() {
  const { profile, loading: profileLoading, error, updateProfile } = useProfile()
  const { parsedResume } = useResume()
  const { toast } = useToast()
  const { getUserDetails, isLoggedIn } = useOkto()
  const { userDetails } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const fetchExistingProfile = async () => {
      try {
        if (!isLoggedIn) return

        const oktoDetails = await getUserDetails()
        if (!oktoDetails?.user_id) return

        // Fetch profile from Supabase
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', oktoDetails.user_id)
          .single()

        if (profileError) {
          throw profileError
        }

        if (existingProfile) {
          console.log('Loading existing profile:', existingProfile)
          updateProfile(existingProfile)
        }
        
        setIsInitialized(true)
      } catch (error) {
        console.error('Error loading profile:', error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      }
    }

    fetchExistingProfile()
  }, [isLoggedIn, getUserDetails, updateProfile, toast])

  // Debug logging
  useEffect(() => {
    console.log('Profile page mounted/updated:', {
      isLoggedIn,
      profile,
      profileLoading,
      isInitialized
    })
  }, [isLoggedIn, profile, profileLoading, isInitialized])

  // Load parsed resume data when component mounts
  useEffect(() => {
    if (parsedResume && !profile.basic_info.name) {
      updateProfile(parsedResume)
    }
  }, [parsedResume, profile.basic_info.name, updateProfile])

  if (!isInitialized || profileLoading) {
    return <LoadingSpinner />
  }

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md">
          <h2 className="text-lg font-semibold text-red-500 mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button 
          onClick={handleSave}
          className="bg-primary text-white hover:bg-primary/90"
          disabled={!isLoggedIn}
        >
          Save Profile
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <BasicInfoSection />
        </TabsContent>

        <TabsContent value="experience" className="space-y-4">
          <ExperienceSection />
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          <EducationSection />
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <ProjectsSection />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <AchievementsSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
