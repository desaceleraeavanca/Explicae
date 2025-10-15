"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function RevenueChart() {
  // Placeholder data - to be replaced with real data from Kiwify webhook
  const data = [
    { month: "Jan", revenue: 0 },
    { month: "Fev", revenue: 0 },
    { month: "Mar", revenue: 0 },
    { month: "Abr", revenue: 0 },
    { month: "Mai", revenue: 0 },
    { month: "Jun", revenue: 0 },
  ]

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Receita Mensal</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-sm text-muted-foreground mt-4">
        Integre com o webhook do Kiwify para visualizar dados reais de receita
      </p>
    </Card>
  )
}
