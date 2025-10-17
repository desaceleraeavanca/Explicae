-- Script para testar se novos usuários são criados corretamente
-- Este script simula a criação de um usuário e verifica os dados

-- 1. Criar um usuário de teste (simulando o que o Supabase Auth faria)
-- NOTA: Este é apenas um teste - em produção o Supabase Auth cria o usuário automaticamente

-- Primeiro, vamos verificar se já existe um usuário de teste
SELECT 'Verificando se usuário de teste já existe...' as status;

SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'teste-trigger@explicae.com'
LIMIT 1;

-- Se não existir, vamos simular a criação (apenas para teste)
-- IMPORTANTE: Em produção, isso é feito automaticamente pelo Supabase Auth

DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Verificar se o usuário de teste já existe
    SELECT id INTO test_user_id 
    FROM auth.users 
    WHERE email = 'teste-trigger@explicae.com';
    
    IF test_user_id IS NULL THEN
        -- Gerar um UUID para o teste
        test_user_id := gen_random_uuid();
        
        -- Simular inserção na tabela auth.users (isso normalmente é feito pelo Supabase Auth)
        -- NOTA: Isso pode não funcionar devido às permissões, mas vamos tentar
        BEGIN
            INSERT INTO auth.users (
                id, 
                email, 
                raw_user_meta_data,
                created_at,
                updated_at,
                email_confirmed_at
            ) VALUES (
                test_user_id,
                'teste-trigger@explicae.com',
                '{"full_name": "Usuário Teste Trigger"}'::jsonb,
                NOW(),
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Usuário de teste criado com ID: %', test_user_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Não foi possível criar usuário na tabela auth.users (permissões). Erro: %', SQLERRM;
            RAISE NOTICE 'Vamos testar manualmente inserindo dados nas tabelas profiles e user_stats...';
            
            -- Se não conseguir inserir em auth.users, vamos testar manualmente
            -- Inserir diretamente nas tabelas que o trigger criaria
            INSERT INTO public.profiles (id, email, full_name, credits_remaining, plan_type)
            VALUES (
                test_user_id,
                'teste-trigger@explicae.com',
                'Usuário Teste Manual',
                100,
                'gratuito'
            );
            
            INSERT INTO public.user_stats (user_id, total_analogies, monthly_analogies)
            VALUES (test_user_id, 0, 0);
            
            RAISE NOTICE 'Dados inseridos manualmente para teste com ID: %', test_user_id;
        END;
    ELSE
        RAISE NOTICE 'Usuário de teste já existe com ID: %', test_user_id;
    END IF;
END $$;

-- 2. Verificar se os dados foram criados corretamente
SELECT 'Verificando dados do perfil...' as status;

SELECT 
    p.id,
    p.email,
    p.full_name,
    p.credits_remaining,
    p.plan_type,
    p.created_at
FROM public.profiles p
WHERE p.email = 'teste-trigger@explicae.com';

SELECT 'Verificando dados das estatísticas...' as status;

SELECT 
    us.user_id,
    us.total_analogies,
    us.monthly_analogies,
    us.total_favorites,
    us.current_streak,
    us.created_at
FROM public.user_stats us
JOIN public.profiles p ON us.user_id = p.id
WHERE p.email = 'teste-trigger@explicae.com';

-- 3. Verificar se o access-control funcionaria corretamente
SELECT 'Testando como o access-control interpretaria esses dados...' as status;

SELECT 
    p.email,
    p.plan_type,
    p.credits_remaining,
    us.monthly_analogies,
    us.total_analogies,
    CASE 
        WHEN p.plan_type = 'gratuito' THEN us.monthly_analogies
        WHEN p.plan_type = 'credito' THEN us.total_analogies
        ELSE 0
    END as generations_used_seria,
    CASE 
        WHEN p.plan_type = 'gratuito' THEN 100
        WHEN p.plan_type = 'credito' THEN p.credits_remaining
        ELSE 999999
    END as generations_limit_seria
FROM public.profiles p
JOIN public.user_stats us ON p.id = us.user_id
WHERE p.email = 'teste-trigger@explicae.com';

-- 4. Resultado final
SELECT 'Teste concluído! Verifique os resultados acima.' as resultado_final;