import { Card } from "@/components/ui/card"
import { TemplateGenerator } from "@/components/template-generator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Clock, Star } from "lucide-react"

export function TemplatesSection() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Email Templates</h2>
        <p className="text-muted-foreground">
          Generate and manage your personalized email templates for job applications
        </p>
      </div>

      <Tabs defaultValue="generate">
        <TabsList className="mb-4">
          <TabsTrigger value="generate">
            <Mail className="w-4 h-4 mr-2" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="w-4 h-4 mr-2" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="saved">
            <Star className="w-4 h-4 mr-2" />
            Saved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <TemplateGenerator />
        </TabsContent>

        <TabsContent value="recent">
          <div className="text-center text-muted-foreground py-8">
            Your recently generated templates will appear here
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <div className="text-center text-muted-foreground py-8">
            Your saved templates will appear here
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
