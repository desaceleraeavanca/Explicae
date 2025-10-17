import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
// Removido import do DashboardNav pois j· est· no layout.tsx
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
      {/* DashboardNav removido pois j· est· no layout.tsx */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Analisador de Clareza</h1>
          <p className="text-muted-foreground">Analise seu texto e descubra onde analogias podem torn√°-lo mais claro</p>
        </div>

        <ClarityAnalyzer />
      </main>
    </div>
  )
}
