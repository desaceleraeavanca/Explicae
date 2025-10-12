import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Allow all requests for now - we'll add auth protection later
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
