import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function getUser() {
  const supabase = await createSupabaseServerClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Buscar dados completos do usuário
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return userProfile
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function getUserGenerationsCount(userId: string) {
  const supabase = await createSupabaseServerClient()
  
  const { count } = await supabase
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return count || 0
}

export async function checkUserLimits(userId: string) {
  const supabase = await createSupabaseServerClient()
  
  const user = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (!user.data) return { canGenerate: false, reason: 'User not found' }

  const { plan_type, subscription_status, trial_ends_at, credits_remaining } = user.data

  // Verificar se a assinatura está ativa
  if (subscription_status !== 'ativa') {
    return { canGenerate: false, reason: 'Subscription inactive' }
  }

  // Verificar limites baseados no plano
  switch (plan_type) {
    case 'gratuito':
      // Verificar se ainda está no período de teste
      if (trial_ends_at && new Date(trial_ends_at) < new Date()) {
        return { canGenerate: false, reason: 'Trial expired' }
      }
      
      // Verificar limite de 100 gerações
      const generationsCount = await getUserGenerationsCount(userId)
      if (generationsCount >= 100) {
        return { canGenerate: false, reason: 'Generation limit reached' }
      }
      break

    case 'credito':
      if (!credits_remaining || credits_remaining <= 0) {
        return { canGenerate: false, reason: 'No credits remaining' }
      }
      break

    case 'mensal':
    case 'anual':
    case 'admin':
    case 'cortesia':
    case 'parceria':
    case 'presente':
      // Verificar uso justo (1000 por mês)
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)
      
      const { count: monthlyCount } = await supabase
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', currentMonth.toISOString())

      if (monthlyCount && monthlyCount >= 1000) {
        return { canGenerate: false, reason: 'Monthly limit reached' }
      }
      break
  }

  return { canGenerate: true }
}