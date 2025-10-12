import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { AnalogyCreator } from "@/components/dashboard/analogy-creator"

export default async function CreateAnalogyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's audience profiles for quick selection
  const { data: audiences } = await supabase
    .from("audience_profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Criar Nova Analogia</h1>
            <p className="text-muted-foreground">Transforme um conceito complexo em algo memorável</p>
          </div>

          <AnalogyCreator audiences={audiences || []} />
        </div>
      </main>
    </div>
  )
}
