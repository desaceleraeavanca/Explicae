import { NextRequest, NextResponse } from "next/server"
import { generateText, getOpenRouterApiKey, getOpenRouterConfig } from "@/lib/openrouter"

export async function GET() {
  console.log("[DEBUG-ENDPOINT] Endpoint de debug acessado")
  
  try {
    // Teste 1: Verificar se conseguimos importar as dependências
    console.log("[DEBUG-ENDPOINT] Testando imports...")
    console.log("[DEBUG-ENDPOINT] Imports OK")
    
    // Teste 2: Verificar chave da API
    console.log("[DEBUG-ENDPOINT] Verificando chave da API...")
    const openRouterApiKey = await getOpenRouterApiKey()
    console.log(`[DEBUG-ENDPOINT] Chave da API: ${openRouterApiKey ? 'Encontrada' : 'Não encontrada'}`)
    
    if (!openRouterApiKey) {
      return NextResponse.json({ 
        error: "Chave da API não encontrada",
        debug: "API key missing"
      }, { status: 500 })
    }
    
    // Teste 3: Obter modelo da configuração
    console.log("[DEBUG-ENDPOINT] Obtendo configuração do OpenRouter...")
    const config = await getOpenRouterConfig()
    console.log("[DEBUG-ENDPOINT] Modelo padrão:", config.default_model)
    
    // Teste 4: Fazer uma chamada simples usando nossa biblioteca
    console.log("[DEBUG-ENDPOINT] Fazendo chamada de teste...")
    const text = await generateText([
      { role: 'user', content: 'Responda apenas com: OK' }
    ], config.default_model, 10)
    
    console.log("[DEBUG-ENDPOINT] Resposta recebida:", text)
    
    return NextResponse.json({
      success: true,
      message: "Teste bem-sucedido",
      response: text,
      debug: {
        hasApiKey: !!openRouterApiKey,
        responseLength: text.length
      }
    })
    
  } catch (error) {
    console.error("[DEBUG-ENDPOINT] Erro no teste:", error)
    console.error("[DEBUG-ENDPOINT] Stack trace:", error.stack)
    
    return NextResponse.json({
      error: "Erro no teste de debug",
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log("[DEBUG-ENDPOINT] POST recebido")
  
  try {
    const body = await request.json()
    console.log("[DEBUG-ENDPOINT] Body recebido:", body)
    
    return NextResponse.json({
      success: true,
      message: "POST processado com sucesso",
      receivedData: body
    })
    
  } catch (error) {
    console.error("[DEBUG-ENDPOINT] Erro no POST:", error)
    
    return NextResponse.json({
      error: "Erro no POST de debug",
      message: error.message
    }, { status: 500 })
  }
}