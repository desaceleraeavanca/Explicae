import { AdminSubscriptionsTable } from "@/components/admin-subscriptions-table"

export default function AdminSubscriptionsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Assinaturas</h1>
        <p className="text-muted-foreground mt-2">Visualize e gerencie todas as assinaturas e pagamentos.</p>
      </div>
      <AdminSubscriptionsTable />
    </div>
  )
}
