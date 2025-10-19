import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ClarityAnalyzerForm } from "@/components/clarity-analyzer-form"
import { AnalyzerGuide } from "@/components/analyzer-guide"

export default function AnalyzerPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analisador de Clareza</h1>
              <p className="text-muted-foreground mt-1">
                Avalie a clareza das suas explicações e receba sugestões de melhoria
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ClarityAnalyzerForm />
              </div>
              <div>
                <AnalyzerGuide />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
