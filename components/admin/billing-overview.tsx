import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react"

export async function BillingOverview() {
  const supabase = await createClient()

  // Get paid users count
  const { count: paidUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .in("plan_type", ["credito", "mensal", "anual"])
    .eq("subscription_status", "ativa")

  // Get monthly subscribers
  const { count: monthlySubscribers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("plan_type", "mensal")
    .eq("subscription_status", "ativa")

  // Get annual subscribers
  const { count: annualSubscribers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("plan_type", "anual")
    .eq("subscription_status", "ativa")

  // Calculate MRR (Monthly Recurring Revenue)
  const monthlyMRR = (monthlySubscribers || 0) * 24.9
  const annualMRR = ((annualSubscribers || 0) * 249) / 12
  const totalMRR = monthlyMRR + annualMRR

  // Get total users for CAC calculation
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  // Estimated CAC (Customer Acquisition Cost) - placeholder
  const estimatedCAC = 50 // R$ 50 per customer (to be integrated with marketing data)

  const metrics = [
    {
      title: "MRR (Receita Mensal Recorrente)",
      value: `R$ ${totalMRR.toFixed(2)}`,
      icon: DollarSign,
      description: `${paidUsers || 0} assinantes ativos`,
      trend: "+0%",
    },
    {
      title: "ARR (Receita Anual Recorrente)",
      value: `R$ ${(totalMRR * 12).toFixed(2)}`,
      icon: TrendingUp,
      description: "Projeção anual",
      trend: "+0%",
    },
    {
      title: "Taxa de Conversão",
      value: `${(((paidUsers || 0) / (totalUsers || 1)) * 100).toFixed(1)}%`,
      icon: Users,
      description: "Gratuito → Pago",
      trend: "+0%",
    },
    {
      title: "CAC (Custo de Aquisição)",
      value: `R$ ${estimatedCAC.toFixed(2)}`,
      icon: CreditCard,
      description: "Por cliente",
      trend: "-5%",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-green-600">{metric.trend}</span>
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
