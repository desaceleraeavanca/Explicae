import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
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

    const body = await request.json()
    const { generation_id, title } = body

    if (!generation_id || !title) {
      return NextResponse.json(
        { error: 'ID da geração e título são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a geração existe e pertence ao usuário
    const { data: generation, error: generationError } = await supabase
      .from('generations')
      .select('*')
      .eq('id', generation_id)
      .eq('user_id', user.id)
      .single()

    if (generationError || !generation) {
      return NextResponse.json(
        { error: 'Geração não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se já está nos favoritos
    const { data: existingFavorite } = await supabase
      .from('favorite_analogies')
      .select('id')
      .eq('user_id', user.id)
      .eq('generation_id', generation_id)
      .single()

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Analogia já está nos favoritos' },
        { status: 409 }
      )
    }

    // Adicionar aos favoritos
    const favoriteId = generateId()
    const { error: insertError } = await supabase
      .from('favorite_analogies')
      .insert({
        id: favoriteId,
        user_id: user.id,
        generation_id,
        title
      })

    if (insertError) {
      console.error('Erro ao salvar favorito:', insertError)
      return NextResponse.json(
        { error: 'Erro ao salvar favorito' },
        { status: 500 }
      )
    }

    // Verificar e conceder badges relacionados a favoritos
    const { count: favoriteCount } = await supabase
      .from('favorite_analogies')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { checkAndAwardBadges } = await import('@/app/api/badges/route');
    await checkAndAwardBadges(user.id, 'favorite_count', favoriteCount || 0);

    return NextResponse.json({ id: favoriteId })

  } catch (error) {
    console.error('Erro na API de favoritos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    // Buscar favoritos do usuário
    const { data: favorites, error } = await supabase
      .from('favorite_analogies')
      .select(`
        *,
        generations (
          concept,
          audience,
          analogy,
          explanation,
          usage_tips,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar favoritos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar favoritos' },
        { status: 500 }
      )
    }

    return NextResponse.json(favorites)

  } catch (error) {
    console.error('Erro na API de favoritos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const favoriteId = searchParams.get('id')

    if (!favoriteId) {
      return NextResponse.json(
        { error: 'ID do favorito é obrigatório' },
        { status: 400 }
      )
    }

    // Remover dos favoritos
    const { error } = await supabase
      .from('favorite_analogies')
      .delete()
      .eq('id', favoriteId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao remover favorito:', error)
      return NextResponse.json(
        { error: 'Erro ao remover favorito' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro na API de favoritos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}