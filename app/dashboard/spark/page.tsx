import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
// Removido import do DashboardNav pois j· est· no layout.tsx
import { DailySpark } from "@/components/dashboard/daily-spark"

export default async function DailySparkPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const today = new Date().toISOString().split("T")[0]
  const { data: todaySpark } = await supabase.from("daily_sparks").select("*").eq("spark_date", today).maybeSingle()

  // Get recent sparks
  const { data: recentSparks } = await supabase
    .from("daily_sparks")
    .select("*")
    .order("spark_date", { ascending: false })
    .limit(7)

  return (
    <div className="min-h-screen bg-background">
      {/* DashboardNav removido pois j· est· no layout.tsx */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Fa√≠sca Criativa Di√°ria</h1>
          <p className="text-muted-foreground">Inspire-se com uma nova analogia todos os dias</p>
        </div>

        <DailySpark todaySpark={todaySpark} recentSparks={recentSparks || []} />
      </main>
    </div>
  )
}
