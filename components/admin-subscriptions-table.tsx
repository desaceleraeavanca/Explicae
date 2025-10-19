"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

const subscriptionStats = [
  { label: "Receita Mensal", value: "R$ 45.890", change: "+22.1%", icon: TrendingUp },
  { label: "Assinantes Ativos", value: "1,234", change: "+15.3%", icon: CheckCircle },
  { label: "Taxa de Cancelamento", value: "2.3%", change: "-0.5%", icon: AlertCircle },
  { label: "Ticket Médio", value: "R$ 37,20", change: "+8.2%", icon: CreditCard },
]

const recentTransactions = [
  { id: 1, user: "Maria Silva", plan: "Pro Anual", amount: "R$ 348,00", status: "success", date: "2024-10-18" },
  { id: 2, user: "João Santos", plan: "Pro Mensal", amount: "R$ 39,00", status: "success", date: "2024-10-18" },
  { id: 3, user: "Ana Costa", plan: "Básico Mensal", amount: "R$ 19,00", status: "failed", date: "2024-10-17" },
  { id: 4, user: "Pedro Lima", plan: "Pro Mensal", amount: "R$ 39,00", status: "pending", date: "2024-10-17" },
  { id: 5, user: "Carla Mendes", plan: "Pro Anual", amount: "R$ 348,00", status: "success", date: "2024-10-16" },
]

export function AdminSubscriptionsTable() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {subscriptionStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-2">{stat.change}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Transações Recentes</h3>
          <Button variant="outline" size="sm">
            Ver Todas
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usuário</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plano</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Valor</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                  <td className="py-4 px-4 font-medium text-foreground">{transaction.user}</td>
                  <td className="py-4 px-4 text-muted-foreground">{transaction.plan}</td>
                  <td className="py-4 px-4 font-medium text-foreground">{transaction.amount}</td>
                  <td className="py-4 px-4">
                    <Badge
                      variant={
                        transaction.status === "success"
                          ? "default"
                          : transaction.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {transaction.status === "success"
                        ? "Aprovado"
                        : transaction.status === "pending"
                          ? "Pendente"
                          : "Falhou"}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Button variant="ghost" size="sm">
                      Ver Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
