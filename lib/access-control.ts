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

  // Count anonymous generations
  const { count } = await supabase
    .from("generations")
    .select("*", { count: "exact", head: true })
    .eq("anonymous_id", anonymousId)

  const generationsUsed = count || 0
  const limit = 9 // 3 uses x 3 analogies each

  if (generationsUsed >= limit) {
    return {
      canGenerate: false,
      reason: "anonymous_limit_reached",
      generationsUsed,
      generationsLimit: limit,
    }
  }

  return {
    canGenerate: true,
    reason: "ok",
    generationsUsed,
    generationsLimit: limit,
  }
}

export async function checkUserAccess(userId: string): Promise<AccessCheck> {
  const supabase = await createClient()

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

  await supabase.from("generations").insert({
    user_id: userId,
    anonymous_id: anonymousId,
    concept,
    audience,
  })
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
  }

  return anonymousId
}
