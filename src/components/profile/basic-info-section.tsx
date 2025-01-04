import { useProfile } from "@/contexts/profile-context"
import { TextField, TextAreaField } from "@/components/ui/form"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ImageUpload } from "@/components/ui/image-upload"

export function BasicInfoSection() {
  const { profile, updateProfile } = useProfile()

  if (!profile) return null

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <ImageUpload
          value={profile.avatar}
          onChange={url => updateProfile({ avatar: url })}
          render={({ preview }) => (
            <Avatar className="h-24 w-24">
              <AvatarImage src={preview} alt={profile.name} />
              <AvatarFallback>
                {profile.name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          )}
        />
        <div className="flex-1 space-y-4">
          <TextField
            label="Full Name"
            value={profile.name}
            onChange={value => updateProfile({ name: value })}
          />
          <TextField
            label="Profile Title"
            value={profile.title}
            onChange={value => updateProfile({ title: value })}
          />
        </div>
      </div>

      <TextAreaField
        label="Bio"
        value={profile.bio}
        onChange={value => updateProfile({ bio: value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Email"
          value={profile.email}
          type="email"
          onChange={value => updateProfile({ email: value })}
        />
        <TextField
          label="Phone"
          value={profile.phone}
          onChange={value => updateProfile({ phone: value })}
        />
        <TextField
          label="Location"
          value={profile.location}
          onChange={value => updateProfile({ location: value })}
        />
        <TextField
          label="Desired Role"
          value={profile.desiredRole}
          onChange={value => updateProfile({ desiredRole: value })}
        />
      </div>
    </div>
  )
} 