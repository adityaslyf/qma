import { Profile } from "@/types/profile"
import { TextField, TextAreaField } from "../sections/form-fields"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avtar"

interface BasicInfoSectionProps {
  profile: Profile
  onUpdate: (profile: Partial<Profile>) => void
}

export function BasicInfoSection({ profile, onUpdate }: BasicInfoSectionProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.avatar} alt={profile.name} />
          <AvatarFallback>
            {profile.name?.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <TextField
            label="Full Name"
            value={profile.name}
            onChange={value => onUpdate({ name: value })}
          />
          <TextField
            label="Profile Title"
            value={profile.title}
            onChange={value => onUpdate({ title: value })}
          />
        </div>
      </div>

      <TextAreaField
        label="Bio"
        value={profile.bio}
        onChange={value => onUpdate({ bio: value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Email"
          value={profile.email}
          type="email"
          onChange={value => onUpdate({ email: value })}
        />
        <TextField
          label="Phone"
          value={profile.phone}
          onChange={value => onUpdate({ phone: value })}
        />
        <TextField
          label="Location"
          value={profile.location}
          onChange={value => onUpdate({ location: value })}
        />
        <TextField
          label="Desired Role"
          value={profile.desiredRole}
          onChange={value => onUpdate({ desiredRole: value })}
        />
      </div>
    </div>
  )
}
