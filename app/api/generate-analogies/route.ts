import { cookies } from "next/headers"
import { generateText, getModelForUser, getOpenRouterConfig } from "@/lib/openrouter"
import { createClient } from "@/lib/supabase/server"
import { checkAnonymousAccess, checkUserAccess, trackGeneration, consumeCredit, getAnonymousId } from "@/lib/access-control"

export async function POST(request: Request) {
  console.log("[DEBUG] Iniciando geração de analogias...")
  
  // Flag para controlar se a geração já foi registrada
  let generationRegistered = false;
  
  try {
    console.log("[DEBUG] Fazendo parse do JSON da requisição...")
    const { concept, audience } = await request.json()
    console.log("[DEBUG] Dados recebidos:", { concept, audience })

    if (!concept || !audience) {
      console.log("[DEBUG] Erro: Conceito ou público-alvo não fornecidos")
      return Response.json({ error: "Conceito e público-alvo são obrigatórios" }, { status: 400 })
    }

    // Determina o modelo com base no plano do usuário ou fallback do sistema
    let model: string | undefined
    const config = await getOpenRouterConfig()
    
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.id) {
        model = await getModelForUser(user.id)
      } else {
        model = config.fallback_model
      }
    } catch (e) {
      console.error("[DEBUG] Erro ao obter usuário ou modelo:", e)
      model = config.fallback_model
    }

    // Construção do prompt para o modelo de IA
    const systemPrompt = `Você é um assistente criativo especialista em comunicação clara e impactante. 
 
Sua missão é gerar analogias únicas, criativas e adaptadas para explicar qualquer conceito de forma simples, visual e memorável — usando referências que façam sentido para o público-alvo especificado. 
 
--- 
 
🎯 TAREFA: 
Crie 3 analogias diferentes para o conceito abaixo, adaptadas para o universo, linguagem e referências do público indicado. 
 
--- 
 
📌 REGRAS: 
1. Cada analogia deve ter uma lógica diferente (ex: comparação com objeto, rotina, tecnologia, natureza, etc.) 
2. Adapte totalmente ao público — use o vocabulário, referências culturais e metáforas que essa pessoa reconheceria e entenderia. 
3. Tente incluir uma mini-história ou imagem visual clara em pelo menos uma das analogias. 
4. Uma das analogias pode (e deve) ter um toque de humor, surpresa ou mágica. 
5. Sempre que possível, deixe claro o benefício ou o que o conceito resolve. 
6. **Seja direto e conciso. Evite introduções desnecessárias ou explicações excessivamente longas.** 
7. **Se o público-alvo for vago (ex: 'adultos'), assuma um perfil de adulto curioso, sem conhecimento técnico, e use referências do cotidiano.** 
8. Responda APENAS com um JSON contendo uma lista chamada \`"analogias"\` — cada item deve ter um título e uma descrição. 
 
--- 
 
🧩 EXEMPLO DE RESPOSTA: 
 
\`\`\`json 
{ 
  "analogias": [ 
    {
      "titulo": "Diário Digital Inviolável",
      "descricao": "Blockchain é tipo aquele grupo do WhatsApp onde todo mundo vê a mesma mensagem e ninguém pode apagar o que já foi enviado — todo mundo confia porque não dá pra mudar o que tá lá."
    },
    {
      "titulo": "Livro de Assinaturas Público",
      "descricao": "Imagina um diário gigante que várias pessoas escrevem juntas, mas só adicionam páginas novas e ninguém pode rasgar ou trocar as antigas. Esse diário é o blockchain: super seguro e transparente!"
    },
    {
      "titulo": "Viral Impossível de Falsificar",
      "descricao": "Pensa no blockchain como um TikTok viral que todo mundo copia certinho, então não tem como inventar uma versão falsa porque todo mundo tem a original guardada."
    }
  ] 
} 
\`\`\``

    const userPrompt = `Conceito a explicar: ${concept}\nPúblico-alvo: ${audience}`

    console.log("[DEBUG] Gerando analogias com o modelo:", model)
    console.log("[DEBUG] System prompt:", systemPrompt)
    console.log("[DEBUG] User prompt:", userPrompt)

    try {
      // Checar acesso (plano/créditos/fair use) apenas para usuários logados
      const supabaseAccess = await createClient()
      const { data: { user: accessUser } } = await supabaseAccess.auth.getUser()

      let usageInfo: { used: number; limit: number; remaining: number } | null = null
      let canGenerate = true
      let denyReason = "ok"

      if (accessUser?.id) {
        const access = await checkUserAccess(accessUser.id)
        canGenerate = access.canGenerate
        denyReason = access.reason
        usageInfo = {
          used: access.generationsUsed,
          limit: access.generationsLimit,
          remaining: Math.max(0, access.generationsLimit - access.generationsUsed),
        }
        
        if (!canGenerate) {
          const upgradeMessage = denyReason === "fair_use_limit"
            ? "Você atingiu o limite de fair use deste mês."
            : denyReason === "no_credits"
              ? "Você não possui créditos disponíveis."
              : denyReason === "credits_expired"
                ? "Seus créditos expiraram."
                : denyReason === "limit_reached"
                  ? "Você atingiu seu limite atual."
                  : "Limite atingido. Considere fazer upgrade."

          return Response.json({
            error: "Rate limit",
            message: upgradeMessage,
            title: "Limite atingido",
            buttonText: "Fazer upgrade",
            buttonLink: "/assinatura",
            usage: usageInfo || { used: 0, limit: 0, remaining: 0 },
          }, { status: 403 })
        }
      }

      // Gera o texto com o modelo selecionado
      const response = await generateText(
        [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        model
      )

      console.log('[DEBUG] Response from AI:', response.substring(0, 200) + '...')

      // Analogias de fallback para caso de erro
      const fallbackAnalogies = [
        {
          title: "Analogia Simples",
          description: "Pense no conceito como um quebra-cabeça onde cada peça representa um aspecto diferente que, quando unidas, formam uma imagem completa."
        },
        {
          title: "Analogia Alternativa",
          description: "O conceito é como uma receita de bolo, onde cada ingrediente tem seu papel e, quando combinados corretamente, criam algo novo e valioso."
        },
        {
          title: "Analogia Prática",
          description: "Imagine o conceito como uma viagem, onde cada etapa te leva mais perto do destino final, com diferentes paisagens e experiências ao longo do caminho."
        }
      ]
      
      // Tenta extrair o JSON da resposta
      let analogies = fallbackAnalogies
      
      try {
        // Tenta encontrar um objeto JSON na resposta usando regex
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const jsonStr = jsonMatch[0]
          console.log('[DEBUG] JSON encontrado na resposta:', jsonStr.substring(0, 200) + '...')
          
          const parsed = JSON.parse(jsonStr)
          
          if (parsed.analogias && Array.isArray(parsed.analogias)) {
            analogies = parsed.analogias
          } else if (parsed.analogias && Array.isArray(parsed.analogias)) {
            analogies = parsed.analogias
          } else if (Array.isArray(parsed)) {
            analogies = parsed
          }
        }
      } catch (parseError) {
        console.error('[DEBUG] Error parsing AI response:', parseError)
      }

      // Registra a geração no banco de dados
      try {
        if (!generationRegistered) {
          const supabaseTrack = await createClient()
          const { data: { user: trackUser } } = await supabaseTrack.auth.getUser()
          
          if (trackUser?.id) {
            // Usuário logado
            console.log('[DEBUG] Registrando geração para usuário:', trackUser.id)
            
            // Registra a geração
            const now = new Date().toISOString()
            const { error: trackError } = await supabaseTrack
              .from('generations')
              .insert({
                user_id: trackUser.id,
                concept: concept,
                audience: audience,
                created_at: now,
                updated_at: now
              })
            
            if (trackError) {
              console.error('[DEBUG] Erro ao registrar geração:', trackError)
              // Fallback para trackGeneration
              await trackGeneration(trackUser.id, concept, audience)
            }
            
            // Atualiza o uso do usuário
            try {
              // Incrementa o uso do usuário
              const { error: usageError } = await supabaseTrack.rpc('increment_user_usage', {
                user_id_param: trackUser.id
              })
              
              if (usageError) {
                console.error('[DEBUG] Erro ao incrementar uso do usuário:', usageError)
                
                // Recalcula o uso final
                if (usageInfo) {
                  usageInfo.used += 1
                  usageInfo.remaining = Math.max(0, usageInfo.limit - usageInfo.used)
                }
              }
            } catch (usageUpdateError) {
              console.error('[DEBUG] Erro ao atualizar uso:', usageUpdateError)
            }
            
            // Marca que a geração foi registrada
            generationRegistered = true
          }
        }
      } catch (trackError) {
        console.error('[DEBUG] Erro ao registrar geração:', trackError)
      }

      // Retorna as analogias geradas
      return Response.json({
        analogies,
        usage: usageInfo || { used: 0, limit: 0, remaining: 0 },
      })
    } catch (aiError) {
      console.error('[DEBUG] Error generating analogies:', aiError)
      return Response.json({
        error: "Erro ao gerar analogias",
        message: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
      }, { status: 500 })
    }
  } catch (error) {
    console.error('[DEBUG] Unexpected error:', error)
    return Response.json({
      error: "Erro inesperado",
      message: "Ocorreu um erro inesperado. Por favor, tente novamente.",
    }, { status: 500 })
  }
}
