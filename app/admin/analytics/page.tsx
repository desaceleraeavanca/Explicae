import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin-utils"
import { AdminNav } from "@/components/admin/admin-nav"

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isAdmin(user.id))) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Métricas e Analytics</h1>
          <p className="text-muted-foreground">Análise detalhada de uso e desempenho do sistema</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Métricas principais */}
          <MetricCard 
            title="Analogias Geradas" 
            value="1,234" 
            trend="+12%" 
            description="Últimos 30 dias" 
          />
          <MetricCard 
            title="Taxa de Conversão" 
            value="8.7%" 
            trend="+2.1%" 
            description="Visitantes → Cadastros" 
          />
          <MetricCard 
            title="Tempo Médio" 
            value="4:32" 
            trend="-0:18" 
            description="Duração por sessão" 
          />
          <MetricCard 
            title="Usuários Ativos" 
            value="578" 
            trend="+23%" 
            description="Diários (DAU)" 
          />
          <MetricCard 
            title="Retenção" 
            value="68%" 
            trend="+5%" 
            description="Após 7 dias" 
          />
          <MetricCard 
            title="Analogias/Usuário" 
            value="5.3" 
            trend="+0.8" 
            description="Média mensal" 
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <UsageChart />
          <RetentionChart />
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <TopContentTable />
          <UserSegmentChart />
        </div>
      </main>
    </div>
  )
}

function MetricCard({ title, value, trend, description }) {
  const isPositive = trend.startsWith('+')
  
  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-bold">{value}</p>
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  )
}

function UsageChart() {
  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="text-lg font-medium mb-4">Uso ao Longo do Tempo</h3>
      <div className="h-64 flex items-center justify-center border-t pt-4">
        <p className="text-muted-foreground">Gráfico de uso será implementado aqui</p>
      </div>
    </div>
  )
}

function RetentionChart() {
  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="text-lg font-medium mb-4">Retenção de Usuários</h3>
      <div className="h-64 flex items-center justify-center border-t pt-4">
        <p className="text-muted-foreground">Gráfico de retenção será implementado aqui</p>
      </div>
    </div>
  )
}

function TopContentTable() {
  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="text-lg font-medium mb-4">Conteúdo Mais Popular</h3>
      <div className="border-t pt-4">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="pb-2">Analogia</th>
              <th className="pb-2">Visualizações</th>
              <th className="pb-2">Compartilhamentos</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3">Como explicar React para iniciantes</td>
              <td className="py-3">1,245</td>
              <td className="py-3">342</td>
            </tr>
            <tr className="border-b">
              <td className="py-3">API REST como um restaurante</td>
              <td className="py-3">987</td>
              <td className="py-3">256</td>
            </tr>
            <tr className="border-b">
              <td className="py-3">Algoritmos como receitas de bolo</td>
              <td className="py-3">876</td>
              <td className="py-3">198</td>
            </tr>
            <tr className="border-b">
              <td className="py-3">Banco de dados como uma biblioteca</td>
              <td className="py-3">754</td>
              <td className="py-3">187</td>
            </tr>
            <tr>
              <td className="py-3">Git como uma máquina do tempo</td>
              <td className="py-3">689</td>
              <td className="py-3">154</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UserSegmentChart() {
  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="text-lg font-medium mb-4">Segmentação de Usuários</h3>
      <div className="h-64 flex items-center justify-center border-t pt-4">
        <p className="text-muted-foreground">Gráfico de segmentação será implementado aqui</p>
      </div>
    </div>
  )
}