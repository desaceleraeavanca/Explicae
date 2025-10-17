// Script de debug para testar a função checkUserAccess
const { createClient } = require('@supabase/supabase-js')

// Configurar o cliente Supabase (você precisa adicionar suas credenciais)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Credenciais do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugUserAccess(userId) {
  console.log(`\n=== Debug para usuário: ${userId} ===`)
  
  // Verificar user_credits
  const { data: credits, error: creditsError } = await supabase
    .from('user_credits')
    .select('credits_remaining, expiry_date')
    .eq('user_id', userId)
    .order('expiry_date', { ascending: true })
    .limit(1)
    .single()

  console.log('user_credits:', credits, creditsError?.message)

  // Verificar user_stats
  const { data: stats, error: statsError } = await supabase
    .from('user_stats')
    .select('monthly_analogies, total_analogies')
    .eq('user_id', userId)
    .single()

  console.log('user_stats:', stats, statsError?.message)

  // Verificar profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan_type, plan_limit, credits_remaining')
    .eq('id', userId)
    .single()

  console.log('profiles:', profile, profileError?.message)

  // Calcular valores
  let generationsUsed = 0
  let generationsLimit = profile?.plan_limit || 100

  if (profile?.plan_type === 'gratuito') {
    generationsUsed = stats?.monthly_analogies || 0
  }

  console.log(`\nResultado final:`)
  console.log(`- Plan Type: ${profile?.plan_type}`)
  console.log(`- Generations Used: ${generationsUsed}`)
  console.log(`- Generations Limit: ${generationsLimit}`)
  console.log(`- Credits Remaining: ${profile?.credits_remaining}`)
}

// Exemplo de uso - substitua pelo ID do usuário que você quer testar
const testUserId = 'SEU_USER_ID_AQUI'
debugUserAccess(testUserId).catch(console.error)