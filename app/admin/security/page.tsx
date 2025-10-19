import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin-utils"

import { SecurityOverview } from "@/components/admin/security-overview"
import { AuditLogs } from "@/components/admin/audit-logs"

export default async function AdminSecurityPage() {
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
        <h1 className="text-3xl font-bold text-foreground">Segurança</h1>
        <p className="text-muted-foreground mt-2">Monitoramento e políticas de segurança</p>
      </div>

      <SecurityOverview />

      <div className="mt-6">
        <AuditLogs />
      </div>
    </div>
  )
}
