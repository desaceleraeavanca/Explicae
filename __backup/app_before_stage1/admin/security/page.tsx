import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin-utils"
import { AdminNav } from "@/components/admin/admin-nav"
import { AuditLogs } from "@/components/admin/audit-logs"
import { SecurityOverview } from "@/components/admin/security-overview"

export default async function AdminSecurityPage() {
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
          <h1 className="text-4xl font-bold mb-2">Segurança e Auditoria</h1>
          <p className="text-muted-foreground">Monitore acessos e ações do sistema</p>
        </div>

        <SecurityOverview />

        <div className="mt-6">
          <AuditLogs />
        </div>
      </main>
    </div>
  )
}
