import { useProfile } from "@/contexts/profile-context"
import { FormSection } from "@/components/ui/form-section"
import { TextField, TextAreaField } from "@/components/ui/form"
import { TechStackField } from "@/components/ui/tech-stack-field"
import { Experience } from "@/types/profile"

export function ExperienceSection() {
  const { profile, updateProfile } = useProfile()

  const handleUpdate = (experiences: Experience[]) => {
    updateProfile({ experience: experiences })
  }

  const updateExperienceItem = (
    index: number, 
    field: keyof Experience, 
    value: string | boolean | string[]
  ) => {
    const newExperience = [...(profile?.experience || [])]
    newExperience[index] = {
      ...newExperience[index],
      [field]: value
    }
    handleUpdate(newExperience)
  }

  return (
    <FormSection<Experience>
      title="Experience"
      items={profile?.experience || []}
      onAdd={() => {
        handleUpdate([...(profile?.experience || []), {
          id: crypto.randomUUID(),
          company: '',
          role: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          employmentType: 'full-time',
          technologies: [],
        }])
      }}
      onRemove={(index) => {
        handleUpdate((profile?.experience || []).filter((_, i) => i !== index))
      }}
      addButtonText="Add Experience"
      renderItem={(exp, index) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Company"
              value={exp.company}
              onChange={(value) => updateExperienceItem(index, 'company', value)}
            />
            <TextField
              label="Role"
              value={exp.role}
              onChange={(value) => updateExperienceItem(index, 'role', value)}
            />
            <TextField
              label="Start Date"
              type="date"
              value={exp.startDate}
              onChange={(value) => updateExperienceItem(index, 'startDate', value)}
            />
            <TextField
              label="End Date"
              type="date"
              value={exp.endDate}
              onChange={(value) => updateExperienceItem(index, 'endDate', value)}
            />
          </div>
          <TextAreaField
            label="Description"
            value={exp.description}
            onChange={(value) => updateExperienceItem(index, 'description', value)}
          />
          <TechStackField
            label="Technologies Used"
            value={exp.technologies}
            onChange={(technologies) => updateExperienceItem(index, 'technologies', technologies)}
          />
        </div>
      )}
    />
  )
} 