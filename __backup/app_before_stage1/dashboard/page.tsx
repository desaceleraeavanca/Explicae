import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
// Removido import do DashboardNav pois já está no layout.tsx
import { QuickActions } from "@/components/dashboard/quick-actions"
import { UsageCard } from "@/components/dashboard/usage-card"
import { PlanBadge } from "@/components/dashboard/plan-badge"
import { checkUserAccess } from "@/lib/access-control"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  if (!profile) {
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email || "",
      full_name: user.user_metadata?.full_name || "",
      credits_remaining: 30, // Inicializa com 30 créditos para plano gratuito
    })

    // Create user stats as well
    await supabase.from("user_stats").insert({
      user_id: user.id,
    })

    // Redirect to refresh the page with the new profile
    redirect("/dashboard")
  }

  const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", user.id).maybeSingle()

  // Garantir que o contador de analogias criadas seja exibido corretamente
  // mesmo quando o usuário apaga todas as analogias
  const userStats = stats || { 
    total_analogies: 0, 
    total_favorites: 0, 
    current_streak: 0, 
    longest_streak: 0 
  }

  // Fetch user badges count
  const { count: badgesCount } = await supabase
    .from("user_badges")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Fetch recent analogies - garantindo que não há duplicatas por conceito
  const { data: allAnalogies } = await supabase
    .from("analogies")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    
  // Filtrar analogias para evitar conceitos duplicados
  const uniqueConceptsMap = new Map()
  const recentAnalogies = allAnalogies?.filter(analogy => {
    if (!uniqueConceptsMap.has(analogy.concept)) {
      uniqueConceptsMap.set(analogy.concept, true)
      return true
    }
    return false
  }).slice(0, 5) || []

  const accessInfo = await checkUserAccess(user.id)

// Buscar validade de créditos (fallback para user_credits se perfil não tiver)
const { data: userCredits } = await supabase
  .from("user_credits")
  .select("credits_remaining, expiry_date")
  .eq("user_id", user.id)
  .order("expiry_date", { ascending: true })
  .limit(1)
  .maybeSingle()

const isCreditPlan = profile?.plan_type === 'credito'
const creditsExpiresAtValue = isCreditPlan ? (profile?.credits_expires_at || userCredits?.expiry_date) : undefined
const creditsRemainingValue = isCreditPlan ? (profile?.credits_remaining ?? userCredits?.credits_remaining) : undefined

  return (
    <div className="min-h-screen bg-background">
      {/* DashboardNav removido pois já está no layout.tsx */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Bem-vindo de volta! Continue criando analogias incríveis.</p>
          </div>
          {profile && <PlanBadge planType={profile.plan_type} subscriptionStatus={profile.subscription_status} />}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2">
            <DashboardStats
              stats={userStats}
              badgesCount={badgesCount || 0}
            />
          </div>
          <UsageCard
            planType={profile?.plan_type || "gratuito"}
            creditsRemaining={creditsRemainingValue}
            generationsUsed={accessInfo.generationsUsed}
            generationsLimit={accessInfo.generationsLimit}
            trialEndsAt={profile?.trial_ends_at}
            creditsExpiresAt={creditsExpiresAtValue}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <QuickActions recentAnalogies={recentAnalogies || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
