import { cookies } from "next/headers"
import { NextResponse } from "next/server";
import { generateText, getOpenRouterConfig } from "@/lib/openrouter"
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

      // Always use admin configured model, regardless of user status
      model = config.default_model
    } catch (e) {
      console.error("[DEBUG] Erro ao obter usuário:", e)
      // Even on error, use admin configured model
      model = config.default_model
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

      console.log('[DEBUG] Full Response from AI:', response)

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
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/)
        let jsonStr = response

        if (jsonMatch && jsonMatch[1]) {
          jsonStr = jsonMatch[1]
          console.log('[DEBUG] Encontrou bloco JSON:', jsonStr.substring(0, 200))
        } else {
          // Se não encontrar o bloco ```json, tenta parsear a resposta inteira
          console.log('[DEBUG] Bloco ```json não encontrado, tentando parsear resposta inteira.')
          
          // Tenta encontrar qualquer conteúdo entre chaves {}
          const bracesMatch = response.match(/\{[\s\S]*\}/)
          if (bracesMatch) {
            jsonStr = bracesMatch[0]
            console.log('[DEBUG] Encontrou conteúdo entre chaves:', jsonStr.substring(0, 200))
          }
        }

        console.log('[DEBUG] JSON string para parsear:', jsonStr.substring(0, 500) + '...')
          
        const parsed = JSON.parse(jsonStr)
        console.log('[DEBUG] Parsed JSON:', JSON.stringify(parsed).substring(0, 200))
          
        if (parsed.analogias && Array.isArray(parsed.analogias)) {
          analogies = parsed.analogias
          console.log('[DEBUG] Analogias extraídas com sucesso:', analogies.length)
        } else if (Array.isArray(parsed)) {
          analogies = parsed
          console.log('[DEBUG] Array extraído com sucesso:', analogies.length)
        } else {
          console.log('[DEBUG] Formato inesperado na resposta:', Object.keys(parsed))
        }
      } catch (parseError) {
        console.error('[DEBUG] Error parsing AI response:', parseError)
        console.log('[DEBUG] Usando analogias de fallback devido a erro de parsing')
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
                created_at: now
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
                p_user_id: trackUser.id
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
        analogies: analogies.analogias || analogies,
      })
    } catch (error: any) {
      console.error("Erro inesperado no processamento da requisição:", error);

      let errorMessage = "Ocorreu um erro inesperado. Por favor, tente novamente.";
      let errorTitle = "Erro inesperado";
      let statusCode = 500;

      if (error.message === "Rate limit") {
        errorMessage = error.message;
        errorTitle = error.title;
        statusCode = 403;
      }

      return NextResponse.json({
        message: errorMessage,
        error: error.message,
        title: errorTitle,
        buttonText: error.buttonText,
        buttonLink: error.buttonLink,
        usage: error.usage,
      }, {
        status: statusCode
      });
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/generate-analogies:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { 
      status: 500 
    });
  }
}
