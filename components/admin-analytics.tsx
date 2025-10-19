"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, BookOpen, Target, Download } from "lucide-react"

const metrics = [
  { label: "Usuários Ativos (30d)", value: "2,847", change: "+12.5%", icon: Users },
  { label: "Analogias Criadas (30d)", value: "18,392", change: "+8.2%", icon: BookOpen },
  { label: "Taxa de Engajamento", value: "68.4%", change: "+5.1%", icon: Target },
  { label: "Crescimento MoM", value: "22.1%", change: "+3.2%", icon: TrendingUp },
]

export function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-bold mt-2">{metric.value}</p>
                  <p className="text-sm text-green-600 mt-2">{metric.change}</p>
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
          <h3 className="text-lg font-semibold mb-4">Crescimento de Usuários</h3>
          <div className="h-64 flex items-center justify-center bg-accent/20 rounded-lg">
            <p className="text-muted-foreground">Gráfico de crescimento de usuários</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribuição de Planos</h3>
          <div className="h-64 flex items-center justify-center bg-accent/20 rounded-lg">
            <p className="text-muted-foreground">Gráfico de distribuição de planos</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Analogias por Categoria</h3>
          <div className="h-64 flex items-center justify-center bg-accent/20 rounded-lg">
            <p className="text-muted-foreground">Gráfico de categorias</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Receita Mensal</h3>
          <div className="h-64 flex items-center justify-center bg-accent/20 rounded-lg">
            <p className="text-muted-foreground">Gráfico de receita</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
