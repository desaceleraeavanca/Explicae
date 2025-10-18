import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { unstable_noStore as noStore } from 'next/cache'

export async function createClient() {
  // Desativa o cache para todas as chamadas do cliente Supabase
  noStore()
  
  const cookieStore = await cookies()

  // Adiciona um timestamp para evitar cache
  const timestamp = new Date().getTime()
  console.log(`[SUPABASE-CACHE-BUSTER] Criando cliente com timestamp: ${timestamp}`)

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
      // Desativa o cache do Supabase
      auth: {
        persistSession: false
      },
      global: {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'X-Cache-Buster': `${timestamp}`
        }
      }
    }
  )
}
