import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export interface AccessCheck {
  canGenerate: boolean
  reason: string
  generationsUsed: number
  generationsLimit: number
}

// Função mantida apenas para compatibilidade com código existente
export async function checkAnonymousAccess(anonymousId: string): Promise<AccessCheck> {
  // Retorna valores padrão que permitem geração
  return {
    canGenerate: true,
    reason: 'ok',
    generationsUsed: 0,
    generationsLimit: 100,
  }
}

export async function checkUserAccess(userId: string): Promise<AccessCheck> {
  const supabase = await createClient()
  
  // Verificar se o usuário tem um plano especial
  if (userId === "00000000-0000-0000-0000-000000000000") {
    return {
      canGenerate: true,
      reason: 'ok',
      generationsUsed: 0,
      generationsLimit: 999999,
    }
  }

  // Verificar se o usuário tem créditos disponíveis
  const { data: credits, error: creditsError } = await supabase
    .from('user_credits')
    .select('credits_remaining, expiry_date')
    .eq('user_id', userId)
    .order('expiry_date', { ascending: true })
    .limit(1)
    .single()

  // Verificar uso mensal (fair use)
  const { data: stats, error: statsError } = await supabase
    .from('user_stats')
    .select('monthly_analogies, total_analogies')
    .eq('user_id', userId)
    .single()

  // Verificar plano do usuário
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan, plan_limit')
    .eq('id', userId)
    .single()

  // Valores padrão
  let generationsUsed = stats?.monthly_analogies || 0
  let generationsLimit = profile?.plan_limit || 100
  let hasCredits = false
  let creditsExpired = false

  // Verificar créditos
  if (credits && !creditsError) {
    hasCredits = credits.credits_remaining > 0
    
    // Verificar se os créditos expiraram
    if (credits.expiry_date) {
      const expiryDate = new Date(credits.expiry_date)
      const now = new Date()
      creditsExpired = expiryDate < now
    }
  }

  // Determinar se o usuário pode gerar
  let canGenerate = true
  let reason = 'ok'

  // Verificar limite do plano
  if (generationsUsed >= generationsLimit) {
    canGenerate = false
    reason = 'fair_use_limit'
  }

  // Se não pode gerar pelo plano, verificar créditos
  if (!canGenerate && hasCredits && !creditsExpired) {
    canGenerate = true
    reason = 'ok'
  } else if (!canGenerate && !hasCredits) {
    reason = 'no_credits'
  } else if (!canGenerate && creditsExpired) {
    reason = 'credits_expired'
  }

  return {
    canGenerate,
    reason,
    generationsUsed,
    generationsLimit,
  }
}

export async function trackGeneration(userId: string | null, concept: string, audience: string): Promise<void> {
  if (!userId) return;
  
  const supabase = await createClient()
  
  // Garantir que o perfil existe antes de inserir a geração
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()
    
    if (profileError || !profile) {
      console.error('[DEBUG] Perfil não encontrado, tentando criar:', profileError)
      
      // Tentar criar o perfil
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId })
      
      if (insertError) {
        console.error('[DEBUG] Erro ao criar perfil:', insertError)
      }
    }
  } catch (e) {
    console.error('[DEBUG] Erro ao verificar perfil:', e)
  }
  
  // Inserir a geração
  try {
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('generations')
      .insert({
        user_id: userId,
        concept,
        audience,
        created_at: now,
        updated_at: now
      })
    
    if (error) {
      console.error('[DEBUG] Erro ao inserir geração:', error)
    }
  } catch (e) {
    console.error('[DEBUG] Erro ao inserir geração:', e)
  }
}

export async function consumeCredit(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase.rpc('consume_credit', {
      user_id_param: userId
    })
    
    if (error) {
      console.error('[DEBUG] Erro ao consumir crédito:', error)
      return false
    }
    
    return data || false
  } catch (e) {
    console.error('[DEBUG] Erro ao consumir crédito:', e)
    return false
  }
}

export async function checkAdminAccess(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    // Verificar se o usuário tem role de admin
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Erro ao verificar acesso admin:', error)
      return false
    }

    return profile?.role === 'admin'
  } catch (error) {
    console.error('Erro inesperado ao verificar acesso admin:', error)
    return false
  }
}

// Função mantida apenas para compatibilidade com código existente
export function getAnonymousId(): string {
  const cookieStore = cookies()
  let anonymousId = cookieStore.get('anonymous_id')?.value
  
  if (!anonymousId) {
    anonymousId = crypto.randomUUID()
  }
  
  return anonymousId
}
