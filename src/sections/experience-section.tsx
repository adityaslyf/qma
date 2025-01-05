import { FormSection } from "../sections/form-section"
import { TextField, TextAreaField, TechStackField } from "../sections/form-fields"
import { Experience } from "@/types/profile"

interface ExperienceSectionProps {
  experience: Experience[]
  onUpdate: (experience: Experience[]) => void
}

export function ExperienceSection({ experience, onUpdate }: ExperienceSectionProps) {
  return (
    <FormSection
      items={experience || []}
      onAdd={() => {
        onUpdate([...(experience || []), {
          id: crypto.randomUUID(),
          company: '',
          role: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          employmentType: 'full-time' as const,
          technologies: [],
          highlights: [],
          achievements: [],
          responsibilities: []
        }])
      }}
      onRemove={(index) => {
        onUpdate((experience || []).filter((_, i) => i !== index))
      }}
      addButtonText="Add Experience"
      renderItem={(exp, index) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Company"
              value={exp.company || ''}
              onChange={value => {
                const newExperience = [...(experience || [])]
                newExperience[index] = {
                  ...newExperience[index],
                  company: value
                }
                onUpdate(newExperience)
              }}
            />
            <TextField
              label="Role"
              value={exp.role || ''}
              onChange={value => {
                const newExperience = [...(experience || [])]
                newExperience[index] = {
                  ...newExperience[index],
                  role: value
                }
                onUpdate(newExperience)
              }}
            />
            <TextField
              label="Start Date"
              type="date"
              value={exp.startDate || ''}
              onChange={value => {
                const newExperience = [...(experience || [])]
                newExperience[index] = {
                  ...newExperience[index],
                  startDate: value
                }
                onUpdate(newExperience)
              }}
            />
            <TextField
              label="End Date"
              type="date"
              value={exp.endDate || ''}
              onChange={value => {
                const newExperience = [...(experience || [])]
                newExperience[index] = {
                  ...newExperience[index],
                  endDate: value
                }
                onUpdate(newExperience)
              }}
            />
          </div>
          <TextAreaField
            label="Description"
            value={exp.description || ''}
            onChange={value => {
              const newExperience = [...(experience || [])]
              newExperience[index] = {
                ...newExperience[index],
                description: value
              }
              onUpdate(newExperience)
            }}
          />
          <TechStackField
            label="Technologies Used"
            technologies={exp.technologies || []}
            onAdd={tech => {
              const newExperience = [...(experience || [])]
              newExperience[index] = {
                ...newExperience[index],
                technologies: [...(exp.technologies || []), tech]
              }
              onUpdate(newExperience)
            }}
            onRemove={techIndex => {
              const newExperience = [...(experience || [])]
              newExperience[index] = {
                ...newExperience[index],
                technologies: (exp.technologies || []).filter((_, i) => i !== techIndex)
              }
              onUpdate(newExperience)
            }}
          />
        </div>
      )}
    />
  )
}
