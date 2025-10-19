'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { maskEmail, safeLog, safeError } from '@/lib/logger'

// maskEmail agora vem de '@/lib/logger' e nunca logamos senhas.

export async function login(formData: FormData) {
  safeLog("[DEBUG] Função login chamada.")
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // NUNCA logar a senha. Se necessário, apenas email mascarado.
  safeLog("[DEBUG] Tentando login para:", maskEmail(data.email))

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    safeError("[DEBUG] Erro de login:", error.message)
    redirect('/auth/login?error=' + encodeURIComponent(error.message))
  }

  safeLog("[DEBUG] Login bem-sucedido. Redirecionando para o dashboard.")
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}