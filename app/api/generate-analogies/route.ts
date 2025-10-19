import { cookies } from "next/headers"
import { NextResponse } from "next/server";
import { generateText, getOpenRouterConfig } from "@/lib/openrouter"
import { createClient } from "@/lib/supabase/server"
import { checkUserAccess, trackGeneration } from "@/lib/access-control"
import { safeLog, safeError } from "@/lib/logger"

export async function POST(request: Request) {
  safeLog("[DEBUG] Iniciando geração de analogias...")
  
  // Flag para controlar se a geração já foi registrada
  let generationRegistered = false;
  
  try {
    safeLog("[DEBUG] Fazendo parse do JSON da requisição...")
    const { concept, audience } = await request.json()
    safeLog("[DEBUG] Dados recebidos:", { concept, audience })

    if (!concept || !audience) {
      safeLog("[DEBUG] Erro: Conceito ou público-alvo não fornecidos")
      return Response.json({ error: "Conceito e público-alvo são obrigatórios" }, { status: 400 })
    }

    // Determina o modelo com base no plano do usuário ou fallback do sistema
    let model: string | undefined
    const config = await getOpenRouterConfig()
    
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // Bloquear geração para usuários não autenticados
      if (!user?.id) {
        return Response.json({
          error: "login_required",
          message: "Faça login para testar gratuitamente por 7 dias (30 faíscas).",
          title: "Login necessário",
          buttonText: "Fazer login",
          buttonLink: "/auth/login",
        }, { status: 401 })
      }

      // Always use admin configured model, regardless of user status
      model = config.default_model
    } catch (e) {
      safeError("[DEBUG] Erro ao obter usuário:", e)
      // Tratar como não autenticado
      return Response.json({
        error: "login_required",
        message: "Faça login para testar gratuitamente por 7 dias (30 faíscas).",
        title: "Login necessário",
        buttonText: "Fazer login",
        buttonLink: "/auth/login",
      }, { status: 401 })
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
8. Responda APENAS com um JSON contendo uma lista chamada "analogias" — cada item deve ser uma string com uma analogia completa.
9. **Responda sempre no idioma em que o conceito foi apresentado. Se houver múltiplos idiomas, priorize o Português (Brasil).**
10. **Se o conceito for sem sentido, ofensivo, ou impossível de criar uma analogia, responda com o seguinte JSON: {"analogias": ["Desculpe, não consegui criar uma analogia para este conceito. Tente ser mais específico."]}**
 
---
 
🧩 EXEMPLOS:
 
**Conceito:** Blockchain  
**Público-alvo:** Tiktoker de 16 anos  
 
\`\`\`json 
{ 
  "analogias": [ 
    "Blockchain é tipo aquele grupo do WhatsApp onde todo mundo vê a mesma mensagem e ninguém pode apagar o que já foi enviado — todo mundo confia porque não dá pra mudar o que tá lá.", 
    "Imagina um diário gigante que várias pessoas escrevem juntas, mas só adicionam páginas novas e ninguém pode rasgar ou trocar as antigas. Esse diário é o blockchain: super seguro e transparente!", 
    "Pensa no blockchain como um TikTok viral que todo mundo copia certinho, então não tem como inventar uma versão falsa porque todo mundo tem a original guardada." 
  ] 
} 
\`\`\``

    const userPrompt = `Conceito a explicar: ${concept}\nPúblico-alvo: ${audience}`

    safeLog("[DEBUG] Gerando analogias com o modelo:", model)
    safeLog("[DEBUG] System prompt:", systemPrompt)
    safeLog("[DEBUG] User prompt:", userPrompt)

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
                : denyReason === "trial_expired"
                  ? "Seu teste de 7 dias terminou. Faça upgrade para continuar."
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

      safeLog('[DEBUG] Full Response from AI:', response)

      // Analogias de fallback para caso de erro (em formato de strings)
      const fallbackAnalogies = [
        "Pense no conceito como um quebra-cabeça onde cada peça representa um aspecto diferente que, quando unidas, formam uma imagem completa.",
        "O conceito é como uma receita de bolo, onde cada ingrediente tem seu papel e, quando combinados corretamente, criam algo novo e valioso.",
        "Imagine o conceito como uma viagem, onde cada etapa te leva mais perto do destino final, com diferentes paisagens e experiências ao longo do caminho."
      ]
      
      // Tenta extrair o JSON da resposta
      let analogies = fallbackAnalogies
      
      try {
        // Tenta encontrar um objeto JSON na resposta usando regex
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/)
        let jsonStr = response

        if (jsonMatch && jsonMatch[1]) {
          jsonStr = jsonMatch[1]
          safeLog('[DEBUG] Encontrou bloco JSON:', jsonStr.substring(0, 200))
        } else {
          // Se não encontrar o bloco ```json, tenta parsear a resposta inteira
          safeLog('[DEBUG] Bloco ```json não encontrado, tentando parsear resposta inteira.')
          
          // Tenta encontrar qualquer conteúdo entre chaves {}
          const bracesMatch = response.match(/\{[\s\S]*\}/)
          if (bracesMatch) {
            jsonStr = bracesMatch[0]
            safeLog('[DEBUG] Encontrou conteúdo entre chaves:', jsonStr.substring(0, 200))
          }
        }

        safeLog('[DEBUG] JSON string para parsear:', jsonStr.substring(0, 500) + '...')
          
        const parsed = JSON.parse(jsonStr)
        safeLog('[DEBUG] Parsed JSON:', JSON.stringify(parsed).substring(0, 200))
          
        if (parsed.analogias && Array.isArray(parsed.analogias)) {
          analogies = parsed.analogias
          safeLog('[DEBUG] Analogias extraídas com sucesso:', analogies.length)
        } else if (Array.isArray(parsed)) {
          analogies = parsed
          safeLog('[DEBUG] Array extraído com sucesso:', analogies.length)
        } else {
          safeLog('[DEBUG] Formato inesperado na resposta:', Object.keys(parsed))
        }
      } catch (parseError) {
        safeError('[DEBUG] Error parsing AI response:', parseError)
        safeLog('[DEBUG] Usando analogias de fallback devido a erro de parsing')
      }

      // Registra a geração no banco de dados
      try {
        if (!generationRegistered) {
          const supabaseTrack = await createClient()
          const { data: { user: trackUser } } = await supabaseTrack.auth.getUser()
          
          if (trackUser?.id) {
            // Usuário logado
            safeLog('[DEBUG] Registrando geração para usuário:', trackUser.id)
            
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
              safeError('[DEBUG] Erro ao registrar geração:', trackError)
              // Fallback para trackGeneration
              await trackGeneration(trackUser.id, concept, audience)
            }
            
            // Atualiza o uso do usuário
            try {
              // Incrementa o uso do usuário e a contagem de analogias
              const { error: usageError } = await supabaseTrack.rpc('increment_user_usage', {
                p_user_id: trackUser.id
              })
              if (usageError) {
                safeError('[DEBUG] Erro ao incrementar uso do usuário:', usageError)
              }

              const { error: countError } = await supabaseTrack.rpc('increment_analogy_count', {
                p_user_id: trackUser.id
              })
              if (countError) {
                safeError('[DEBUG] Erro ao incrementar contagem de analogias:', countError)
              }

              // Consumir crédito explicitamente (1 faísca por analogia gerada)
              const { error: creditError } = await supabaseTrack.rpc('consume_credit', {
                user_id_param: trackUser.id
              })
              
              if (creditError) {
                safeError('[DEBUG] Erro ao consumir crédito:', creditError)
              } else {
                safeLog('[DEBUG] Crédito consumido com sucesso para o usuário:', trackUser.id)
              }

              // Atualiza usageInfo com dados atuais após as operações
              try {
                const accessAfter = await checkUserAccess(trackUser.id)
                usageInfo = {
                  used: accessAfter.generationsUsed,
                  limit: accessAfter.generationsLimit,
                  remaining: Math.max(0, accessAfter.generationsLimit - accessAfter.generationsUsed),
                }
              } catch (e) {
                safeError('[DEBUG] Erro ao obter uso final:', e)
              }
            } catch (usageUpdateError) {
              safeError('[DEBUG] Erro ao atualizar uso:', usageUpdateError)
            }
            
            // Marca que a geração foi registrada
            generationRegistered = true
          }
        }
      } catch (trackError) {
        safeError('[DEBUG] Erro ao registrar geração:', trackError)
      }

      // Normaliza a saída para o frontend: garante objetos { title, description }
      const analogiesArray = (analogies as any) && (analogies as any).analogias ? (analogies as any).analogias : analogies
      const normalized = Array.isArray(analogiesArray)
        ? analogiesArray.map((item: any, idx: number) => {
            if (typeof item === "string") {
              return { title: `Analogia ${idx + 1}`, description: item }
            }
            const title = item.title || item.titulo || `Analogia ${idx + 1}`
            const description = item.description || item.descricao || item.text || ""
            return { title, description }
          })
        : []

      // Garante que sempre retornamos exatamente 3 analogias
      let resultAnalogies = normalized
      if (resultAnalogies.length < 3) {
        const pad = (fallbackAnalogies || []).map((text, idx) => ({ title: `Analogia ${idx + 1}`, description: text }))
        resultAnalogies = [...resultAnalogies, ...pad].slice(0, 3)
      } else if (resultAnalogies.length > 3) {
        resultAnalogies = resultAnalogies.slice(0, 3)
      }

      return Response.json({
        analogies: resultAnalogies,
        usage: usageInfo || null,
      })
    } catch (error: any) {
      safeError("Erro inesperado no processamento da requisição:", error);

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
    safeError('Unexpected error in POST /api/generate-analogies:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { 
      status: 500 
    });
  }
}
