import { useProfile } from "@/contexts/profile-context"
import { FormSection } from "@/components/ui/form-section"
import { TextField, TextAreaField } from "@/components/ui/form"
import { Achievement } from "@/types/profile"

export function AchievementsSection() {
  const { profile, updateProfile } = useProfile()

  if (!profile) return null

  const handleUpdate = (achievements: Achievement[]) => {
    updateProfile({ achievements })
  }

  return (
    <FormSection
      items={profile.achievements}
      onAdd={() => {
        handleUpdate([...profile.achievements, {
          id: crypto.randomUUID(),
          title: '',
          description: '',
          date: '',
          url: '',
          category: 'other',
          issuer: '',
          impact: ''
        }])
      }}
      onRemove={(index) => {
        handleUpdate(profile.achievements.filter((_, i) => i !== index))
      }}
      addButtonText="Add Achievement"
      renderItem={(achievement, index) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Title"
              value={achievement.title}
              onChange={value => {
                const newAchievements = [...profile.achievements]
                newAchievements[index] = { ...achievement, title: value }
                handleUpdate(newAchievements)
              }}
            />
            <TextField
              label="Date"
              type="date"
              value={achievement.date}
              onChange={value => {
                const newAchievements = [...profile.achievements]
                newAchievements[index] = { ...achievement, date: value }
                handleUpdate(newAchievements)
              }}
            />
          </div>
          <TextAreaField
            label="Description"
            value={achievement.description}
            onChange={value => {
              const newAchievements = [...profile.achievements]
              newAchievements[index] = { ...achievement, description: value }
              handleUpdate(newAchievements)
            }}
          />
          <TextField
            label="URL"
            type="url"
            value={achievement.url || ''}
            onChange={value => {
              const newAchievements = [...profile.achievements]
              newAchievements[index] = { ...achievement, url: value }
              handleUpdate(newAchievements)
            }}
          />
        </div>
      )}
    />
  )
} 