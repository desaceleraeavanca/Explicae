import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Users, Sparkles, DollarSign, TrendingUp, Activity, UserCheck } from "lucide-react"

export async function AdminStats() {
  const supabase = await createClient()

  // Get total users
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  // Get active users (generated in last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: activeUserIds } = await supabase
    .from("generations")
    .select("user_id")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .not("user_id", "is", null)

  const activeUsers = new Set(activeUserIds?.map((g) => g.user_id)).size

  // Get total generations
  const { count: totalGenerations } = await supabase.from("generations").select("*", { count: "exact", head: true })

  // Get generations this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: monthlyGenerations } = await supabase
    .from("generations")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString())

  // Get paid users
  const { count: paidUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .in("plan_type", ["credito", "mensal", "anual"])
    .eq("subscription_status", "ativa")

  // Get new users this month
  const { count: newUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString())

  const stats = [
    {
      title: "Total de Usuários",
      value: totalUsers || 0,
      icon: Users,
      description: `${newUsers || 0} novos este mês`,
      trend: "+12%",
    },
    {
      title: "Usuários Ativos",
      value: activeUsers || 0,
      icon: Activity,
      description: "Últimos 30 dias",
      trend: "+8%",
    },
    {
      title: "Usuários Pagantes",
      value: paidUsers || 0,
      icon: UserCheck,
      description: `${(((paidUsers || 0) / (totalUsers || 1)) * 100).toFixed(1)}% conversão`,
      trend: "+15%",
    },
    {
      title: "Analogias Geradas",
      value: totalGenerations || 0,
      icon: Sparkles,
      description: `${monthlyGenerations || 0} este mês`,
      trend: "+23%",
    },
    {
      title: "Receita Mensal (MRR)",
      value: "R$ 0",
      icon: DollarSign,
      description: "Integrar com Kiwify",
      trend: "+0%",
    },
    {
      title: "Taxa de Crescimento",
      value: "12%",
      icon: TrendingUp,
      description: "Mês a mês",
      trend: "+3%",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-green-600">{stat.trend}</span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </Card>
        )
      })}
    </div>
  )
}
