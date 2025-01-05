import { FormSection } from "./form-section"
import { TextField } from "./form-fields"
import { Education } from "@/types/profile"

export function EducationSection({
  education,
  onUpdate
}: {
  education: Education[]
  onUpdate: (education: Education[]) => void
}) {
  return (
    <FormSection
      items={education}
      onAdd={() => {
        onUpdate([...education, {
          id: crypto.randomUUID(),
          institution: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          grade: '',
          activities: ''
        }])
      }}
      onRemove={(index) => {
        onUpdate(education.filter((_, i) => i !== index))
      }}
      addButtonText="Add Education"
      renderItem={(edu, index) => (
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Institution"
            value={edu.institution}
            onChange={value => {
              const newEducation = [...education]
              newEducation[index].institution = value
              onUpdate(newEducation)
            }}
          />
          <TextField
            label="Degree"
            value={edu.degree}
            onChange={value => {
              const newEducation = [...education]
              newEducation[index].degree = value
              onUpdate(newEducation)
            }}
          />
          <TextField
            label="Field of Study"
            value={edu.field}
            onChange={value => {
              const newEducation = [...education]
              newEducation[index].field = value
              onUpdate(newEducation)
            }}
          />
          <TextField
            label="Grade"
            value={edu.grade || ''}
            onChange={value => {
              const newEducation = [...education]
              newEducation[index].grade = value
              onUpdate(newEducation)
            }}
          />
          <TextField
            label="Start Date"
            type="date"
            value={edu.startDate}
            onChange={value => {
              const newEducation = [...education]
              newEducation[index].startDate = value
              onUpdate(newEducation)
            }}
          />
          <TextField
            label="End Date"
            type="date"
            value={edu.endDate}
            onChange={value => {
              const newEducation = [...education]
              newEducation[index].endDate = value
              onUpdate(newEducation)
            }}
          />
        </div>
      )}
    />
  )
}
