"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUp, ArrowDown, Users, Target, TrendingUp, Share2 } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart } from "recharts"

// Dados mockados para desenvolvimento
const mockData = {
  acquisitionStats: {
    newUsers: { value: 1248, change: 12.5 },
    conversionRate: { value: 8.7, change: 2.1 },
    cac: { value: 18.5, change: -3.2 },
    retentionRate: { value: 72.4, change: 5.8 }
  },
  channelPerformance: [
    { name: "Orgânico", users: 450, conversions: 38 },
    { name: "Social", users: 320, conversions: 24 },
    { name: "Email", users: 280, conversions: 32 },
    { name: "Direto", users: 190, conversions: 28 },
    { name: "Referral", users: 120, conversions: 18 }
  ],
  weeklyTrends: [
    { day: "Seg", users: 120, conversions: 10 },
    { day: "Ter", users: 132, conversions: 12 },
    { day: "Qua", users: 145, conversions: 15 },
    { day: "Qui", users: 155, conversions: 14 },
    { day: "Sex", users: 170, conversions: 18 },
    { day: "Sáb", users: 168, conversions: 16 },
    { day: "Dom", users: 140, conversions: 12 }
  ],
  monthlyTrends: [
    { month: "Jan", users: 850, conversions: 72 },
    { month: "Fev", users: 920, conversions: 80 },
    { month: "Mar", users: 980, conversions: 85 },
    { month: "Abr", users: 1050, conversions: 92 },
    { month: "Mai", users: 1120, conversions: 98 },
    { month: "Jun", users: 1180, conversions: 105 }
  ]
}

export function MarketingOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Novos Usuários" 
          value={mockData.acquisitionStats.newUsers.value} 
          change={mockData.acquisitionStats.newUsers.change}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard 
          title="Taxa de Conversão" 
          value={`${mockData.acquisitionStats.conversionRate.value}%`} 
          change={mockData.acquisitionStats.conversionRate.change}
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard 
          title="CAC (R$)" 
          value={mockData.acquisitionStats.cac.value} 
          change={mockData.acquisitionStats.cac.change}
          isInverted={true}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard 
          title="Taxa de Retenção" 
          value={`${mockData.acquisitionStats.retentionRate.value}%`} 
          change={mockData.acquisitionStats.retentionRate.change}
          icon={<Share2 className="h-4 w-4" />}
        />
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tendências de Aquisição</h2>
          <TabsList>
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium">Usuários e Conversões (Últimos 7 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockData.weeklyTrends}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2} />
                  <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium">Usuários e Conversões (Últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockData.monthlyTrends}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2} />
                  <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData.channelPerformance}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" name="Usuários" fill="#2563eb" />
              <Bar dataKey="conversions" name="Conversões" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ title, value, change, icon, isInverted = false }) {
  const isPositive = isInverted ? change < 0 : change > 0
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? (
            <ArrowUp className="mr-1 h-4 w-4" />
          ) : (
            <ArrowDown className="mr-1 h-4 w-4" />
          )}
          <span>{Math.abs(change)}%</span>
        </div>
      </CardContent>
    </Card>
  )
}