import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { useProfile } from "@/hooks/profile-hooks"
import { BasicInfoSection } from "../sections/basic-info-section"
import { EducationSection } from "../sections/education-section"
import { ExperienceSection } from "../sections/experience-section"
import { ProjectsSection } from "../sections/projects-section"
import { AchievementsSection } from "../sections/achievements-section"
// import { ResumeDropzone } from "../components/resume-dropzone"
// import { useResumeParser } from "@/hooks/use-resume-parser"
// import toast from 'react-hot-toast'
import { useResume } from '@/contexts/resume-context'
import { useEffect } from 'react'

export default function Profile() {
  const { profile, updateProfile } = useProfile()
  const { parsedResume } = useResume()
  // const { parseResume} = useResumeParser()
  
  // Initialize profile with parsed data when available
  useEffect(() => {
    if (parsedResume) {
      updateProfile(parsedResume)
    }
  }, [parsedResume, updateProfile])

  // const handleResumeParse = async (file: File) => {
  //   const toastId = toast.loading('Parsing resume...')
    
  //   try {
  //     const parsedData = await parseResume(file)
  //     if (parsedData) {
  //       updateProfile(parsedData)
  //       toast.success('Resume parsed successfully', {
  //         id: toastId,
  //       })
  //     } else {
  //       throw new Error('Failed to parse resume')
  //     }
  //   } catch (error) {
  //     console.error('Resume parse error:', error)
  //     toast.error('Failed to parse resume', {
  //       id: toastId,
  //     })
  //   }
  // }

  return (
    <div className="container max-w-6xl py-16">
      {/* <div className="mb-8">
        <ResumeDropzone onParse={handleResumeParse} isProcessing={isProcessing} />
      </div> */}

      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="basic">
            <BasicInfoSection
              profile={profile}
              onUpdate={updateProfile}
            />
          </TabsContent>

          <TabsContent value="education">
            <EducationSection
              education={profile.education}
              onUpdate={education => updateProfile({ education })}
            />
          </TabsContent>

          <TabsContent value="experience">
            <ExperienceSection
              experience={profile.experience}
              onUpdate={experience => updateProfile({ experience })}
            />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsSection
              projects={profile.projects}
              onUpdate={projects => updateProfile({ projects })}
            />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsSection
              achievements={profile.achievements}
              onUpdate={achievements => updateProfile({ achievements })}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
