import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin-utils"

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
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-2">Gerencie configurações globais do Explicaê</p>
      </div>

      <div className="space-y-6">
        <OpenRouterSettings userId={user.id} />
        <ModelTester />
      </div>
    </div>
  )
}
