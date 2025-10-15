import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verificar se o usuário está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rotas protegidas que requerem autenticação
  const protectedRoutes = ['/dashboard', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Rotas de autenticação
  const authRoutes = ['/auth/signin', '/auth/signup']
  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname)

  // Se usuário não está logado e tenta acessar rota protegida
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se usuário está logado e tenta acessar rotas de auth
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Verificar se é admin para rotas administrativas
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('plan_type')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.plan_type !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}