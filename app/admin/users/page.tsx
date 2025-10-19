import { AdminUsersTable } from "@/components/admin-users-table"

export default function AdminUsersPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
        <p className="text-muted-foreground mt-2">Visualize e gerencie todos os usuários da plataforma.</p>
      </div>
      <AdminUsersTable />
    </div>
  )
}
