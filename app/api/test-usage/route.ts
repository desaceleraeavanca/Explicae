import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAnonymousId } from "@/lib/anonymous-id"
import { checkAnonymousAccess, checkUserAccess } from "@/lib/access-control"
import { ANONYMOUS_LIMIT } from "@/lib/constants"

export async function GET(request: NextRequest) {
  // Verificar se o usuário está logado
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Obter o ID anônimo para caso o usuário não esteja logado
  const anonymousId = getAnonymousId()

  // Verificar o uso atual
  let usage = { used: 0, limit: 0, remaining: 0 }
  
  if (user?.id) {
    // Usuário logado
    const access = await checkUserAccess(user.id)
    
    // Verificar se há um cookie de uso para usuários logados
    const cookieStore = cookies()
    const usedStr = cookieStore.get("user_usage_used")?.value
    
    if (usedStr) {
      // Se o cookie existir, usar ele para calcular o uso
      const used = parseInt(usedStr, 10) || 0
      usage = {
        used: used,
        limit: access.generationsLimit,
        remaining: Math.max(0, access.generationsLimit - used),
      }
    } else {
      // Se não houver cookie, usar o banco de dados
      usage = {
        used: access.generationsUsed,
        limit: access.generationsLimit,
        remaining: access.generationsRemaining,
      }
      
      // Criar o cookie inicial com o valor do banco de dados
      try {
        cookieStore.set("user_usage_used", String(access.generationsUsed), {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 180,
        })
      } catch (err) {
        console.warn("[test-usage] Não foi possível criar cookie inicial de uso do usuário:", err)
      }
    }
    
    // Incrementar o cookie para simular uma geração
    const current = parseInt(usedStr || "0", 10) || 0
    const next = current + 1
    
    try {
      cookieStore.set("user_usage_used", String(next), {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 180,
      })
    } catch (err) {
      console.warn("[test-usage] Não foi possível atualizar cookie de uso do usuário:", err)
    }
    
    // Atualizar o objeto de uso para refletir o incremento
    usage = {
      used: next,
      limit: access.generationsLimit,
      remaining: Math.max(0, access.generationsLimit - next),
    }
  } else {
    // Usuário anônimo
    const access = await checkAnonymousAccess(anonymousId)
    
    // Verificar se há um cookie de uso para usuários anônimos
    const cookieStore = cookies()
    const usedStr = cookieStore.get("anonymous_usage_used")?.value || "0"
    const used = parseInt(usedStr, 10) || 0
    
    usage = {
      used,
      limit: ANONYMOUS_LIMIT,
      remaining: Math.max(0, ANONYMOUS_LIMIT - used),
    }
    
    // Incrementar o cookie para simular uma geração
    const next = used + 1
    
    try {
      cookieStore.set("anonymous_usage_used", String(next), {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 180,
      })
    } catch (err) {
      console.warn("[test-usage] Não foi possível atualizar cookie de uso anônimo:", err)
    }
    
    // Atualizar o objeto de uso para refletir o incremento
    usage = {
      used: next,
      limit: ANONYMOUS_LIMIT,
      remaining: Math.max(0, ANONYMOUS_LIMIT - next),
    }
  }

  return NextResponse.json({
    user: user ? { id: user.id, email: user.email } : null,
    anonymousId: !user ? anonymousId : null,
    usage,
    message: "Este endpoint incrementa o contador de uso sem gerar analogias"
  })
}