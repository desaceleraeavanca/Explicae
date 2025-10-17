import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
// Removido import do DashboardNav pois já está no layout.tsx
import { BadgesDisplay } from "@/components/dashboard/badges-display"

export default async function BadgesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all badges
  const { data: allBadges } = await supabase.from("badges").select("*").order("requirement_value", { ascending: true })

  // Fetch user's earned badges
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("*, badges(*)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })

  // Fetch user stats for progress tracking
  const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single()

  // Count analogies with categories
  const { count: categorizedCount } = await supabase
    .from("analogies")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .not("category", "is", null)

  // Count audience profiles
  const { count: audienceCount } = await supabase
    .from("audience_profiles")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <div className="min-h-screen bg-background">
      {/* DashboardNav removido pois já está no layout.tsx */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Conquistas</h1>
          <p className="text-muted-foreground">Acompanhe seu progresso e desbloqueie badges</p>
        </div>

        <BadgesDisplay
          allBadges={allBadges || []}
          userBadges={userBadges || []}
          stats={stats || { total_analogies: 0, total_favorites: 0, current_streak: 0, longest_streak: 0 }}
          categorizedCount={categorizedCount || 0}
          audienceCount={audienceCount || 0}
        />
      </main>
    </div>
  )
}
