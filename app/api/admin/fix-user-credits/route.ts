import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkAdminAccess } from "@/lib/access-control"

function addYears(date: Date, years: number) {
  const d = new Date(date)
  d.setFullYear(d.getFullYear() + years)
  return d
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 })
    }

    const isAdmin = await checkAdminAccess(user.id)
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
    }

    const url = new URL(request.url)
    const email = url.searchParams.get("email")?.trim()

    if (!email) {
      return NextResponse.json({ ok: false, error: "missing_email_param" }, { status: 400 })
    }

    // Buscar perfil por email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, plan_type, credits_remaining, credits_expires_at")
      .eq("email", email)
      .single()

    if (profileError || !profile?.id) {
      return NextResponse.json({ ok: false, error: profileError?.message || "profile_not_found" }, { status: 404 })
    }

    // Buscar user_credits
    const { data: userCredits } = await supabase
      .from("user_credits")
      .select("user_id, credits_remaining, expiry_date")
      .eq("user_id", profile.id)
      .order("expiry_date", { ascending: true })
      .limit(1)
      .maybeSingle()

    const now = new Date()
    const oneYearFromNow = addYears(now, 1)
    const shouldHaveExpiry = profile.plan_type === "credito"

    let finalUserCredits = userCredits || null
    let finalProfile = profile

    // Se não existir registro user_credits, cria
    if (!finalUserCredits) {
      const initialCredits = (typeof profile.credits_remaining === "number")
        ? profile.credits_remaining
        : (profile.plan_type === "credito" ? 300 : 30)

      const insertPayload: any = {
        user_id: profile.id,
        credits_remaining: initialCredits,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      }
      if (shouldHaveExpiry) {
        insertPayload.expiry_date = oneYearFromNow.toISOString()
      }

      const { data: inserted, error: insertError } = await supabase
        .from("user_credits")
        .insert(insertPayload)
        .select("user_id, credits_remaining, expiry_date")
        .single()

      if (insertError) {
        return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 })
      }
      finalUserCredits = inserted
    } else {
      // Se existir mas sem expiry e deve ter, atualiza para 1 ano a partir de agora
      if (!finalUserCredits.expiry_date && shouldHaveExpiry) {
        const { data: updated, error: updateError } = await supabase
          .from("user_credits")
          .update({ expiry_date: oneYearFromNow.toISOString(), updated_at: now.toISOString() })
          .eq("user_id", profile.id)
          .select("user_id, credits_remaining, expiry_date")

        if (updateError) {
          return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 })
        }
        finalUserCredits = (updated && updated[0]) || finalUserCredits
      }
    }

    // Sincronizar credits_expires_at em profiles com expiry_date de user_credits
    const targetExpiry = finalUserCredits?.expiry_date || (shouldHaveExpiry ? oneYearFromNow.toISOString() : null)
    if (targetExpiry && finalProfile.credits_expires_at !== targetExpiry) {
      const { data: updatedProfile, error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ credits_expires_at: targetExpiry, updated_at: now.toISOString() })
        .eq("id", profile.id)
        .select("id, email, plan_type, credits_remaining, credits_expires_at")
        .single()

      if (profileUpdateError) {
        return NextResponse.json({ ok: false, error: profileUpdateError.message }, { status: 500 })
      }
      finalProfile = updatedProfile
    }

    return NextResponse.json({ ok: true, profile: finalProfile, userCredits: finalUserCredits })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "unexpected_error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 })
    }

    const isAdmin = await checkAdminAccess(user.id)
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    const email = body?.email?.trim()
    const creditsOverride: number | undefined = typeof body?.credits_remaining === "number" ? body.credits_remaining : undefined
    const expiryOverrideRaw: string | Date | undefined = body?.expiry_date
    const overwriteExpiry: boolean = !!body?.overwrite_expiry

    if (!email) {
      return NextResponse.json({ ok: false, error: "missing_email_body" }, { status: 400 })
    }

    // Rate limit: max 10 ajustes por minuto por admin
    try {
      const oneMinuteAgoISO = new Date(Date.now() - 60_000).toISOString()
      const { count: recentCount } = await supabase
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action", "admin_fix_user_credits")
        .gte("created_at", oneMinuteAgoISO)
      if ((recentCount ?? 0) >= 10) {
        return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 })
      }
    } catch (_) {
      // Ignorar falhas do rate limiter
    }

    // Buscar perfil por email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, plan_type, credits_remaining, credits_expires_at")
      .eq("email", email)
      .single()

    if (profileError || !profile?.id) {
      return NextResponse.json({ ok: false, error: profileError?.message || "profile_not_found" }, { status: 404 })
    }

    // Buscar user_credits atual
    const { data: existingCredits } = await supabase
      .from("user_credits")
      .select("user_id, credits_remaining, expiry_date")
      .eq("user_id", profile.id)
      .order("expiry_date", { ascending: true })
      .limit(1)
      .maybeSingle()

    const now = new Date()

    // Determinar valores finais
    const finalCreditsRemaining = typeof creditsOverride === "number"
      ? creditsOverride
      : (typeof profile.credits_remaining === "number"
          ? profile.credits_remaining
          : (existingCredits?.credits_remaining ?? (profile.plan_type === "credito" ? 300 : 30)))

    const existingExpiryISO: string | null = existingCredits?.expiry_date || profile.credits_expires_at || null

    let finalExpiryISO: string | null = null
    if (expiryOverrideRaw !== undefined) {
      const d = new Date(expiryOverrideRaw)
      if (isNaN(d.getTime())) {
        return NextResponse.json({ ok: false, error: "invalid_expiry_date" }, { status: 400 })
      }
      const overrideISO = d.toISOString()
      if (existingExpiryISO && !overwriteExpiry) {
        finalExpiryISO = existingExpiryISO
      } else {
        finalExpiryISO = overrideISO
      }
    } else {
      if (profile.plan_type === "credito") {
        finalExpiryISO = existingExpiryISO || addYears(now, 1).toISOString()
      } else {
        finalExpiryISO = null
      }
    }

    // Upsert em user_credits
    if (existingCredits?.user_id) {
      const updatePayload: any = {
        credits_remaining: finalCreditsRemaining,
        updated_at: now.toISOString(),
      }
      if (finalExpiryISO) {
        updatePayload.expiry_date = finalExpiryISO
      }
      const { data: updated, error: updateError } = await supabase
        .from("user_credits")
        .update(updatePayload)
        .eq("user_id", profile.id)
        .select("user_id, credits_remaining, expiry_date")

      if (updateError) {
        return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 })
      }
    } else {
      const insertPayload: any = {
        user_id: profile.id,
        credits_remaining: finalCreditsRemaining,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      }
      if (finalExpiryISO) {
        insertPayload.expiry_date = finalExpiryISO
      }
      const { error: insertError } = await supabase
        .from("user_credits")
        .insert(insertPayload)
      if (insertError) {
        return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 })
      }
    }

    // Atualizar profile para manter consistência
    const profileUpdate: any = { credits_remaining: finalCreditsRemaining, updated_at: now.toISOString() }
    if (finalExpiryISO) {
      profileUpdate.credits_expires_at = finalExpiryISO
    }

    const { data: updatedProfile, error: profileUpdateError } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", profile.id)
      .select("id, email, plan_type, credits_remaining, credits_expires_at")
      .single()

    if (profileUpdateError) {
      return NextResponse.json({ ok: false, error: profileUpdateError.message }, { status: 500 })
    }

    // Buscar user_credits final
    const { data: finalUserCredits } = await supabase
      .from("user_credits")
      .select("user_id, credits_remaining, expiry_date")
      .eq("user_id", profile.id)
      .order("expiry_date", { ascending: true })
      .limit(1)
      .maybeSingle()

    // Tentar registrar auditoria (pode falhar por RLS; ignorar erro)
    try {
      const ip = request.headers.get("x-forwarded-for") || null
      const ua = request.headers.get("user-agent") || null
      await supabase
        .from("audit_logs")
        .insert({
          user_id: user.id,
          action: "admin_fix_user_credits",
          resource_type: "profiles",
          resource_id: profile.id,
          details: {
            email,
            credits_remaining: finalCreditsRemaining,
            expiry_date: finalExpiryISO,
            overwrite_expiry: overwriteExpiry,
            requested_by: user?.email || null,
          },
          ip_address: ip,
          user_agent: ua,
        })
    } catch (e) {
      // noop
    }

    return NextResponse.json({ ok: true, profile: updatedProfile, userCredits: finalUserCredits || null })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "unexpected_error" }, { status: 500 })
  }
}