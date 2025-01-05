import { useEffect } from 'react'
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

export default function ProfilePage() {
  const { profile, loading: profileLoading, error, updateProfile } = useProfile()
  const { parsedResume } = useResume()
  const { toast } = useToast()
  const { getUserDetails, isLoggedIn } = useOkto()

  useEffect(() => {
    if (parsedResume && Object.keys(parsedResume).length > 0) {
      updateProfile(parsedResume)
    }
  }, [parsedResume])

  useEffect(() => {
    console.log('Profile page mounted/updated:', {
      isLoggedIn,
      profile,
      profileLoading
    })
  }, [isLoggedIn, profile, profileLoading])

  const handleSave = async () => {
    try {
      const oktoDetails = await getUserDetails()
      
      if (!profile || !oktoDetails?.user_id) {
        console.log('No profile or Okto user_id found', {
          hasProfile: !!profile,
          oktoDetails
        });
        toast({
          title: "Error",
          description: "No profile data or user found",
          variant: "destructive",
        })
        return;
      }

      const profileData = {
        user_id: oktoDetails.user_id,
        education: profile.education || [],
        experience: profile.experience || [],
        projects: profile.projects || [],
        achievements: profile.achievements || [],
        basic_info: {
          ...profile.basic_info,
          email: oktoDetails.email
        }
      }

      console.log('Attempting to save profile data:', profileData);

      const { error: supabaseError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'user_id'
        });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw supabaseError;
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
