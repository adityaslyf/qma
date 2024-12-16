import { FormSection } from "../sections/form-section"
import { TextField, TextAreaField, TechStackField } from "../sections/form-fields"
import { Project } from "@/types/profile"

interface ProjectsSectionProps {
  projects: Project[]
  onUpdate: (projects: Project[]) => void
}

export function ProjectsSection({ projects, onUpdate }: ProjectsSectionProps) {
  return (
    <FormSection
      items={projects}
      onAdd={() => {
        onUpdate([...projects, {
          title: '',
          description: '',
          technologies: [],
          liveUrl: '',
          githubUrl: '',
          image: ''
        }])
      }}
      onRemove={(index) => {
        onUpdate(projects.filter((_, i) => i !== index))
      }}
      addButtonText="Add Project"
      renderItem={(project, index) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Project Title"
              value={project.title}
              onChange={value => {
                const newProjects = [...projects]
                newProjects[index].title = value
                onUpdate(newProjects)
              }}
            />
            <TextField
              label="Image URL"
              value={project.image || ''}
              onChange={value => {
                const newProjects = [...projects]
                newProjects[index].image = value
                onUpdate(newProjects)
              }}
            />
            <TextField
              label="Live URL"
              value={project.liveUrl || ''}
              type="url"
              onChange={value => {
                const newProjects = [...projects]
                newProjects[index].liveUrl = value
                onUpdate(newProjects)
              }}
            />
            <TextField
              label="GitHub URL"
              value={project.githubUrl || ''}
              type="url"
              onChange={value => {
                const newProjects = [...projects]
                newProjects[index].githubUrl = value
                onUpdate(newProjects)
              }}
            />
          </div>
          <TextAreaField
            label="Description"
            value={project.description}
            onChange={value => {
              const newProjects = [...projects]
              newProjects[index].description = value
              onUpdate(newProjects)
            }}
          />
          <TechStackField
            label="Technologies Used"
            technologies={project.technologies}
            onAdd={tech => {
              const newProjects = [...projects]
              newProjects[index].technologies = [...project.technologies, tech]
              onUpdate(newProjects)
            }}
            onRemove={techIndex => {
              const newProjects = [...projects]
              newProjects[index].technologies = project.technologies.filter((_, i) => i !== techIndex)
              onUpdate(newProjects)
            }}
          />
        </div>
      )}
    />
  )
}
