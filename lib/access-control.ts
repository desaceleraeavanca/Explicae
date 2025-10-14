import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export interface AccessCheck {
  canGenerate: boolean
  reason: string
  generationsUsed: number
  generationsLimit: number
}

export async function checkAnonymousAccess(anonymousId: string): Promise<AccessCheck> {
  const supabase = await createClient()

  // Use RPC to avoid potential RLS restrictions and ensure consistent counting
  const { data, error } = await supabase.rpc('check_anonymous_access', {
    anonymous_id_param: anonymousId,
  })

  if (error || !data || data.length === 0) {
    // Fallbacks: try simple count; if blocked by RLS, use cookie-based counter
    const { count } = await supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("anonymous_id", anonymousId)

    let generationsUsed = typeof count === 'number' ? count : 0

    // If count is null (likely due to RLS), use cookie-based usage tracking
    if (count == null) {
      const cookieStore = cookies()
      const cookieVal = cookieStore.get("anonymous_usage_used")?.value
      const parsed = cookieVal ? parseInt(cookieVal, 10) : 0
      generationsUsed = Number.isFinite(parsed) ? parsed : 0
    }

    const limit = 9
    const canGenerate = generationsUsed < limit
    return {
      canGenerate,
      reason: canGenerate ? 'ok' : 'anonymous_limit_reached',
      generationsUsed,
      generationsLimit: limit,
    }
  }

  const result = data[0]
  return {
    canGenerate: result.can_generate,
    reason: result.reason,
    generationsUsed: result.generations_used,
    generationsLimit: result.generations_limit,
  }
}

export async function checkUserAccess(userId: string): Promise<AccessCheck> {
  const supabase = await createClient()

  // Verificação especial para o usuário pereiraadiilson@gmail.com
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single()

  if (profile?.email === "pereiraadiilson@gmail.com") {
    // Retorna valores fixos para este usuário específico
    return {
      canGenerate: true,
      reason: "ok",
      generationsUsed: 8,
      generationsLimit: 100,
    }
  }

  const { data, error } = await supabase.rpc("check_user_access", {
    user_id_param: userId,
  })

  if (error || !data || data.length === 0) {
    return {
      canGenerate: false,
      reason: "error",
      generationsUsed: 0,
      generationsLimit: 0,
    }
  }

  const result = data[0]
  return {
    canGenerate: result.can_generate,
    reason: result.reason,
    generationsUsed: result.generations_used,
    generationsLimit: result.generations_limit,
  }
}

export async function trackGeneration(
  userId: string | null,
  anonymousId: string | null,
  concept: string,
  audience: string,
) {
  const supabase = await createClient()
  try {
    // Ensure the user's profile exists to satisfy FK before inserting a generation
    if (userId) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle()

      if (!existingProfile) {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user && user.id === userId) {
          const email = user.email || ""
          const fullName = (user.user_metadata as any)?.full_name || ""

          // Insert minimal profile to satisfy FK constraint
          await supabase.from("profiles").insert({
            id: userId,
            email,
            full_name: fullName,
          })
        } else {
          console.warn(
            "[trackGeneration] Perfil não encontrado e usuário de auth não corresponde; pulando criação de perfil.",
          )
        }
      }
    }

    const { error } = await supabase.from("generations").insert({
      user_id: userId,
      anonymous_id: anonymousId,
      concept,
      audience,
    })

    if (error) {
      console.error("[trackGeneration] Falha ao inserir geração:", error)
    }

    // Increment usage cookie to ensure counting works even if RLS blocks SELECT
    const cookieStore = cookies()
    if (!userId && anonymousId) {
      // Para usuários anônimos
      const currentVal = cookieStore.get("anonymous_usage_used")?.value
      const current = currentVal ? parseInt(currentVal, 10) : 0
      const next = (Number.isFinite(current) ? current : 0) + 1
      try {
        cookieStore.set("anonymous_usage_used", String(next), {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 180,
        })
      } catch (err) {
        console.warn("[trackGeneration] Não foi possível atualizar cookie de uso anônimo:", err)
      }
    } else if (userId) {
      // Para usuários logados
      const currentVal = cookieStore.get("user_usage_used")?.value
      const current = currentVal ? parseInt(currentVal, 10) : 0
      const next = (Number.isFinite(current) ? current : 0) + 1
      try {
        cookieStore.set("user_usage_used", String(next), {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 180,
        })
      } catch (err) {
        console.warn("[trackGeneration] Não foi possível atualizar cookie de uso do usuário:", err)
      }
    }
  } catch (err) {
    console.error("[trackGeneration] Erro inesperado ao registrar geração:", err)
  }
}

export async function consumeCredit(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("consume_credit", {
    user_id_param: userId,
  })

  return !error && data
}

export function getAnonymousId(): string {
  const cookieStore = cookies()
  let anonymousId = cookieStore.get("anonymous_id")?.value

  if (!anonymousId) {
    anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(7)}`
    try {
      // Persist the anonymous id so we can track usage consistently
      cookieStore.set("anonymous_id", anonymousId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        // 180 days
        maxAge: 60 * 60 * 24 * 180,
      })
    } catch (err) {
      // In some contexts cookies() may be read-only; ignore errors
      console.warn("[getAnonymousId] Não foi possível persistir cookie anonymous_id:", err)
    }
  }

  return anonymousId
}

export async function addCredits(userId: string, amount: number): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("add_credits", {
    user_id_param: userId,
    credits_amount: amount,
  })

  return !error && data
}
