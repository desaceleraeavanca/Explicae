import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { AnalogyBankHeader } from "@/components/analogy-bank-header"
import { AnalogyBankGrid } from "@/components/analogy-bank-grid"

export default function AnalogiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Banco de Analogias</h1>
              <p className="text-muted-foreground mt-1">Gerencie e organize todas as suas analogias criadas</p>
            </div>

            <AnalogyBankHeader />
            <AnalogyBankGrid />
          </div>
        </main>
      </div>
    </div>
  )
}
