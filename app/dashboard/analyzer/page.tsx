import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ClarityAnalyzer } from "@/components/dashboard/clarity-analyzer"

export default async function ClarityAnalyzerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Analisador de Clareza</h1>
          <p className="text-muted-foreground">Analise seu texto e descubra onde analogias podem torná-lo mais claro</p>
        </div>

        <ClarityAnalyzer />
      </main>
    </div>
  )
}
