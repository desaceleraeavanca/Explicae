import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkUserAccess } from "@/lib/access-control"

async function insertGenerations(supabase: any, userId: string, count: number) {
  const batchSize = 200
  let inserted = 0
  while (inserted < count) {
    const size = Math.min(batchSize, count - inserted)
    const nowIso = new Date().toISOString()
    const rows = Array.from({ length: size }).map((_, i) => ({
      user_id: userId,
      concept: `Teste conceito ${inserted + i + 1}`,
      audience: `Teste público ${inserted + i + 1}`,
      created_at: nowIso,
    }))
    const { error } = await supabase.from("generations").insert(rows)
    if (error) throw new Error(error.message)
    inserted += size
  }
  return inserted
}

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    return NextResponse.json({ ok: false, error: authError.message }, { status: 500 })
  }

  if (!user?.id) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 })
  }

  let body: any = {}
  try {
    body = await req.json()
  } catch {}

  const scenario = body?.scenario as string | undefined

  try {
    let profile: any = null
    let rowsInserted = 0

    if (!scenario || scenario === "custom") {
      const planType = body?.planType ?? "credito"
      const credits = typeof body?.credits === "number" ? body.credits : 0
      const subscriptionStatus = body?.subscriptionStatus ?? (planType === "credito" ? "ativa" : null)
      const updates: Record<string, any> = {
        plan_type: planType,
        credits_remaining: credits,
        subscription_status: subscriptionStatus,
        updated_at: new Date().toISOString(),
      }
      if (body?.trialEndsAt) updates.trial_ends_at = body.trialEndsAt
      if (body?.creditsExpiresAt) updates.credits_expires_at = body.creditsExpiresAt

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single()

      if (updateError) throw new Error(updateError.message)
      profile = data
    } else if (scenario === "credits_zero") {
      const { data, error } = await supabase
        .from("profiles")
        .update({ plan_type: "credito", credits_remaining: 0, subscription_status: "ativa", updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      profile = data
    } else if (scenario === "credits_expired") {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const credits = typeof body?.credits === "number" ? body.credits : 10
      const { data, error } = await supabase
        .from("profiles")
        .update({ plan_type: "credito", credits_remaining: credits, credits_expires_at: past, subscription_status: "ativa", updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      profile = data
    } else if (scenario === "trial_expired") {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data, error } = await supabase
        .from("profiles")
        .update({ plan_type: "gratuito", trial_ends_at: past, updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      profile = data
    } else if (scenario === "limit_reached_free") {
      // Reset and insert 30 generations
      await supabase.from("generations").delete().eq("user_id", user.id)
      const count = typeof body?.count === "number" ? body.count : 30
      rowsInserted = await insertGenerations(supabase, user.id, count)
      const { data, error } = await supabase
        .from("profiles")
        .update({ plan_type: "gratuito", updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      profile = data
    } else if (scenario === "fair_use_paid_limit") {
      // Reset and insert 3000 generations for paid plan fairness
      await supabase.from("generations").delete().eq("user_id", user.id)
      const count = typeof body?.count === "number" ? body.count : 3000
      rowsInserted = await insertGenerations(supabase, user.id, count)
      const paidPlan = body?.planType && ["mensal", "anual"].includes(body.planType) ? body.planType : "mensal"
      const { data, error } = await supabase
        .from("profiles")
        .update({ plan_type: paidPlan, subscription_status: "ativa", updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      profile = data
    } else if (scenario === "subscription_pending") {
      const paidPlan = body?.planType && ["mensal", "anual"].includes(body.planType) ? body.planType : "mensal"
      const { data, error } = await supabase
        .from("profiles")
        .update({ plan_type: paidPlan, subscription_status: "pendente", updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      profile = data
    } else if (scenario === "subscription_cancelled") {
      const paidPlan = body?.planType && ["mensal", "anual"].includes(body.planType) ? body.planType : "mensal"
      const { data, error } = await supabase
        .from("profiles")
        .update({ plan_type: paidPlan, subscription_status: "cancelada", updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      profile = data
    } else {
      throw new Error(`unknown_scenario: ${scenario}`)
    }

    const access = await checkUserAccess(user.id)
    return NextResponse.json({ ok: true, profile, rowsInserted, access })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("plan_type, credits_remaining, subscription_status, trial_ends_at, credits_expires_at")
    .eq("id", user.id)
    .single()

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  const access = await checkUserAccess(user.id)
  return NextResponse.json({ ok: true, profile, access })
}