import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
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
      <DashboardNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Faísca Criativa Diária</h1>
          <p className="text-muted-foreground">Inspire-se com uma nova analogia todos os dias</p>
        </div>

        <DailySpark todaySpark={todaySpark} recentSparks={recentSparks || []} />
      </main>
    </div>
  )
}
