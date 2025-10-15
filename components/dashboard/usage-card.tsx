import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sparkles } from "lucide-react"
import Link from "next/link"

interface UsageCardProps {
  planType: string
  creditsRemaining?: number
  generationsUsed?: number
  generationsLimit?: number
  trialEndsAt?: string
}

export function UsageCard({
  planType,
  creditsRemaining,
  generationsUsed,
  generationsLimit,
  trialEndsAt,
}: UsageCardProps) {
  const isUnlimited = ["mensal", "anual", "admin", "cortesia", "promo", "parceria", "presente"].includes(planType)
  const isCredits = planType === "credito"
  const isTrial = planType === "gratuito"

  const getTrialDaysRemaining = () => {
    if (!trialEndsAt) return 0
    const now = new Date()
    const end = new Date(trialEndsAt)
    const diff = end.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const trialDays = getTrialDaysRemaining()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Uso do Plano
        </CardTitle>
        <CardDescription>Acompanhe seu consumo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isUnlimited && (
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-primary">Gerações Ilimitadas</p>
            <p className="text-sm text-muted-foreground mt-1">Crie quantas analogias quiser!</p>
          </div>
        )}

        {isCredits && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Créditos restantes:</span>
              <span className="font-semibold">{creditsRemaining || 0}</span>
            </div>
            {creditsRemaining !== undefined && creditsRemaining < 20 && (
              <Button asChild className="w-full" size="sm">
                <Link href="/pricing">Recarregar Créditos</Link>
              </Button>
            )}
          </div>
        )}

        {isTrial && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Gerações utilizadas:</span>
                <span className="font-semibold">
                  {Math.min(generationsUsed || 0, generationsLimit || 100)} / {generationsLimit || 100}
                </span>
              </div>
              <Progress value={((generationsUsed || 0) / (generationsLimit || 100)) * 100} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Dias de teste restantes:</span>
                <span className="font-semibold">{trialDays} dias</span>
              </div>
              <Progress value={(trialDays / 7) * 100} />
            </div>
            <Button asChild className="w-full" size="sm">
              <Link href="/pricing">Fazer Upgrade</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
