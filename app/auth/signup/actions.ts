'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('fullName') as string,
      }
    }
  }

  const { data: { user }, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/auth/signup?error=' + encodeURIComponent(error.message))
  }

  if (user) {
    // Insert into profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      full_name: data.options.data.full_name,
      email: user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      // Handle error, perhaps redirect with error message
      redirect('/auth/signup?error=' + encodeURIComponent(profileError.message))
    }

    // Insert into user_stats
    const { error: statsError } = await supabase.from('user_stats').insert({
      user_id: user.id,
      total_analogies: 0,
      total_points: 0,
      level: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (statsError) {
      redirect('/auth/signup?error=' + encodeURIComponent(statsError.message))
    }
  }

  revalidatePath('/', 'layout')
  redirect('/auth/signup?success=true')
}