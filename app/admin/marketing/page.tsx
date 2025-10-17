import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin-utils"
import { AdminNav } from "@/components/admin/admin-nav"
import { MarketingOverview } from "@/components/admin/marketing-overview"
import { CampaignsList } from "@/components/admin/campaigns-list"
import { SocialMediaStats } from "@/components/admin/social-media-stats"

export default async function AdminMarketingPage() {
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
          <h1 className="text-4xl font-bold mb-2">Marketing e Aquisição</h1>
          <p className="text-muted-foreground">Gerencie campanhas e analise métricas de aquisição</p>
        </div>

        <MarketingOverview />

        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <CampaignsList />
          <SocialMediaStats />
        </div>
      </main>
    </div>
  )
}