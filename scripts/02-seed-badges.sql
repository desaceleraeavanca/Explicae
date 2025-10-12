-- Insert initial badges
INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value) VALUES
  ('Primeira Analogia', 'Criou sua primeira analogia', '🎯', 'count', 1),
  ('Analogista Iniciante', 'Criou 10 analogias', '📝', 'count', 10),
  ('Mestre das Analogias', 'Criou 50 analogias', '🎓', 'count', 50),
  ('Lenda Explicadora', 'Criou 100 analogias', '👑', 'count', 100),
  ('Colecionador', 'Favoritou 20 analogias', '⭐', 'special', 20),
  ('Sequência de 7', 'Usou o app por 7 dias seguidos', '🔥', 'streak', 7),
  ('Sequência de 30', 'Usou o app por 30 dias seguidos', '💎', 'streak', 30),
  ('Explorador de Públicos', 'Criou 5 perfis de público-alvo', '🎭', 'special', 5),
  ('Organizador', 'Categorizou 25 analogias', '📚', 'special', 25)
ON CONFLICT (name) DO NOTHING;
