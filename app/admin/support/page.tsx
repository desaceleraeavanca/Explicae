import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SupportPage } from "@/components/admin/support-page"

export default async function AdminSupportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-6 lg:p-8">Você precisa estar autenticado.</div>
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return <div className="p-6 lg:p-8">Acesso restrito aos administradores.</div>
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Suporte</h1>
        <p className="text-muted-foreground">Tickets e feedback dos usuários</p>
      </div>
      <SupportPage />
    </div>
  )
}
