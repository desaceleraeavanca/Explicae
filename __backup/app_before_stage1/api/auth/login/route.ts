import { NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    let response = NextResponse.json({ ok: true })

    const isDev = process.env.NODE_ENV !== 'production'

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Garantir que os cookies funcionem em HTTP durante o desenvolvimento
            const coerced: CookieOptions = {
              ...options,
              secure: isDev ? false : options.secure,
              sameSite: options.sameSite ?? 'lax',
              httpOnly: options.httpOnly ?? true,
            }
            response.cookies.set(name, value, coerced)
          },
          remove(name: string, options: CookieOptions) {
            const coerced: CookieOptions = {
              ...options,
              secure: isDev ? false : options.secure,
              sameSite: options.sameSite ?? 'lax',
              httpOnly: options.httpOnly ?? true,
            }
            response.cookies.set(name, "", coerced)
          },
        },
        auth: {
          persistSession: true,
        },
      }
    )

    // Obter tokens via endpoint REST e definir sessão
    const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL!}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ email, password })
    })

    const tokenJson = await tokenRes.json()

    if (!tokenRes.ok || !tokenJson.access_token || !tokenJson.refresh_token) {
      const msg = tokenJson.error_description || tokenJson.error || 'Credenciais inválidas ou erro de autenticação'
      return NextResponse.json({ error: msg }, { status: 401 })
    }

    const { error: setErr } = await supabase.auth.setSession({
      access_token: tokenJson.access_token,
      refresh_token: tokenJson.refresh_token,
    })

    if (setErr) {
      return NextResponse.json({ error: setErr.message }, { status: 500 })
    }

    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: "Erro ao processar login", details: message }, { status: 500 })
  }
}