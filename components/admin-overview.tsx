"use client"

import { Card } from "@/components/ui/card"
import { Users, BookOpen, CreditCard, TrendingUp, AlertCircle, Sparkles } from "lucide-react"

const stats = [
  { label: "Total de Usuários", value: "2,847", change: "+12.5%", icon: Users, trend: "up" },
  { label: "Analogias Criadas", value: "18,392", change: "+8.2%", icon: BookOpen, trend: "up" },
  { label: "Assinantes Ativos", value: "1,234", change: "+15.3%", icon: CreditCard, trend: "up" },
  { label: "Receita Mensal", value: "R$ 45.890", change: "+22.1%", icon: TrendingUp, trend: "up" },
  { label: "Itens Pendentes", value: "23", change: "-5", icon: AlertCircle, trend: "down" },
  { label: "Taxa de Conversão", value: "43.2%", change: "+3.1%", icon: Sparkles, trend: "up" },
]

const recentActivity = [
  { user: "Maria Silva", action: "criou uma nova analogia", time: "2 min atrás", type: "create" },
  { user: "João Santos", action: "assinou o plano Pro", time: "15 min atrás", type: "subscription" },
  { user: "Ana Costa", action: "reportou conteúdo", time: "1 hora atrás", type: "report" },
  { user: "Pedro Lima", action: "cancelou assinatura", time: "2 horas atrás", type: "cancel" },
  { user: "Carla Mendes", action: "atingiu 100 analogias", time: "3 horas atrás", type: "milestone" },
]

export function AdminOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  <p className={`text-sm mt-2 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {stat.change} vs. mês anterior
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "create"
                      ? "bg-blue-500"
                      : activity.type === "subscription"
                        ? "bg-green-500"
                        : activity.type === "report"
                          ? "bg-red-500"
                          : activity.type === "cancel"
                            ? "bg-orange-500"
                            : "bg-purple-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Alertas do Sistema</h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700">3 conteúdos aguardando moderação</p>
                  <p className="text-xs text-red-600 mt-1">Reportados por múltiplos usuários</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-700">15 pagamentos falharam</p>
                  <p className="text-xs text-orange-600 mt-1">Nas últimas 24 horas</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-700">Pico de uso detectado</p>
                  <p className="text-xs text-blue-600 mt-1">150% acima da média</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
