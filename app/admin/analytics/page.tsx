import { AdminAnalytics } from "@/components/admin-analytics"

export default function AdminAnalyticsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground mt-2">Visualize métricas detalhadas e insights da plataforma.</p>
      </div>
      <AdminAnalytics />
    </div>
  )
}
