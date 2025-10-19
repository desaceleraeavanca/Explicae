import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin-utils"

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
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dados</h1>
        <p className="text-muted-foreground mt-2">Visualize e gerencie os dados do sistema</p>
      </div>

      <DatabaseOverview />

      <div className="mt-6">
        <TablesList />
      </div>
    </div>
  )
}