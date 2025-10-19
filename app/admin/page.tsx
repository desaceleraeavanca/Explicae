import { AdminOverview } from "@/components/admin-overview"

export default function AdminPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe métricas principais, status do sistema e atividades recentes.
        </p>
      </div>
      <AdminOverview />
    </div>
  )
}
