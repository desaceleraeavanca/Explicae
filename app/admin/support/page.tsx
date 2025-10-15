import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin-utils"
import { AdminNav } from "@/components/admin/admin-nav"
import { SupportTickets } from "@/components/admin/support-tickets"
import { FeedbackList } from "@/components/admin/feedback-list"

export default async function AdminSupportPage() {
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
          <h1 className="text-4xl font-bold mb-2">Suporte ao Cliente</h1>
          <p className="text-muted-foreground">Gerencie tickets de suporte e feedback dos usuários</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SupportTickets />
          <FeedbackList />
        </div>
      </main>
    </div>
  )
}
