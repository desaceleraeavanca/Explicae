import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
// Removido import do DashboardNav pois já está no layout.tsx
import { AnalogyBank } from "@/components/dashboard/analogy-bank"

export default async function AnalogyBankPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: analogies } = await supabase
    .from("analogies")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      {/* DashboardNav removido pois já está no layout.tsx */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Banco de Analogias</h1>
          <p className="text-muted-foreground">Gerencie, organize e favorite suas analogias</p>
        </div>

        <AnalogyBank initialAnalogies={analogies || []} />
      </main>
    </div>
  )
}
