import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, BookOpen, TrendingUp, Users } from "lucide-react"

const stats = [
  {
    icon: Sparkles,
    label: "Analogias Criadas",
    value: "127",
    change: "+12 esta semana",
    changeType: "positive" as const,
  },
  {
    icon: BookOpen,
    label: "No Banco",
    value: "89",
    change: "23 favoritas",
    changeType: "neutral" as const,
  },
  {
    icon: Users,
    label: "Dialetos Ativos",
    value: "5",
    change: "3 personalizados",
    changeType: "neutral" as const,
  },
  {
    icon: TrendingUp,
    label: "Taxa de Clareza",
    value: "94%",
    change: "+8% este mês",
    changeType: "positive" as const,
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p
                  className={cn(
                    "text-xs mt-2",
                    stat.changeType === "positive" ? "text-secondary" : "text-muted-foreground",
                  )}
                >
                  {stat.change}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
