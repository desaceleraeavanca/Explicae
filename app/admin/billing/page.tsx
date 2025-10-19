import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin-utils"

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
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Faturamento</h1>
        <p className="text-muted-foreground mt-2">Acompanhe receitas, pagamentos e histórico financeiro</p>
      </div>

      <BillingOverview />

      <div className="mt-6">
        <RevenueChart />
      </div>

      <div className="mt-6">
        <PaymentHistory />
      </div>
    </div>
  )
}
