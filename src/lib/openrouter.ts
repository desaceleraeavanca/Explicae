interface OpenRouterResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

interface AnalogyRequest {
  concept: string
  audience: string
  context?: string
  tone?: 'formal' | 'casual' | 'humorous' | 'technical'
  length?: 'short' | 'medium' | 'long'
}

interface AnalogyResponse {
  analogy: string
  explanation: string
  usage_tips: string[]
}

export class OpenRouterClient {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateAnalogy(request: AnalogyRequest): Promise<AnalogyResponse> {
    const prompt = this.buildPrompt(request)

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'Explicaê - Gerador de Analogias'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: `Você é um especialista em comunicação e criação de analogias. Sua missão é transformar conceitos complexos em analogias simples, memoráveis e eficazes.

INSTRUÇÕES:
1. Crie analogias que sejam universalmente compreensíveis
2. Use referências do cotidiano que o público-alvo conhece
3. Mantenha a precisão conceitual
4. Torne a explicação memorável e envolvente
5. Adapte o tom conforme solicitado

FORMATO DE RESPOSTA (JSON):
{
  "analogy": "A analogia principal em 2-3 frases",
  "explanation": "Explicação de como a analogia funciona e por que é eficaz",
  "usage_tips": ["Dica 1 de uso", "Dica 2 de uso", "Dica 3 de uso"]
}`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const data: OpenRouterResponse = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('Resposta vazia da API')
      }

      // Tentar fazer parse do JSON
      try {
        return JSON.parse(content)
      } catch {
        // Se não conseguir fazer parse, criar resposta estruturada
        return {
          analogy: content,
          explanation: 'Analogia gerada com sucesso',
          usage_tips: [
            'Use esta analogia no início da sua explicação',
            'Reforce a conexão entre os conceitos',
            'Adapte os detalhes conforme necessário'
          ]
        }
      }
    } catch (error) {
      console.error('Erro ao gerar analogia:', error)
      throw new Error('Falha ao gerar analogia. Tente novamente.')
    }
  }

  private buildPrompt(request: AnalogyRequest): string {
    const { concept, audience, context, tone = 'casual', length = 'medium' } = request

    let prompt = `Crie uma analogia para explicar "${concept}" para ${audience}.`

    if (context) {
      prompt += ` Contexto adicional: ${context}.`
    }

    prompt += ` Tom desejado: ${tone}.`
    prompt += ` Tamanho: ${length === 'short' ? 'concisa' : length === 'long' ? 'detalhada' : 'moderada'}.`

    prompt += `

REQUISITOS ESPECÍFICOS:
- A analogia deve ser culturalmente apropriada para o público brasileiro
- Use exemplos do cotidiano que sejam familiares ao público-alvo
- Mantenha a precisão técnica do conceito original
- Torne a explicação envolvente e memorável
- Forneça dicas práticas de como usar a analogia

Responda APENAS com o JSON solicitado, sem texto adicional.`

    return prompt
  }
}

// Função helper para validar limites de uso
export function validateUsageLimits(
  userPlan: string,
  currentUsage: number,
  credits: number
): { canGenerate: boolean; reason?: string } {
  switch (userPlan) {
    case 'free_trial':
      if (currentUsage >= 5) {
        return { canGenerate: false, reason: 'Limite de 5 analogias do teste grátis atingido' }
      }
      break
    
    case 'credits':
      if (credits <= 0) {
        return { canGenerate: false, reason: 'Créditos esgotados' }
      }
      break
    
    case 'monthly':
    case 'annual':
      if (currentUsage >= 1000) {
        return { canGenerate: false, reason: 'Limite mensal de 1000 analogias atingido' }
      }
      break
    
    default:
      return { canGenerate: false, reason: 'Plano inválido' }
  }

  return { canGenerate: true }
}