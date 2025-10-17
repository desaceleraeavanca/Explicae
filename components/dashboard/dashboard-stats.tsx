import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Star, Flame, Trophy } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    total_analogies: number
    total_favorites: number
    current_streak: number
    longest_streak: number
  }
  badgesCount: number
}

export function DashboardStats({ stats, badgesCount }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Analogias Criadas",
      value: stats.total_analogies,
      icon: Sparkles,
      color: "text-amber-500",
    },
    {
      title: "Favoritas",
      value: stats.total_favorites,
      icon: Star,
      color: "text-yellow-500",
    },
    {
      title: "Sequência Atual",
      value: `${stats.current_streak} dias`,
      icon: Flame,
      color: "text-orange-500",
    },
    {
      title: "Conquistas",
      value: badgesCount,
      icon: Trophy,
      color: "text-purple-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
