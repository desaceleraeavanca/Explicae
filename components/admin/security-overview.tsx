"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Shield, Users, Activity, AlertTriangle } from "lucide-react"

// Dados mockados para desenvolvimento
const MOCK_SECURITY_DATA = {
  totalLogs: 157,
  recentLogs: 23,
  activeUsers: 8,
  failedAttempts: 3
}

export function SecurityOverview() {
  const [securityData] = useState(MOCK_SECURITY_DATA)
  const [loading] = useState(false)

  const metrics = [
    {
      title: "Total de Logs",
      value: securityData.totalLogs,
      icon: Activity,
      description: "Ações registradas",
      color: "text-blue-600",
    },
    {
      title: "Atividade Recente",
      value: securityData.recentLogs,
      icon: Shield,
      description: "Últimas 24 horas",
      color: "text-green-600",
    },
    {
      title: "Usuários Ativos",
      value: securityData.activeUsers,
      icon: Users,
      description: "Com ações registradas",
      color: "text-purple-600",
    },
    {
      title: "Tentativas Falhas",
      value: securityData.failedAttempts,
      icon: AlertTriangle,
      description: "Logins inválidos",
      color: "text-amber-600",
    },
  ]

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">Carregando...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                <div className="flex items-baseline mt-1">
                  <h3 className="text-2xl font-bold">{metric.value}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              </div>
              <div className={`rounded-full p-2 ${metric.color.replace("text", "bg")} bg-opacity-10`}>
                <Icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
