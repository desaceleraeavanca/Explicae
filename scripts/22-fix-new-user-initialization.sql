-- Script para garantir que novos usuários tenham monthly_analogies inicializado corretamente
-- Este script corrige o trigger de criação de novos usuários

-- Atualizar a função handle_new_user para incluir monthly_analogies
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile with 100 initial credits for free users
  INSERT INTO public.profiles (id, email, full_name, credits_remaining, plan_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    100,  -- Inicializa com 100 créditos para todos os usuários
    'gratuito'  -- Plano padrão é gratuito
  );
  
  -- Create user stats with monthly_analogies initialized to 0
  INSERT INTO public.user_stats (user_id, total_analogies, monthly_analogies)
  VALUES (NEW.id, 0, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se a coluna plan_type existe na tabela profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'plan_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN plan_type TEXT DEFAULT 'gratuito';
  END IF;
END $$;

-- Garantir que usuários existentes tenham plan_type definido
UPDATE profiles 
SET plan_type = 'gratuito' 
WHERE plan_type IS NULL;

-- Verificar se todos os usuários existentes têm monthly_analogies definido
UPDATE user_stats 
SET monthly_analogies = 0 
WHERE monthly_analogies IS NULL;

-- Verificar se o trigger está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Log de verificação
SELECT 'Trigger atualizado com sucesso. Novos usuários terão monthly_analogies = 0 por padrão.' as status;