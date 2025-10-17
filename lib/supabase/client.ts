import { createBrowserClient, type CookieOptions } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return document.cookie.split(';').find((c) => c.includes(name))?.split('=')[1]
        },
        set(name: string, value: string, options: CookieOptions) {
          document.cookie = `${name}=${value}; ${Object.entries(options)
            .map(([key, val]) => `${key}=${val}`)
            .join('; ')}`
        },
        remove(name: string, options: CookieOptions) {
          document.cookie = `${name}=; Max-Age=0; ${Object.entries(options)
            .map(([key, val]) => `${key}=${val}`)
            .join('; ')}`
        },
      },
    }
  )
}
