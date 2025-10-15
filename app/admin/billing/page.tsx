import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin-utils"
import { AdminNav } from "@/components/admin/admin-nav"
import { BillingOverview } from "@/components/admin/billing-overview"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { PaymentHistory } from "@/components/admin/payment-history"

export default async function AdminBillingPage() {
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
          <h1 className="text-4xl font-bold mb-2">Faturamento e Receita</h1>
          <p className="text-muted-foreground">Métricas financeiras e análise de receita</p>
        </div>

        <BillingOverview />

        <div className="mt-6">
          <RevenueChart />
        </div>

        <div className="mt-6">
          <PaymentHistory />
        </div>
      </main>
    </div>
  )
}
