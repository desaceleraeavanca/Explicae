"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Lock } from "lucide-react"
import { useMemo } from "react"

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  requirement_type: string
  requirement_value: number | null
}

interface UserBadge {
  id: string
  earned_at: string
  badges: BadgeData
}

interface Stats {
  total_analogies: number
  total_favorites: number
  current_streak: number
  longest_streak: number
}

interface BadgesDisplayProps {
  allBadges: BadgeData[]
  userBadges: UserBadge[]
  stats: Stats
  categorizedCount: number
  audienceCount: number
}

export function BadgesDisplay({ allBadges, userBadges, stats, categorizedCount, audienceCount }: BadgesDisplayProps) {
  const earnedBadgeIds = useMemo(() => new Set(userBadges.map((ub) => ub.badges.id)), [userBadges])

  const getBadgeProgress = (badge: BadgeData): { current: number; total: number; percentage: number } => {
    let current = 0
    const total = badge.requirement_value || 0

    switch (badge.requirement_type) {
      case "count":
        current = stats.total_analogies
        break
      case "streak":
        current = Math.max(stats.current_streak, stats.longest_streak)
        break
      case "special":
        if (badge.name.includes("Colecionador")) {
          current = stats.total_favorites
        } else if (badge.name.includes("Explorador")) {
          current = audienceCount
        } else if (badge.name.includes("Organizador")) {
          current = categorizedCount
        }
        break
    }

    const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0

    return { current, total, percentage }
  }

  const earnedBadges = allBadges.filter((badge) => earnedBadgeIds.has(badge.id))
  const lockedBadges = allBadges.filter((badge) => !earnedBadgeIds.has(badge.id))

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Progresso Geral
          </CardTitle>
          <CardDescription>
            Você desbloqueou {earnedBadges.length} de {allBadges.length} conquistas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(earnedBadges.length / allBadges.length) * 100} className="h-3" />
        </CardContent>
      </Card>

      {earnedBadges.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Conquistas Desbloqueadas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {earnedBadges.map((badge) => {
              const userBadge = userBadges.find((ub) => ub.badges.id === badge.id)
              return (
                <Card
                  key={badge.id}
                  className="border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20"
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{badge.icon}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{badge.name}</CardTitle>
                        <CardDescription>{badge.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                      Desbloqueado
                    </Badge>
                    {userBadge && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(userBadge.earned_at).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {lockedBadges.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Conquistas Bloqueadas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lockedBadges.map((badge) => {
              const progress = getBadgeProgress(badge)
              return (
                <Card key={badge.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="text-4xl grayscale">{badge.icon}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {badge.name}
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                        <CardDescription>{badge.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {badge.requirement_value && (
                      <>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-medium">
                              {progress.current} / {progress.total}
                            </span>
                          </div>
                          <Progress value={progress.percentage} className="h-2" />
                        </div>
                        <Badge variant="secondary">
                          {progress.percentage >= 100
                            ? "Pronto para desbloquear!"
                            : `${Math.round(progress.percentage)}% completo`}
                        </Badge>
                      </>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
