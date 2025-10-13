import {
  checkAnonymousAccess,
  checkUserAccess,
  trackGeneration,
  consumeCredit,
  getAnonymousId,
} from "@/lib/access-control"
import { getModelForUser, generateText, OpenRouterMessage } from "@/lib/openrouter"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  console.log("[DEBUG] Iniciando geração de analogias...")
  
  try {
    console.log("[DEBUG] Fazendo parse do JSON da requisição...")
    const { concept, audience } = await request.json()
    console.log("[DEBUG] Dados recebidos:", { concept, audience })

    if (!concept || !audience) {
      console.log("[DEBUG] Erro: Conceito ou público-alvo não fornecidos")
      return Response.json({ error: "Conceito e público-alvo são obrigatórios" }, { status: 400 })
    }

    console.log("[DEBUG] Criando cliente Supabase...")
    const supabase = await createClient()
    console.log("[DEBUG] Cliente Supabase criado com sucesso")
    
    console.log("[DEBUG] Obtendo usuário...")
    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log("[DEBUG] Usuário:", user ? `ID: ${user.id}` : "Anônimo")

    let accessCheck
    let modelToUse = "openai/gpt-4o-mini" // Default for anonymous users

    if (!user) {
      console.log("[DEBUG] Processando usuário anônimo...")
      const anonymousId = getAnonymousId()
      console.log("[DEBUG] ID anônimo:", anonymousId)
      accessCheck = await checkAnonymousAccess(anonymousId)
      console.log("[DEBUG] Verificação de acesso anônimo:", accessCheck)

      if (!accessCheck.canGenerate) {
        console.log("[DEBUG] Limite de gerações atingido para usuário anônimo")
        return Response.json(
          {
            error: "limit_reached",
            message: "Você atingiu o limite de gerações gratuitas. Cadastre-se para continuar!",
            redirectTo: "/auth/signup",
          },
          { status: 403 },
        )
      }

      // Set cookie for anonymous tracking
      console.log("[DEBUG] Definindo cookie para usuário anônimo...")
      const cookieStore = cookies()
      cookieStore.set("anonymous_id", anonymousId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })

      // Track generation
      console.log("[DEBUG] Rastreando geração para usuário anônimo...")
      await trackGeneration(null, anonymousId, concept, audience)
      console.log("[DEBUG] Geração rastreada com sucesso")
    } else {
      console.log("[DEBUG] Processando usuário autenticado...")
      accessCheck = await checkUserAccess(user.id)
      console.log("[DEBUG] Verificação de acesso do usuário:", accessCheck)

      if (!accessCheck.canGenerate) {
        let message = "Você atingiu o limite do seu plano."
        const redirectTo = "/pricing"

        if (accessCheck.reason === "trial_expired") {
          message = "Seu período de teste expirou. Faça upgrade para continuar!"
        } else if (accessCheck.reason === "limit_reached") {
          message = "Você atingiu o limite de 100 gerações do plano gratuito. Faça upgrade!"
        } else if (accessCheck.reason === "no_credits") {
          message = "Seus créditos acabaram. Recarregue para continuar!"
        } else if (accessCheck.reason === "subscription_cancelled") {
          message = "Sua assinatura foi cancelada. Renove para continuar!"
        } else if (accessCheck.reason === "payment_pending") {
          message = "Seu pagamento está pendente. Regularize para continuar!"
        }

        return Response.json(
          {
            error: accessCheck.reason,
            message,
            redirectTo,
            usage: {
              used: accessCheck.generationsUsed,
              limit: accessCheck.generationsLimit,
            },
          },
          { status: 403 },
        )
      }

      console.log("[DEBUG] Obtendo modelo para usuário...")
      modelToUse = await getModelForUser(user.id)
      console.log("[DEBUG] Modelo obtido:", modelToUse)

      // Track generation
      console.log("[DEBUG] Rastreando geração para usuário autenticado...")
      await trackGeneration(user.id, null, concept, audience)
      console.log("[DEBUG] Geração rastreada com sucesso")

      // Consume credit if applicable
      if (accessCheck.reason === "ok") {
        console.log("[DEBUG] Consumindo crédito...")
        await consumeCredit(user.id)
        console.log("[DEBUG] Crédito consumido com sucesso")
      }
    }

    console.log("[DEBUG] Preparando mensagens para OpenRouter...")
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `Você é um assistente criativo especialista em comunicação clara e impactante. 
 
Sua missão é gerar analogias únicas, criativas e adaptadas para explicar qualquer conceito de forma simples, visual e memorável — usando referências que façam sentido para o público-alvo especificado. 

📌 REGRAS: 
1. Cada analogia deve ter uma lógica diferente (ex: comparação com objeto, rotina, tecnologia, natureza, etc.) 
2. Adapte totalmente ao público — use o vocabulário, referências culturais e metáforas que essa pessoa reconheceria e entenderia. 
3. Tente incluir uma mini-história ou imagem visual clara em pelo menos uma das analogias. 
4. Uma das analogias pode (e deve) ter um toque de humor, surpresa ou mágica. 
5. Sempre que possível, deixe claro o benefício ou o que o conceito resolve. 
6. **Seja direto e conciso. Evite introduções desnecessárias ou explicações excessivamente longas.** 
7. **Se o público-alvo for vago (ex: 'adultos'), assuma um perfil de adulto curioso, sem conhecimento técnico, e use referências do cotidiano.** 
8. Responda APENAS com um JSON contendo uma lista chamada "analogias" — cada item deve ser uma string com uma analogia completa. 

Formato de resposta (JSON):
{
  "analogias": [
    "Analogia 1 completa em texto",
    "Analogia 2 completa em texto",
    "Analogia 3 completa em texto"
  ]
}`
      },
      {
        role: 'user',
        content: `Crie 3 analogias diferentes para o conceito "${concept}", adaptadas para o universo, linguagem e referências do público "${audience}".`
      }
    ]

    console.log("[DEBUG] Mensagens preparadas com sucesso")
    console.log(`[DEBUG] Usando o modelo: ${modelToUse}`)
    console.log("[DEBUG] Chamando generateText...")

    const text = await generateText(messages, modelToUse, 1000)

    console.log("[DEBUG] Texto gerado pela IA:", text)
    console.log("[DEBUG] Tamanho do texto gerado:", text.length)

    console.log("[v0] Generated text with model:", modelToUse)

    // Parse the JSON response
    try {
      console.log("[DEBUG] Tentando fazer parse do JSON...")
      // Tenta encontrar o JSON na resposta
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error("[DEBUG] Nenhum JSON encontrado na resposta")
        throw new Error("Invalid response format")
      }

      console.log("[DEBUG] JSON encontrado:", jsonMatch[0])
      const result = JSON.parse(jsonMatch[0])
      console.log("[DEBUG] JSON parseado com sucesso:", result)
      
      // Verifica se o resultado tem a estrutura esperada com qualquer uma das chaves
      const analogies = result.analogias || result.analogies || []
      console.log("[DEBUG] Analogias extraídas:", analogies)
      
      if (!analogies || !Array.isArray(analogies)) {
        console.error("[DEBUG] Estrutura de analogias inválida")
        throw new Error("Invalid analogias structure")
      }
      
      console.log("[DEBUG] Retornando resposta de sucesso")
      return Response.json({
        analogies: analogies,
        usage: {
          used: accessCheck.generationsUsed + 1,
          limit: accessCheck.generationsLimit,
          remaining: accessCheck.generationsLimit - accessCheck.generationsUsed - 1,
        },
      })
    } catch (jsonError) {
      console.error("[DEBUG] Erro no parse do JSON:", jsonError)
      console.error("[v0] Error parsing JSON:", jsonError, "Raw text:", text)
      
      // Fallback: Tenta criar uma estrutura de analogias a partir do texto bruto
      console.log("[DEBUG] Tentando fallback...")
      const fallbackAnalogies = []
      const sections = text.split(/\n\n+/)
      
      for (let i = 0; i < sections.length && fallbackAnalogies.length < 3; i++) {
        const section = sections[i].trim()
        if (section && section.length > 10) {
          fallbackAnalogies.push(section)
        }
      }
      
      console.log("[DEBUG] Analogias do fallback:", fallbackAnalogies)
      
      if (fallbackAnalogies.length > 0) {
        console.log("[DEBUG] Retornando resposta de fallback")
        return Response.json({
          analogies: fallbackAnalogies,
          usage: {
            used: accessCheck.generationsUsed + 1,
            limit: accessCheck.generationsLimit,
            remaining: accessCheck.generationsLimit - accessCheck.generationsUsed - 1,
          },
        })
      }
      
      console.error("[DEBUG] Fallback também falhou")
      throw new Error("Failed to parse response and create fallback")
    }
    
  } catch (error) {
    console.error("[DEBUG] Erro detalhado no catch principal:", error)
    console.error("[DEBUG] Nome do erro:", error.name)
    console.error("[DEBUG] Mensagem do erro:", error.message)
    console.error("[DEBUG] Stack trace:", error.stack)
    console.error("[v0] Error in generate-analogies:", error)
    return Response.json({ error: "Erro ao gerar analogias" }, { status: 500 })
  }
}
