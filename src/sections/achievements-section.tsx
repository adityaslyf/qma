import { FormSection } from "../sections/form-section"
import { TextField, TextAreaField } from "../sections/form-fields"
import { Achievement } from "@/types/profile"

interface AchievementsSectionProps {
  achievements: Achievement[]
  onUpdate: (achievements: Achievement[]) => void
}

export function AchievementsSection({ achievements, onUpdate }: AchievementsSectionProps) {
  return (
    <FormSection
      items={achievements}
      onAdd={() => {
        onUpdate([...achievements, {
          id: crypto.randomUUID(),
          title: '',
          description: '',
          date: '',
          category: 'other' as const,
          url: '',
          issuer: '',
          impact: ''
        }])
      }}
      onRemove={(index) => {
        onUpdate(achievements.filter((_, i) => i !== index))
      }}
      addButtonText="Add Achievement"
      renderItem={(achievement, index) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Achievement Title"
              value={achievement.title}
              onChange={value => {
                const newAchievements = [...achievements]
                newAchievements[index].title = value
                onUpdate(newAchievements)
              }}
            />
            <TextField
              label="Date"
              type="date"
              value={achievement.date}
              onChange={value => {
                const newAchievements = [...achievements]
                newAchievements[index].date = value
                onUpdate(newAchievements)
              }}
            />
          </div>
          <TextAreaField
            label="Description"
            value={achievement.description}
            onChange={value => {
              const newAchievements = [...achievements]
              newAchievements[index].description = value
              onUpdate(newAchievements)
            }}
          />
        </div>
      )}
    />
  )
}
