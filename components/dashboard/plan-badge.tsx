import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap, Crown } from "lucide-react"

interface PlanBadgeProps {
  planType: string
  subscriptionStatus: string
}

export function PlanBadge({ planType, subscriptionStatus }: PlanBadgeProps) {
  const getPlanInfo = () => {
    switch (planType) {
      case "gratuito":
        return { label: "Descoberta", icon: Sparkles, variant: "secondary" as const }
      case "credito":
        return { label: "Pacote de Faíscas", icon: Zap, variant: "default" as const }
      case "mensal":
        return { label: "Clareza", icon: Crown, variant: "default" as const }
      case "anual":
        return { label: "Maestria", icon: Crown, variant: "default" as const }
      case "admin":
        return { label: "Admin", icon: Crown, variant: "destructive" as const }
      default:
        return { label: planType, icon: Sparkles, variant: "secondary" as const }
    }
  }

  const info = getPlanInfo()
  const Icon = info.icon

  return (
    <Badge variant={info.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {info.label}
      {subscriptionStatus === "pendente" && " (Pendente)"}
      {subscriptionStatus === "cancelada" && " (Cancelada)"}
    </Badge>
  )
}
