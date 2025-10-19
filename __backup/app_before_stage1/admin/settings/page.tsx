import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin-utils"
import { AdminNav } from "@/components/admin/admin-nav"
import { OpenRouterSettings } from "@/components/admin/openrouter-settings"
import { ModelTester } from "@/components/admin/model-tester"

export default async function AdminSettingsPage() {
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
          <h1 className="text-4xl font-bold mb-2">Configurações do Sistema</h1>
          <p className="text-muted-foreground">Gerencie configurações globais do Explicaê</p>
        </div>

        <div className="space-y-6">
          <OpenRouterSettings userId={user.id} />
          <ModelTester />
        </div>
      </main>
    </div>
  )
}
