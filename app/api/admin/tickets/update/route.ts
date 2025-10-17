import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/access-control'

export async function POST(request: NextRequest) {
  try {
    // Verificar se o usuário é admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    
    const isAdmin = await checkAdminAccess(user.id)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }
    
    // Obter dados do corpo da requisição
    const { ticketId, status } = await request.json()
    
    if (!ticketId || !status) {
      return NextResponse.json(
        { error: 'ID do ticket e status são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Atualizar o ticket
    const { error } = await supabase
      .from("support_tickets")
      .update({ status })
      .eq("id", ticketId)
    
    if (error) {
      console.error("Erro ao atualizar ticket:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Erro inesperado:", err)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}