// import { useProfile } from "@/contexts/profile-context"
// import { FormSection } from "@/components/ui/form-section"
// import { TextField } from "@/components/ui/form"
// import { TechStackField } from "@/components/ui/tech-stack-field"
// import { Skill } from "@/types/profile"

// export function SkillsSection() {
//   const { profile, updateProfile } = useProfile()

//   if (!profile) return null

//   const handleUpdate = (skills: Skill[]) => {
//     updateProfile({ skills })
//   }

//   return (
//     <FormSection
//       items={profile.skills}
//       onAdd={() => {
//         handleUpdate([...profile.skills, {
//           id: crypto.randomUUID(),
//           category: '',
//           name: '',
//           level: 'beginner',
//           items: []
//         }])
//       }}
//       onRemove={(index) => {
//         handleUpdate(profile.skills.filter((_, i) => i !== index))
//       }}
//       addButtonText="Add Skill Category"
//       renderItem={(skill, index) => (
//         <div className="space-y-4">
//           <TextField
//             label="Category"
//             value={skill.category}
//             onChange={value => {
//               const newSkills = [...profile.skills]
//               newSkills[index] = { ...skill, category: value }
//               handleUpdate(newSkills)
//             }}
//           />
//           <TechStackField
//             label="Skills"
//             value={skill.items}
//             onChange={items => {
//               const newSkills = [...profile.skills]
//               newSkills[index] = { ...skill, items }
//               handleUpdate(newSkills)
//             }}
//           />
//         </div>
//       )}
//     />
//   )
// } 