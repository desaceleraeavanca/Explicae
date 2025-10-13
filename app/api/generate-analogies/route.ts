import { generateText } from "@/lib/openrouter"

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

    // Modelo padrão para todos os usuários
    const model = "openai/gpt-4o-mini"

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
8. Responda APENAS com um JSON contendo uma lista chamada \`"analogias"\` — cada item deve ser uma string com uma analogia completa. 
 
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

    console.log("[DEBUG] Gerando analogias com o modelo:", model)
    console.log("[DEBUG] System prompt:", systemPrompt)
    console.log("[DEBUG] User prompt:", userPrompt)

    try {
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

      console.log('[DEBUG] Response from AI:', response)

      // Tenta extrair o JSON da resposta
      let analogies: any[] = []
      
      try {
        // Tenta encontrar um objeto JSON na resposta usando regex
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const jsonStr = jsonMatch[0]
          const parsed = JSON.parse(jsonStr)
          
          if (parsed.analogies && Array.isArray(parsed.analogies)) {
            analogies = parsed.analogies
          } else if (parsed.analogias && Array.isArray(parsed.analogias)) {
            // Suporta resposta em português conforme instrução do prompt
            analogies = parsed.analogias
          } else if (Array.isArray(parsed)) {
            analogies = parsed
          } else {
            // Se não encontrou o formato esperado, usa analogias de fallback
            analogies = [
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
          }
        } else {
          // Se não encontrou JSON, usa analogias de fallback
          analogies = [
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
        }
      } catch (parseError) {
        console.error('[DEBUG] Error parsing AI response:', parseError)
        // Se falhou ao analisar o JSON, usa analogias de fallback
        analogies = [
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
      }

      // Normaliza para objetos { title, description }
      const normalized = analogies.map((item: any, idx: number) => {
        if (typeof item === 'string') {
          return { title: `Analogia ${idx + 1}`, description: item }
        }
        if (item && typeof item === 'object') {
          const description =
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

          const title =
            item.title ||
            item.titulo ||
            item["título"] ||
            `Analogia ${idx + 1}`

          return { title, description }
        }
        return { title: `Analogia ${idx + 1}`, description: String(item) }
      })

      console.log('[DEBUG] Analogias normalizadas:', normalized)
      return Response.json({ analogies: normalized })
    } catch (error) {
      console.error('[DEBUG] Error in generate-analogies:', error)
      console.error("[DEBUG] Stack trace:", error.stack)
      console.error("[v0] Error in generate-analogies:", error)
      
      // Tratamento específico para erro "Not Found" do OpenRouter
      if (error instanceof Error && error.message.includes('Not Found')) {
        return Response.json(
          { 
            error: 'Serviço de IA temporariamente indisponível. Por favor, tente novamente em alguns instantes.',
            details: 'O serviço OpenRouter está temporariamente indisponível.'
          },
          { status: 503 }
        )
      }
      
      // Retorna analogias de fallback em caso de erro
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
  } catch (error) {
    console.error('[DEBUG] Error in generate-analogies outer try-catch:', error)
    console.error("[DEBUG] Stack trace:", error.stack)
    
    // Retorna analogias de fallback em caso de erro
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
