import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAdminAccess } from "@/lib/access-control"
import { logAuditAction } from "@/lib/admin-utils"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    // Verifica usuário atual e acesso admin
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 })
    }

    const isAdmin = await checkAdminAccess(user.id)
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
    }

    const { userId } = await request.json()
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ ok: false, error: "missing_user_id" }, { status: 400 })
    }

    if (userId === user.id) {
      return NextResponse.json({ ok: false, error: "cannot_delete_self" }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
      return NextResponse.json({ ok: false, error: "missing_service_key" }, { status: 500 })
    }

    // Cliente admin para operações privilegiadas (auth.admin)
    const admin = createSupabaseClient(url, serviceKey)

    // Exclui usuário no auth.users (ON DELETE CASCADE cuidará das tabelas públicas)
    const { error: delErr } = await admin.auth.admin.deleteUser(userId)
    if (delErr) {
      return NextResponse.json({ ok: false, error: delErr.message }, { status: 500 })
    }

    // Log de auditoria (best effort)
    try {
      await logAuditAction(user.id, "delete_user", "user", userId)
    } catch (e) {
      // Ignora erros de auditoria
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "internal_error"
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}