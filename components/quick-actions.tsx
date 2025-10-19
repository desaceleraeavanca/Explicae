import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, BookOpen, Users, BarChart3 } from "lucide-react"

const actions = [
  {
    icon: Sparkles,
    label: "Nova Analogia",
    description: "Criar uma nova analogia",
    href: "/dashboard/generate",
    color: "primary" as const,
  },
  {
    icon: BookOpen,
    label: "Explorar Banco",
    description: "Ver analogias salvas",
    href: "/dashboard/analogies",
    color: "secondary" as const,
  },
  {
    icon: Users,
    label: "Gerenciar Dialetos",
    description: "Editar audiências",
    href: "/dashboard/dialects",
    color: "accent" as const,
  },
  {
    icon: BarChart3,
    label: "Analisar Texto",
    description: "Verificar clareza",
    href: "/dashboard/analyzer",
    color: "primary" as const,
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.label}
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 bg-transparent"
              asChild
            >
              <a href={action.href}>
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center",
                    action.color === "primary" && "bg-primary/10",
                    action.color === "secondary" && "bg-secondary/10",
                    action.color === "accent" && "bg-accent/50",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      action.color === "primary" && "text-primary",
                      action.color === "secondary" && "text-secondary",
                      action.color === "accent" && "text-accent-foreground",
                    )}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </a>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
