'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  console.log("[DEBUG] Função login chamada.")
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  console.log("[DEBUG] Dados do formulário:", data.email, data.password)

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error("[DEBUG] Erro de login:", error.message)
    redirect('/auth/login?error=' + encodeURIComponent(error.message))
  }

  console.log("[DEBUG] Login bem-sucedido. Redirecionando para o dashboard.")
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}