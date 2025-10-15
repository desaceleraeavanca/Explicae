import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin-utils"
import { AdminNav } from "@/components/admin/admin-nav"
import { DatabaseOverview } from "@/components/admin/database-overview"
import { TablesList } from "@/components/admin/tables-list"

export default async function AdminDataPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isAdmin(user.id))) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gerenciamento de Dados</h1>
          <p className="text-muted-foreground">Visualize e gerencie os dados do sistema</p>
        </div>

        <DatabaseOverview />

        <div className="mt-6">
          <TablesList />
        </div>
      </main>
    </div>
  )
}