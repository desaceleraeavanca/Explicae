import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { z } from 'zod';

const createProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  description: z.string().min(1, 'Descrição é obrigatória').max(500, 'Descrição muito longa'),
  age_range: z.string().min(1, 'Faixa etária é obrigatória'),
  education_level: z.string().min(1, 'Nível de educação é obrigatório'),
  interests: z.array(z.string()).min(1, 'Pelo menos um interesse é obrigatório'),
  context: z.string().optional(),
});

const updateProfileSchema = createProfileSchema.partial();

// GET - Listar perfis do usuário
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: profiles, error } = await supabase
      .from('audience_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar perfis:', error);
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Erro na API de perfis:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar novo perfil
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProfileSchema.parse(body);

    // Verificar limite de perfis por usuário (máximo 10)
    const { count } = await supabase
      .from('audience_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (count && count >= 10) {
      return NextResponse.json({ 
        error: 'Limite de perfis atingido. Máximo de 10 perfis por usuário.' 
      }, { status: 400 });
    }

    const { data: profile, error } = await supabase
      .from('audience_profiles')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        description: validatedData.description,
        age_range: validatedData.age_range,
        education_level: validatedData.education_level,
        interests: validatedData.interests,
        context: validatedData.context,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar perfil:', error);
      return NextResponse.json({ error: 'Erro ao criar perfil' }, { status: 500 });
    }

    // Verificar e conceder badges relacionados a perfis
    const { count: profileCount } = await supabase
      .from('audience_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { checkAndAwardBadges } = await import('@/app/api/badges/route');
    await checkAndAwardBadges(user.id, 'profile_count', profileCount || 0);

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Dados inválidos', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Erro na API de perfis:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar perfil
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('id');

    if (!profileId) {
      return NextResponse.json({ error: 'ID do perfil é obrigatório' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Verificar se o perfil pertence ao usuário
    const { data: existingProfile, error: fetchError } = await supabase
      .from('audience_profiles')
      .select('id')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const { data: profile, error } = await supabase
      .from('audience_profiles')
      .update(validatedData)
      .eq('id', profileId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Dados inválidos', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Erro na API de perfis:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Deletar perfil
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('id');

    if (!profileId) {
      return NextResponse.json({ error: 'ID do perfil é obrigatório' }, { status: 400 });
    }

    // Verificar se o perfil pertence ao usuário
    const { data: existingProfile, error: fetchError } = await supabase
      .from('audience_profiles')
      .select('id')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const { error } = await supabase
      .from('audience_profiles')
      .delete()
      .eq('id', profileId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Erro ao deletar perfil:', error);
      return NextResponse.json({ error: 'Erro ao deletar perfil' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Perfil deletado com sucesso' });
  } catch (error) {
    console.error('Erro na API de perfis:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}