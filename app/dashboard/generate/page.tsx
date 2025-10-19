import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { AnalogyGenerationForm } from "@/components/analogy-generation-form"
import { GenerationTips } from "@/components/generation-tips"

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gerar Nova Analogia</h1>
              <p className="text-muted-foreground mt-1">
                Transforme conceitos complexos em explicações claras e memoráveis
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AnalogyGenerationForm />
              </div>
              <div>
                <GenerationTips />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
