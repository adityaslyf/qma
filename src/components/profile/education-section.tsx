import { useProfile } from "@/contexts/profile-context"
import { FormSection } from "@/components/ui/form-section"
import { TextField } from "@/components/ui/form"
import { Education } from "@/types/profile"

export function EducationSection() {
  const { profile, updateProfile } = useProfile()

  if (!profile) return null

  const handleUpdate = (education: Education[]) => {
    updateProfile({ education })
  }

  return (
    <FormSection
      items={profile.education}
      onAdd={() => {
        handleUpdate([...profile.education, {
          id: crypto.randomUUID(),
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          grade: "",
          activities: ""
        }])
      }}
      onRemove={(index) => {
        handleUpdate(profile.education.filter((_, i) => i !== index))
      }}
      addButtonText="Add Education"
      renderItem={(edu, index) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Institution"
              value={edu.institution}
              onChange={value => {
                const newEducation = [...profile.education]
                newEducation[index] = { ...edu, institution: value }
                handleUpdate(newEducation)
              }}
            />
            <TextField
              label="Degree"
              value={edu.degree}
              onChange={value => {
                const newEducation = [...profile.education]
                newEducation[index] = { ...edu, degree: value }
                handleUpdate(newEducation)
              }}
            />
            <TextField
              label="Field of Study"
              value={edu.field}
              onChange={value => {
                const newEducation = [...profile.education]
                newEducation[index] = { ...edu, field: value }
                handleUpdate(newEducation)
              }}
            />
            <TextField
              label="Grade"
              value={edu.grade}
              onChange={value => {
                const newEducation = [...profile.education]
                newEducation[index] = { ...edu, grade: value }
                handleUpdate(newEducation)
              }}
            />
            <TextField
              label="Start Date"
              type="date"
              value={edu.startDate}
              onChange={value => {
                const newEducation = [...profile.education]
                newEducation[index] = { ...edu, startDate: value }
                handleUpdate(newEducation)
              }}
            />
            <TextField
              label="End Date"
              type="date"
              value={edu.endDate}
              onChange={value => {
                const newEducation = [...profile.education]
                newEducation[index] = { ...edu, endDate: value }
                handleUpdate(newEducation)
              }}
            />
          </div>
        </div>
      )}
    />
  )
} 