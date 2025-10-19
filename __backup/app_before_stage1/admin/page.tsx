import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin-utils"
import { AdminStats } from "@/components/admin/admin-stats"
import { AdminNav } from "@/components/admin/admin-nav"
import { RecentActivity } from "@/components/admin/recent-activity"
import { SystemHealth } from "@/components/admin/system-health"

export default async function AdminPage() {
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
          <h1 className="text-4xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Visão geral do sistema e métricas principais</p>
        </div>

        <AdminStats />

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <SystemHealth />
          <RecentActivity />
        </div>
      </main>
    </div>
  )
}
