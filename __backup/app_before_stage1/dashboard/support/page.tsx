import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SupportForm } from "@/components/dashboard/support-form"
import { UserTicketsList } from "@/components/dashboard/user-tickets-list"

export default async function SupportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-2">Suporte</h1>
      <p className="text-muted-foreground mb-8">Entre em contato conosco para ajuda ou envie feedback</p>

      <SupportForm userId={user.id} />

      <UserTicketsList userId={user.id} />
    </div>
  )
}
