import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Shield, Users, Activity, AlertTriangle } from "lucide-react"

export async function SecurityOverview() {
  const supabase = await createClient()

  // Get total audit logs
  const { count: totalLogs } = await supabase.from("audit_logs").select("*", { count: "exact", head: true })

  // Get logs from last 24 hours
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const { count: recentLogs } = await supabase
    .from("audit_logs")
    .select("*", { count: "exact", head: true })
    .gte("created_at", yesterday.toISOString())

  // Get unique users who performed actions
  const { data: uniqueUsers } = await supabase.from("audit_logs").select("user_id").not("user_id", "is", null)

  const activeUsers = new Set(uniqueUsers?.map((log) => log.user_id)).size

  // Get failed login attempts (placeholder - would need auth logs)
  const failedAttempts = 0

  const metrics = [
    {
      title: "Total de Logs",
      value: totalLogs || 0,
      icon: Activity,
      description: "Ações registradas",
      color: "text-blue-600",
    },
    {
      title: "Atividade Recente",
      value: recentLogs || 0,
      icon: Shield,
      description: "Últimas 24 horas",
      color: "text-green-600",
    },
    {
      title: "Usuários Ativos",
      value: activeUsers,
      icon: Users,
      description: "Com ações registradas",
      color: "text-purple-600",
    },
    {
      title: "Tentativas Falhadas",
      value: failedAttempts,
      icon: AlertTriangle,
      description: "Login/Acesso",
      color: "text-red-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 bg-muted rounded-lg ${metric.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{metric.title}</h3>
            <p className="text-3xl font-bold mb-1">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </Card>
        )
      })}
    </div>
  )
}
