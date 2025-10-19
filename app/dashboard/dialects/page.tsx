import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DialectsHeader } from "@/components/dialects-header"
import { DialectsList } from "@/components/dialects-list"
import { CreateDialectDialog } from "@/components/create-dialect-dialog"

export default function DialectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dialetos de Audiência</h1>
              <p className="text-muted-foreground mt-1">
                Crie perfis personalizados para diferentes tipos de audiência
              </p>
            </div>

            <DialectsHeader />
            <DialectsList />
            <CreateDialectDialog />
          </div>
        </main>
      </div>
    </div>
  )
}
