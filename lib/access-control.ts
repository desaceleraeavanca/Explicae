import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export interface AccessCheck {
  canGenerate: boolean
  reason: string
  generationsUsed: number
  generationsLimit: number
}

// Função mantida apenas para compatibilidade com código existente
// removed: checkAnonymousAccess — fluxo anônimo descontinuado após remoção de anonymous_id

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
  const { data: stats } = await supabase
    .from('user_stats')
    .select('monthly_analogies, total_analogies')
    .eq('user_id', userId)
    .single()

  // Verificar plano do usuário (inclui trial e status)
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_type, credits_remaining, trial_ends_at, subscription_status, credits_expires_at')
    .eq('id', userId)
    .single()

  // Contar gerações do usuário (para limitar 30 durante o trial)
  const { count: genCount } = await supabase
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Valores padrão
  let generationsUsed = 0
  let generationsLimit = 30  // Limite padrão para planos gratuitos
  let hasCredits = false
  let creditsExpired = false

  const now = new Date()
  const planType = profile?.plan_type ?? 'gratuito'
  const subscriptionStatus = profile?.subscription_status ?? 'ativa'

  // Remover duplicatas: usar variáveis já declaradas acima
  if (planType === 'gratuito') {
    generationsUsed = genCount || 0
    generationsLimit = 30
  } else if (planType === 'credito') {
    const creditsRemaining = (credits && !creditsError)
      ? credits.credits_remaining
      : (profile?.credits_remaining ?? 0)
    const expiryDate = (credits && !creditsError && credits.expiry_date)
      ? new Date(credits.expiry_date)
      : (profile?.credits_expires_at ? new Date(profile.credits_expires_at) : null)

    if (expiryDate) {
      creditsExpired = expiryDate < now
    }
    generationsLimit = 300
    generationsUsed = Math.max(0, 300 - (creditsRemaining || 0))
    hasCredits = (creditsRemaining || 0) > 0
  } else if (["mensal", "anual", "admin", "cortesia", "promo", "parceria", "presente"].includes(planType)) {
    // Uso mensal para controle interno (fair use), sem bloqueio
    generationsUsed = stats?.monthly_analogies || 0
    generationsLimit = 3000
  }

  // Determinar se o usuário pode gerar
  let canGenerate = true
  let reason = 'ok'

  // Bloqueios por status de assinatura (somente planos pagos)
  if (["mensal", "anual"].includes(planType)) {
    if (subscriptionStatus === 'cancelada') {
      return {
        canGenerate: false,
        reason: 'subscription_cancelled',
        generationsUsed,
        generationsLimit,
      }
    }
    if (subscriptionStatus === 'pendente') {
      return {
        canGenerate: false,
        reason: 'payment_pending',
        generationsUsed,
        generationsLimit,
      }
    }
  }

  // Verificar trial expirado (aplica só ao plano gratuito)
  if (planType === 'gratuito' && profile?.trial_ends_at) {
    const trialEnd = new Date(profile.trial_ends_at)
    if (trialEnd < now) {
      canGenerate = false
      reason = 'trial_expired'
    }
  }

  // Verificar limite do plano gratuito
  if (planType === 'gratuito' && !['trial_expired'].includes(reason)) {
    if ((genCount || 0) >= 30) {
      canGenerate = false
      reason = 'limit_reached'
    }
  }

  // Verificar créditos no plano de créditos
  if (planType === 'credito') {
    if (!hasCredits) {
      canGenerate = false
      reason = 'no_credits'
    } else if (creditsExpired) {
      canGenerate = false
      reason = 'credits_expired'
    }
  }

  return {
    canGenerate,
    reason,
    generationsUsed,
    generationsLimit,
  }
}

export async function trackGeneration(userId: string | null, concept: string, audience: string): Promise<{ ok: boolean, error?: string }> {
  if (!userId) return { ok: false, error: 'missing_user_id' }
  
  const supabase = await createClient()

  // Obter usuário atual para preencher email do perfil se necessário
  let currentEmail: string | null = null
  try {
    const {
      data: { user: authUser }
    } = await supabase.auth.getUser()
    currentEmail = authUser?.email ?? null
  } catch (e) {
    console.error('[DEBUG] Erro ao obter usuário para perfil:', e)
  }
  
  // Garantir que o perfil existe antes de inserir a geração
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()
    
    if (profileError || !profile) {
      console.error('[DEBUG] Perfil não encontrado, tentando criar:', profileError)
      
      // Tentar criar o perfil com email obrigatório
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, email: currentEmail || 'unknown@example.com' })
      
      if (insertError) {
        console.error('[DEBUG] Erro ao criar perfil:', insertError)
        // Mesmo se falhar, seguimos para tentar inserir a geração
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
        created_at: now
        // Não definir updated_at explicitamente para evitar erro de cache/coluna ausente
      })
    
    if (error) {
      console.error('[DEBUG] Erro ao inserir geração:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (e) {
    console.error('[DEBUG] Erro ao inserir geração:', e)
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
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
