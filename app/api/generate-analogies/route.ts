import { cookies } from "next/headers"
import { generateText, getModelForUser, getOpenRouterConfig } from "@/lib/openrouter"
import { createClient } from "@/lib/supabase/server"
import { checkAnonymousAccess, checkUserAccess, trackGeneration, consumeCredit, getAnonymousId } from "@/lib/access-control"

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
      // Checar acesso (plano/créditos/fair use) antes de gerar
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
          remaining: Math.max((access.generationsLimit || 0) - (access.generationsUsed || 0), 0),
        }
      } else {
        const anonId = getAnonymousId()
        const accessAnon = await checkAnonymousAccess(anonId)
        canGenerate = accessAnon.canGenerate
        denyReason = accessAnon.reason
        usageInfo = {
          used: accessAnon.generationsUsed,
          limit: accessAnon.generationsLimit,
          remaining: Math.max((accessAnon.generationsLimit || 0) - (accessAnon.generationsUsed || 0), 0),
        }
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
                : denyReason === "anonymous_limit_reached"
                  ? "Você atingiu o limite de uso anônimo."
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
          } else if (parsed.analogies && Array.isArray(parsed.analogies)) {
            analogies = parsed.analogies
          } else if (Array.isArray(parsed)) {
            analogies = parsed
          }
        }
      } catch (parseError) {
        console.error('[DEBUG] Error parsing AI response:', parseError)
      }

      // Normaliza para objetos { title, description } com tratamento de strings vazias
      const normalized = analogies.map((item: any, idx: number) => {
        if (typeof item === 'string') {
          const desc = item.trim()
          return { title: `Analogia ${idx + 1}`, description: desc || 'Descrição não disponível.' }
        }
        if (item && typeof item === 'object') {
          const rawDescription =
            item.description ||
            item.descricao ||
            item["descrição"] ||
            item.explicacao ||
            item["explicação"] ||
            item.text ||
            item.analogy ||
            item.conteudo ||
            item.content ||
            ''

          const rawTitle =
            item.title ||
            item.titulo ||
            item["título"] ||
            ''

          const title = typeof rawTitle === 'string' ? rawTitle.trim() : ''
          const description = typeof rawDescription === 'string' ? rawDescription.trim() : ''

          return {
            title: title || `Analogia ${idx + 1}`,
            description: description || 'Descrição não disponível.'
          }
        }
        const str = String(item).trim()
        return { title: `Analogia ${idx + 1}`, description: str || 'Descrição não disponível.' }
      })

      console.log('[DEBUG] Analogias normalizadas:', normalized)

      // Registrar geração e consumir crédito (se aplicável)
      let loggedUserId = null;
      try {
        const supabaseLog = await createClient()
        const { data: { user: logUser } } = await supabaseLog.auth.getUser()
        const anonIdFinal = getAnonymousId()
        
        loggedUserId = logUser?.id || null;
        
        // Inserir diretamente na tabela generations para garantir o registro
        const { error: generationError } = await supabaseLog.from("generations").insert({
          user_id: loggedUserId,
          anonymous_id: anonIdFinal,
          concept,
          audience,
          created_at: new Date().toISOString()
        })
        
        if (generationError) {
          console.error("[DEBUG] Erro ao inserir na tabela generations:", generationError)
          // Tenta o método alternativo se falhar
          await trackGeneration(loggedUserId, anonIdFinal, concept, audience)
        } else {
          console.log("[DEBUG] Geração registrada com sucesso na tabela generations")
        }

        if (loggedUserId) {
          // Usar a nova função que combina incremento de contador e consumo de crédito
          try {
            const { data: usageResult, error: usageError } = await supabaseLog.rpc("increment_user_usage", { user_id: loggedUserId })
            
            if (usageError) {
              console.error("[DEBUG] Erro ao atualizar uso e créditos:", usageError)
              
              // Fallback: tenta os métodos antigos separadamente
              await consumeCredit(loggedUserId)
              
              const { error: incrementError } = await supabaseLog.rpc("increment_analogy_count", { user_id_param: loggedUserId })
              if (incrementError) {
                console.error("[DEBUG] Erro ao incrementar contador de analogias:", incrementError)
                
                // Último recurso: atualiza diretamente a tabela user_stats
                const { data: statsData, error: statsError } = await supabaseLog
                  .from('user_stats')
                  .select('total_analogies')
                  .eq('user_id', loggedUserId)
                  .single()
                  
                if (!statsError && statsData) {
                  const newTotal = (statsData.total_analogies || 0) + 1
                  await supabaseLog
                    .from('user_stats')
                    .update({ 
                      total_analogies: newTotal,
                      last_activity_date: new Date().toISOString().split('T')[0],
                      updated_at: new Date().toISOString()
                    })
                    .eq('user_id', loggedUserId)
                  console.log("[DEBUG] Contador de analogias atualizado diretamente:", newTotal)
                }
              }
            } else {
              console.log("[DEBUG] Uso e créditos atualizados com sucesso")
            }
          } catch (updateError) {
            console.error("[DEBUG] Erro crítico ao atualizar uso e créditos:", updateError)
          }
        }
      } catch (trackErr) {
        console.error('[DEBUG] Falha ao registrar uso/consumir crédito:', trackErr)
      }

      // Recalcula o uso atualizado após registrar a geração
      try {
        const supabaseFinal = await createClient()
        const { data: { user: finalUser } } = await supabaseFinal.auth.getUser()
        let finalUsage: { used: number; limit: number; remaining: number } | null = null

        if (finalUser?.id || loggedUserId) {
          const userId = finalUser?.id || loggedUserId;
          
          // Importante: Primeiro registra a geração no banco de dados
          await supabaseFinal.rpc('increment_user_usage', { user_id: userId })
          console.log('[DEBUG] Incremento direto do contador para usuário logado:', userId)
          
          // Depois busca os dados atualizados
          const access = await checkUserAccess(userId)
          
          const limitVal = access.generationsLimit || (usageInfo?.limit || 0)
          finalUsage = {
            used: access.generationsUsed,
            limit: limitVal,
            remaining: Math.max(limitVal - access.generationsUsed, 0),
          }
        } else {
          const anonId = getAnonymousId()
          const accessAnon = await checkAnonymousAccess(anonId)
          
          // Verifica se há um cookie de uso para usuários anônimos
          const cookieHeader = request.headers.get('cookie') || ''
          const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=')
            if (key) acc[key] = value
            return acc
          }, {} as Record<string, string>)
          
          const usedFromCookie = cookies['anonymous_usage_used'] ? parseInt(cookies['anonymous_usage_used'], 10) : null
          
          // Incrementa +1 imediatamente após registrar a geração para refletir o uso atual
          const baseUsed = usedFromCookie !== null ? 
            usedFromCookie : 
            Math.max(accessAnon.generationsUsed || 0, (usageInfo?.used || 0))
          const nextUsed = baseUsed + 1
          const limitVal = accessAnon.generationsLimit || (usageInfo?.limit || 9)
          finalUsage = {
            used: nextUsed,
            limit: limitVal,
            remaining: Math.max(limitVal - nextUsed, 0),
          }
        }

        return Response.json({ analogies: normalized, usage: finalUsage })
      } catch (usageErr) {
        console.error('[DEBUG] Falha ao recalcular uso após geração:', usageErr)
        // Mesmo com falha no uso, retorna as analogias
        return Response.json({ analogies: normalized })
      }
    } catch (error) {
      console.error('[DEBUG] Error in generate-analogies:', error)
      console.error("[DEBUG] Stack trace:", error.stack)
      
      // Tenta registrar a geração mesmo em caso de erro
      try {
        const supabaseTrackErr = await createClient()
        const { data: { user: trackErrUser } } = await supabaseTrackErr.auth.getUser()
        const anonIdTrack = getAnonymousId()
        await trackGeneration(trackErrUser?.id || null, anonIdTrack, concept || 'N/A', audience || 'N/A')
      } catch (logErr) {
        console.error('[DEBUG] Falha ao registrar geração no fallback de erro:', logErr)
      }

      // Retorna analogias de fallback em caso de erro, incluindo usage se possível
      try {
        const supabaseErr = await createClient()
        const { data: { user: errUser } } = await supabaseErr.auth.getUser()
        let errUsage: { used: number; limit: number; remaining: number } | null = null

        if (errUser?.id) {
          const access = await checkUserAccess(errUser.id)
          errUsage = {
            used: access.generationsUsed,
            limit: access.generationsLimit,
            remaining: Math.max((access.generationsLimit || 0) - (access.generationsUsed || 0), 0),
          }
        } else {
          const anonId = getAnonymousId()
          const accessAnon = await checkAnonymousAccess(anonId)
          // Incrementa +1 imediatamente após registrar a geração para refletir o uso atual
          const nextUsed = (accessAnon.generationsUsed || 0) + 1
          const limitVal = accessAnon.generationsLimit || 9
          errUsage = {
            used: nextUsed,
            limit: limitVal,
            remaining: Math.max(limitVal - nextUsed, 0),
          }
        }

        return Response.json({ 
          analogies: [
            {
              title: "Analogia de Contingência 1",
              description: "Pense no conceito como um quebra-cabeça onde cada peça representa um aspecto diferente que, quando unidas, formam uma imagem completa."
            },
            {
              title: "Analogia de Contingência 2",
              description: "O conceito é como uma receita de bolo, onde cada ingrediente tem seu papel e, quando combinados corretamente, criam algo novo e valioso."
            },
            {
              title: "Analogia de Contingência 3",
              description: "Imagine o conceito como uma viagem, onde cada etapa te leva mais perto do destino final, com diferentes paisagens e experiências ao longo do caminho."
            }
          ],
          usage: errUsage
        })
      } catch (usageInErr) {
        console.error('[DEBUG] Falha ao calcular usage no fallback de erro:', usageInErr)
        return Response.json({ 
          analogies: [
            {
              title: "Analogia de Contingência 1",
              description: "Pense no conceito como um quebra-cabeça onde cada peça representa um aspecto diferente que, quando unidas, formam uma imagem completa."
            },
            {
              title: "Analogia de Contingência 2",
              description: "O conceito é como uma receita de bolo, onde cada ingrediente tem seu papel e, quando combinados corretamente, criam algo novo e valioso."
            },
            {
              title: "Analogia de Contingência 3",
              description: "Imagine o conceito como uma viagem, onde cada etapa te leva mais perto do destino final, com diferentes paisagens e experiências ao longo do caminho."
            }
          ]
        })
      }
    }
  } catch (error) {
    console.error('[DEBUG] Error in generate-analogies outer try-catch:', error)
    console.error("[DEBUG] Stack trace:", error.stack)
    
    // Tenta registrar a geração mesmo sem acesso às variáveis locais
    try {
      const supabaseOuterTrack = await createClient()
      const { data: { user: outerTrackUser } } = await supabaseOuterTrack.auth.getUser()
      const anonIdOuterTrack = getAnonymousId()
      await trackGeneration(outerTrackUser?.id || null, anonIdOuterTrack, 'N/A', 'N/A')
    } catch (outerLogErr) {
      console.error('[DEBUG] Falha ao registrar geração no outer fallback de erro:', outerLogErr)
    }

    // Retorna analogias de fallback em caso de erro, incluindo usage se possível
    try {
      const supabaseOuter = await createClient()
      const { data: { user: outerUser } } = await supabaseOuter.auth.getUser()
      let outerUsage: { used: number; limit: number; remaining: number } | null = null

      if (outerUser?.id) {
        const access = await checkUserAccess(outerUser.id)
        outerUsage = {
          used: access.generationsUsed,
          limit: access.generationsLimit,
          remaining: Math.max((access.generationsLimit || 0) - (access.generationsUsed || 0), 0),
        }
      } else {
        const anonId = getAnonymousId()
        const accessAnon = await checkAnonymousAccess(anonId)
        // Incrementa +1 imediatamente após registrar a geração para refletir o uso atual
        const nextUsed = (accessAnon.generationsUsed || 0) + 1
        const limitVal = accessAnon.generationsLimit || 9
        outerUsage = {
          used: nextUsed,
          limit: limitVal,
          remaining: Math.max(limitVal - nextUsed, 0),
        }
      }

      return Response.json({ 
        analogies: [
          {
            title: "Analogia de Emergência 1",
            description: "Pense no conceito como um quebra-cabeça onde cada peça representa um aspecto diferente que, quando unidas, formam uma imagem completa."
          },
          {
            title: "Analogia de Emergência 2",
            description: "O conceito é como uma receita de bolo, onde cada ingrediente tem seu papel e, quando combinados corretamente, criam algo novo e valioso."
          },
          {
            title: "Analogia de Emergência 3",
            description: "Imagine o conceito como uma viagem, onde cada etapa te leva mais perto do destino final, com diferentes paisagens e experiências ao longo do caminho."
          }
        ],
        usage: outerUsage
      })
    } catch (outerUsageErr) {
      console.error('[DEBUG] Falha ao calcular usage no outer fallback de erro:', outerUsageErr)
      return Response.json({ 
        analogies: [
          {
            title: "Analogia de Emergência 1",
            description: "Pense no conceito como um quebra-cabeça onde cada peça representa um aspecto diferente que, quando unidas, formam uma imagem completa."
          },
          {
            title: "Analogia de Emergência 2",
            description: "O conceito é como uma receita de bolo, onde cada ingrediente tem seu papel e, quando combinados corretamente, criam algo novo e valioso."
          },
          {
            title: "Analogia de Emergência 3",
            description: "Imagine o conceito como uma viagem, onde cada etapa te leva mais perto do destino final, com diferentes paisagens e experiências ao longo do caminho."
          }
        ]
      })
    }
  }
}
