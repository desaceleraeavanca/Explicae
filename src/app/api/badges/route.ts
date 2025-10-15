import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// GET - Listar badges do usuário
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: badges, error } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar badges:', error);
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }

    // Definir todos os badges disponíveis
    const availableBadges = [
      {
        id: 'first_analogy',
        name: 'Primeira Analogia',
        description: 'Criou sua primeira analogia',
        icon: '🎯',
        requirement: 1,
        type: 'generation_count'
      },
      {
        id: 'analogy_explorer',
        name: 'Explorador de Analogias',
        description: 'Criou 10 analogias',
        icon: '🔍',
        requirement: 10,
        type: 'generation_count'
      },
      {
        id: 'analogy_master',
        name: 'Mestre das Analogias',
        description: 'Criou 50 analogias',
        icon: '🏆',
        requirement: 50,
        type: 'generation_count'
      },
      {
        id: 'analogy_legend',
        name: 'Lenda das Analogias',
        description: 'Criou 100 analogias',
        icon: '👑',
        requirement: 100,
        type: 'generation_count'
      },
      {
        id: 'first_favorite',
        name: 'Primeira Favorita',
        description: 'Salvou sua primeira analogia favorita',
        icon: '⭐',
        requirement: 1,
        type: 'favorite_count'
      },
      {
        id: 'collector',
        name: 'Colecionador',
        description: 'Salvou 25 analogias favoritas',
        icon: '📚',
        requirement: 25,
        type: 'favorite_count'
      },
      {
        id: 'profile_creator',
        name: 'Criador de Perfis',
        description: 'Criou seu primeiro perfil de público-alvo',
        icon: '👥',
        requirement: 1,
        type: 'profile_count'
      },
      {
        id: 'audience_expert',
        name: 'Especialista em Público',
        description: 'Criou 5 perfis de público-alvo',
        icon: '🎭',
        requirement: 5,
        type: 'profile_count'
      }
    ];

    // Buscar estatísticas do usuário
    const { data: userStats } = await supabase
      .from('users')
      .select('generation_count')
      .eq('id', user.id)
      .single();

    const { count: favoriteCount } = await supabase
      .from('favorite_analogies')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: profileCount } = await supabase
      .from('audience_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const stats = {
      generation_count: userStats?.generation_count || 0,
      favorite_count: favoriteCount || 0,
      profile_count: profileCount || 0
    };

    // Mapear badges com status
    const badgesWithStatus = availableBadges.map(badge => {
      const earned = badges.find(b => b.badge_id === badge.id);
      const currentCount = stats[badge.type as keyof typeof stats];
      
      return {
        ...badge,
        earned: !!earned,
        earned_at: earned?.earned_at,
        progress: Math.min(currentCount, badge.requirement),
        progress_percentage: Math.min((currentCount / badge.requirement) * 100, 100)
      };
    });

    return NextResponse.json({ 
      badges: badgesWithStatus,
      stats 
    });
  } catch (error) {
    console.error('Erro na API de badges:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Função auxiliar para verificar e conceder badges
export async function checkAndAwardBadges(userId: string, type: string, count: number) {
  const supabase = createServerClient();
  
  const badgeRules = [
    { id: 'first_analogy', type: 'generation_count', requirement: 1 },
    { id: 'analogy_explorer', type: 'generation_count', requirement: 10 },
    { id: 'analogy_master', type: 'generation_count', requirement: 50 },
    { id: 'analogy_legend', type: 'generation_count', requirement: 100 },
    { id: 'first_favorite', type: 'favorite_count', requirement: 1 },
    { id: 'collector', type: 'favorite_count', requirement: 25 },
    { id: 'profile_creator', type: 'profile_count', requirement: 1 },
    { id: 'audience_expert', type: 'profile_count', requirement: 5 },
  ];

  const eligibleBadges = badgeRules.filter(
    badge => badge.type === type && count >= badge.requirement
  );

  for (const badge of eligibleBadges) {
    // Verificar se o badge já foi concedido
    const { data: existingBadge } = await supabase
      .from('badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badge.id)
      .single();

    if (!existingBadge) {
      // Conceder o badge
      await supabase
        .from('badges')
        .insert({
          user_id: userId,
          badge_id: badge.id,
          earned_at: new Date().toISOString()
        });
    }
  }
}