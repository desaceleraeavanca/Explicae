import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateTextWithUsage } from "@/lib/openrouter"
import { checkAdminAccess } from "@/lib/access-control"

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
        { error: 'Acesso negado - apenas admins podem testar modelos' },
        { status: 403 }
      )
    }
    
    // Obter dados do corpo da requisição
    const { model, prompt, maxTokens } = await request.json()
    
    if (!model || !prompt) {
      return NextResponse.json(
        { error: 'Modelo e prompt são obrigatórios' },
        { status: 400 }
      )
    }
    
    console.log(`[MODEL-TEST] Admin ${user.email} testando modelo: ${model}`)
    console.log(`[MODEL-TEST] Prompt: ${prompt.substring(0, 100)}...`)
    
    const startTime = Date.now()
    
    try {
      // Testar o modelo específico usando a nova função com usage
      const result = await generateTextWithUsage(
        [
          {
            role: 'user',
            content: prompt
          }
        ],
        model, // Força o uso do modelo específico
        maxTokens || 500
      )
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      console.log(`[MODEL-TEST] Sucesso! Modelo ${model} respondeu em ${duration}ms`)
      console.log(`[MODEL-TEST] Usage:`, result.usage)
      
      return NextResponse.json({
        success: true,
        model: result.model,
        response: result.content,
        duration: duration,
        timestamp: new Date().toISOString(),
        prompt: prompt,
        usage: {
          prompt_tokens: result.usage.prompt_tokens,
          completion_tokens: result.usage.completion_tokens,
          total_tokens: result.usage.total_tokens,
          total_cost: result.usage.total_cost || 0
        }
      })
      
    } catch (modelError: any) {
      const endTime = Date.now()
      const duration = endTime - startTime
      
      console.error(`[MODEL-TEST] Erro no modelo ${model}:`, modelError)
      
      return NextResponse.json({
        success: false,
        model: model,
        error: modelError.message,
        duration: duration,
        timestamp: new Date().toISOString(),
        prompt: prompt,
        usage: null
      })
    }
    
  } catch (err) {
    console.error("Erro inesperado no teste de modelo:", err)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}