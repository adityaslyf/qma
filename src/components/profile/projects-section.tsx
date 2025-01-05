import { useProfile } from "@/contexts/profile-context"
import { FormSection } from "@/components/ui/form-section"
import { TextField, TextAreaField } from "@/components/ui/form"
import { TechStackField } from "@/components/ui/tech-stack-field"
import { Project } from "@/types/profile"

export function ProjectsSection() {
  const { profile, updateProfile } = useProfile()

  if (!profile) return null

  const handleUpdate = (projects: Project[]) => {
    updateProfile({ projects })
  }

  return (
    <FormSection
      items={profile.projects}
      onAdd={() => {
        handleUpdate([...profile.projects, {
          id: crypto.randomUUID(),
          name: '',
          description: '',
          technologies: [],
          url: '',
          image: '',
          title: '',
        }])
      }}
      onRemove={(index) => {
        handleUpdate(profile.projects.filter((_, i) => i !== index))
      }}
      addButtonText="Add Project"
      renderItem={(project, index) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Project Name"
              value={project.name || ''}
              onChange={value => {
                const newProjects = [...profile.projects]
                newProjects[index] = { ...project, name: value }
                handleUpdate(newProjects)
              }}
            />
            <TextField
              label="URL"
              value={project.url || ''}
              type="url"
              onChange={value => {
                const newProjects = [...profile.projects]
                newProjects[index] = { ...project, url: value }
                handleUpdate(newProjects)
              }}
            />
            <TextField
              label="GitHub URL"
              value={project.githubUrl}
              type="url"
              onChange={value => {
                const newProjects = [...profile.projects]
                newProjects[index] = { ...project, githubUrl: value }
                handleUpdate(newProjects)
              }}
            />
          </div>
          <TextAreaField
            label="Description"
            value={project.description}
            onChange={value => {
              const newProjects = [...profile.projects]
              newProjects[index] = { ...project, description: value }
              handleUpdate(newProjects)
            }}
          />
          <TechStackField
            label="Technologies Used"
            value={project.technologies}
            onChange={technologies => {
              const newProjects = [...profile.projects]
              newProjects[index] = { ...project, technologies }
              handleUpdate(newProjects)
            }}
          />
        </div>
      )}
    />
  )
} 