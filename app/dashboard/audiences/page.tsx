import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { AudienceProfiles } from "@/components/dashboard/audience-profiles"

export default async function AudienceProfilesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: audiences } = await supabase
    .from("audience_profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Perfis de Público-Alvo</h1>
          <p className="text-muted-foreground">Crie perfis reutilizáveis para seus públicos mais frequentes</p>
        </div>

        <AudienceProfiles initialAudiences={audiences || []} />
      </main>
    </div>
  )
}
