import { useProfile } from "@/contexts/profile-context"
import { FormSection } from "@/components/ui/form-section"
import { TextField, TextAreaField } from "@/components/ui/form"
import { TechStackField } from "@/components/ui/tech-stack-field"
import { Experience } from "@/types/profile"

export function ExperienceSection() {
  const { profile, updateProfile } = useProfile()

  if (!profile) return null

  const handleUpdate = (experience: Experience[]) => {
    updateProfile({ experience })
  }

  return (
    <FormSection
      items={profile.experience}
      onAdd={() => {
        handleUpdate([...profile.experience, {
          id: crypto.randomUUID(),
          company: '',
          role: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          employmentType: 'full-time',
          technologies: [],
          highlights: [],
          achievements: [],
          responsibilities: []
        }])
      }}
      onRemove={(index) => {
        handleUpdate(profile.experience.filter((_, i) => i !== index))
      }}
      addButtonText="Add Experience"
      renderItem={(exp, index) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Company"
              value={exp.company}
              onChange={value => {
                const newExperience = [...profile.experience]
                newExperience[index] = { ...exp, company: value }
                handleUpdate(newExperience)
              }}
            />
            <TextField
              label="Role"
              value={exp.role}
              onChange={value => {
                const newExperience = [...profile.experience]
                newExperience[index] = { ...exp, role: value }
                handleUpdate(newExperience)
              }}
            />
            <TextField
              label="Start Date"
              type="date"
              value={exp.startDate}
              onChange={value => {
                const newExperience = [...profile.experience]
                newExperience[index] = { ...exp, startDate: value }
                handleUpdate(newExperience)
              }}
            />
            <TextField
              label="End Date"
              type="date"
              value={exp.endDate}
              onChange={value => {
                const newExperience = [...profile.experience]
                newExperience[index] = { ...exp, endDate: value }
                handleUpdate(newExperience)
              }}
            />
          </div>
          <TextAreaField
            label="Description"
            value={exp.description}
            onChange={value => {
              const newExperience = [...profile.experience]
              newExperience[index] = { ...exp, description: value }
              handleUpdate(newExperience)
            }}
          />
          <TechStackField
            label="Technologies Used"
            value={exp.technologies}
            onChange={technologies => {
              const newExperience = [...profile.experience]
              newExperience[index] = { ...exp, technologies }
              handleUpdate(newExperience)
            }}
          />
        </div>
      )}
    />
  )
} 