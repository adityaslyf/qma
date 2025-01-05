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
          <AvatarImage src={profile.basic_info.avatar} alt={profile.basic_info.name} />
          <AvatarFallback>
            {profile.basic_info.name?.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <TextField
            label="Full Name"
            value={profile.basic_info.name}
            onChange={value => onUpdate({ basic_info: { ...profile.basic_info, name: value } })}
          />
          <TextField
            label="Profile Title"
            value={profile.basic_info.title}
            onChange={value => onUpdate({ basic_info: { ...profile.basic_info, title: value } })}
          />
        </div>
      </div>

      <TextAreaField
        label="Bio"
        value={profile.basic_info.bio}
        onChange={value => onUpdate({ basic_info: { ...profile.basic_info, bio: value } })}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Email"
          value={profile.basic_info.email}
          type="email"
          onChange={value => onUpdate({ basic_info: { ...profile.basic_info, email: value } })}
        />
        <TextField
          label="Phone"
          value={profile.basic_info.phone}
          onChange={value => onUpdate({ basic_info: { ...profile.basic_info, phone: value } })}
        />
        <TextField
          label="Location"
          value={profile.basic_info.location}
          onChange={value => onUpdate({ basic_info: { ...profile.basic_info, location: value } })}
        />
        <TextField
          label="Desired Role"
          value={profile.basic_info.desiredRole}
          onChange={value => onUpdate({ basic_info: { ...profile.basic_info, desiredRole: value } })}
        />
      </div>
    </div>
  )
}
