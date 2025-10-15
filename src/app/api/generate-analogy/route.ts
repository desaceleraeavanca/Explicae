import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, getUserProfile, checkUserLimits } from '@/lib/supabase-server'
import { OpenRouterClient, validateUsageLimits } from '@/lib/openrouter'
import { generateId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Obter dados do usuário
    const userProfile = await getUserProfile(user.id)
    if (!userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar limites de uso
    const limits = await checkUserLimits(user.id, userProfile.plan_type, userProfile.credits)
    if (!limits.canGenerate) {
      return NextResponse.json(
        { error: limits.reason },
        { status: 403 }
      )
    }

    // Validar dados da requisição
    const body = await request.json()
    const { concept, audience, context, tone, length } = body

    if (!concept || !audience) {
      return NextResponse.json(
        { error: 'Conceito e público-alvo são obrigatórios' },
        { status: 400 }
      )
    }

    // Gerar analogia usando OpenRouter
    const openRouter = new OpenRouterClient(process.env.OPENROUTER_API_KEY!)
    
    const analogyResponse = await openRouter.generateAnalogy({
      concept,
      audience,
      context,
      tone,
      length
    })

    // Salvar geração no banco de dados
    const generationId = generateId()
    const { error: insertError } = await supabase
      .from('generations')
      .insert({
        id: generationId,
        user_id: user.id,
        concept,
        audience,
        context,
        tone,
        length,
        analogy: analogyResponse.analogy,
        explanation: analogyResponse.explanation,
        usage_tips: analogyResponse.usage_tips
      })

    if (insertError) {
      console.error('Erro ao salvar geração:', insertError)
      return NextResponse.json(
        { error: 'Erro ao salvar analogia' },
        { status: 500 }
      )
    }

    // Atualizar contador de gerações do usuário
    const newGenerationCount = (userProfile.generation_count || 0) + 1;
    await supabase
      .from('users')
      .update({ 
        generation_count: newGenerationCount,
        credits_used: (userProfile.credits_used || 0) + 1,
        credits: userProfile.plan_type === 'credits' ? userProfile.credits - 1 : userProfile.credits
      })
      .eq('id', user.id);

    // Verificar e conceder badges
    const { checkAndAwardBadges } = await import('@/app/api/badges/route');
    await checkAndAwardBadges(user.id, 'generation_count', newGenerationCount);

    return NextResponse.json({ 
      analogy: analogyResponse.analogy,
      generation_id: generationId
    })

  } catch (error) {
    console.error('Erro na geração de analogia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função para verificar e conceder badges
async function checkAndGrantBadges(supabase: any, userId: string) {
  try {
    // Contar total de gerações do usuário
    const { count } = await supabase
      .from('generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const badges = []

    // Badge: Primeira Analogia
    if (count === 1) {
      badges.push({
        id: generateId(),
        user_id: userId,
        name: 'Primeira Analogia',
        description: 'Criou sua primeira analogia',
        icon: '🎯',
        category: 'milestone'
      })
    }

    // Badge: Comunicador Ativo (10 analogias)
    if (count === 10) {
      badges.push({
        id: generateId(),
        user_id: userId,
        name: 'Comunicador Ativo',
        description: 'Criou 10 analogias',
        icon: '🚀',
        category: 'milestone'
      })
    }

    // Badge: Mestre das Analogias (50 analogias)
    if (count === 50) {
      badges.push({
        id: generateId(),
        user_id: userId,
        name: 'Mestre das Analogias',
        description: 'Criou 50 analogias',
        icon: '👑',
        category: 'milestone'
      })
    }

    // Badge: Especialista em Clareza (100 analogias)
    if (count === 100) {
      badges.push({
        id: generateId(),
        user_id: userId,
        name: 'Especialista em Clareza',
        description: 'Criou 100 analogias',
        icon: '💎',
        category: 'milestone'
      })
    }

    // Inserir badges se houver algum novo
    if (badges.length > 0) {
      await supabase.from('badges').insert(badges)
    }

  } catch (error) {
    console.error('Erro ao verificar badges:', error)
  }
}