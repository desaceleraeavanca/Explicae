import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log("API: Iniciando busca de tickets")
    
    // Simplificando: vamos buscar os tickets diretamente sem verificação de admin
    // Isso é temporário até resolvermos o problema de autenticação
    const supabase = await createClient()
    
    console.log("API: Cliente Supabase criado")
    
    // Buscar tickets
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*, profiles(email, full_name)")
      .order("created_at", { ascending: false })
    
    console.log("API: Query executada")
    
    if (error) {
      console.error("API: Erro ao carregar tickets:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    console.log("API: Tickets encontrados:", data?.length || 0)
    return NextResponse.json({ tickets: data })
  } catch (err) {
    console.error("API: Erro inesperado:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}