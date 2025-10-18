import { createClient } from "@/lib/supabase/server"
import axios from 'axios'
import { unstable_noStore as noStore } from 'next/cache'
import { sanitizeForLogs } from "@/lib/logger"

// Sanitização centralizada: usando sanitizeForLogs de '@/lib/logger'

export interface OpenRouterConfig {
  api_key: string
  default_model: string
  fallback_model: string
  fair_use_limit: number
}

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenRouterResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
    cost?: number
    total_cost?: number
  }
}

export async function getOpenRouterConfig(): Promise<OpenRouterConfig> {
  // Forçar revalidação completa
  noStore()
  
  // Criar um cliente Supabase fresco a cada chamada
  const supabase = await createClient()
  
  // Adicionar timestamp e ID único para garantir que não use cache
  const timestamp = new Date().getTime()
  const randomId = Math.random().toString(36).substring(2, 15)
  console.log(`[MODEL-TEST] Buscando configuração com timestamp: ${timestamp}, id: ${randomId}`)

  // Usar fetch direto para evitar qualquer cache do Supabase
  try {
    const { data: rawConfig, error: rawError } = await supabase.rpc('get_raw_openrouter_config')
    
    if (rawConfig) {
      // Sanitizar dados sensíveis antes de logar
      const sanitizedConfig = sanitizeForLogs(rawConfig);
      console.log(`[MODEL-TEST] Configuração RAW encontrada:`, JSON.stringify(sanitizedConfig, null, 2))
      
      // Se temos dados RAW, vamos usá-los diretamente
      if (typeof rawConfig === 'object' && rawConfig !== null) {
        console.log(`[MODEL-TEST] Usando configuração RAW do banco`)
        
        // Verificar se é um objeto válido com as propriedades necessárias
        const config = rawConfig as any
        if (config.api_key !== undefined && 
            config.default_model !== undefined && 
            config.fallback_model !== undefined) {
          
          console.log(`[MODEL-TEST] Modelo configurado: ${config.default_model}`)
          console.log(`[MODEL-TEST] Modelo fallback: ${config.fallback_model}`)
          
          return {
            api_key: config.api_key || "",
            default_model: config.default_model || "google/gemini-2.5-flash-lite",
            fallback_model: config.fallback_model || "google/gemini-2.5-flash-lite",
            fair_use_limit: config.fair_use_limit || 1000,
          }
        }
      }
    } else {
      console.log(`[MODEL-TEST] Erro ao buscar configuração RAW:`, rawError)
    }
  } catch (e) {
    console.log(`[MODEL-TEST] Exceção ao buscar configuração RAW:`, e)
  }

  // Fallback para o método normal se o RAW falhar
  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select(`value, updated_at`)
      .eq("key", "openrouter_config")
      .single()

    if (error || !data) {
      console.log(`[MODEL-TEST] Configuração não encontrada, usando padrão`)
      // Return default config if not found
      return {
        api_key: "",
        default_model: "google/gemini-2.5-flash-lite",
        fallback_model: "google/gemini-2.5-flash-lite",
        fair_use_limit: 1000,
      }
    }

    console.log(`[MODEL-TEST] Configuração encontrada, última atualização: ${data.updated_at}`)
    console.log(`[MODEL-TEST] Modelo configurado: ${data.value.default_model}`)
    console.log(`[MODEL-TEST] Modelo fallback: ${data.value.fallback_model}`)
    
    return data.value as OpenRouterConfig
  } catch (e) {
    console.log(`[MODEL-TEST] Erro ao buscar configuração:`, e)
    // Return default config if error
    return {
      api_key: "",
      default_model: "google/gemini-2.5-flash-lite",
      fallback_model: "google/gemini-2.5-flash-lite",
      fair_use_limit: 1000,
    }
  }
}

export async function getOpenRouterApiKey(): Promise<string> {
  console.log("[DEBUG] getOpenRouterApiKey - Iniciando busca da chave API")
  
  // Primeiro, tenta pegar da variável de ambiente
  const envKey = process.env.OPENROUTER_API_KEY
  console.log("[DEBUG] getOpenRouterApiKey - Variável de ambiente:", envKey ? "***chave encontrada***" : 'não encontrada')
  
  if (envKey) {
    console.log("[DEBUG] getOpenRouterApiKey - Usando chave da variável de ambiente")
    return envKey
  }

  console.log("[DEBUG] getOpenRouterApiKey - Buscando configuração do banco de dados")
  // Se não encontrar, busca da configuração do banco
  const config = await getOpenRouterConfig()
  console.log("[DEBUG] getOpenRouterApiKey - Config do banco:", config.api_key ? "***chave encontrada***" : 'não encontrada')
  
  const finalKey = config.api_key || ''
  console.log("[DEBUG] getOpenRouterApiKey - Chave final:", finalKey ? "***chave encontrada***" : 'vazia')
  
  return finalKey
}

export async function updateOpenRouterConfig(config: OpenRouterConfig, userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("system_settings")
    .update({
      value: config,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("key", "openrouter_config")

  return !error
}

export async function getModelForUser(userId: string): Promise<string> {
  const config = await getOpenRouterConfig()
  
  // Always use the admin configured model, regardless of user subscription
  return config.default_model
}

/**
 * Generate text using OpenRouter API with direct HTTP requests
 */
export interface OpenRouterUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  total_cost?: number
}

export interface OpenRouterResult {
  content: string
  usage: OpenRouterUsage
  model: string
}

async function makeOpenRouterRequest(
  apiKey: string,
  model: string,
  messages: OpenRouterMessage[],
  maxTokens: number,
  headers: any
): Promise<OpenRouterResult> {
  const requestData = {
    model: model,
    messages: messages,
    max_tokens: maxTokens,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: false,
    usage: {
      include: true
    }
  }

  console.log(`[DEBUG] makeOpenRouterRequest - Tentando modelo: ${model}`)
  
  const response = await axios.post<OpenRouterResponse>(
    'https://openrouter.ai/api/v1/chat/completions',
    requestData,
    {
      headers,
      timeout: 30000 // 30 seconds timeout
    }
  )

  console.log(`[DEBUG] makeOpenRouterRequest - Resposta recebida para ${model}:`, response.status, response.statusText)

  if (!response.data.choices || response.data.choices.length === 0) {
    throw new Error('No response from OpenRouter API')
  }

  const usage: OpenRouterUsage = {
    prompt_tokens: response.data.usage?.prompt_tokens || 0,
    completion_tokens: response.data.usage?.completion_tokens || 0,
    total_tokens: response.data.usage?.total_tokens || 0,
    total_cost: response.data.usage?.total_cost || response.data.usage?.cost || 0
  }

  console.log(`[DEBUG] makeOpenRouterRequest - Usage data:`, {
    prompt_tokens: usage.prompt_tokens,
    completion_tokens: usage.completion_tokens,
    total_tokens: usage.total_tokens,
    total_cost: usage.total_cost,
    raw_usage: response.data.usage
  })

  console.log(`[DEBUG] makeOpenRouterRequest - Usage para ${model}:`, usage)

  return {
    content: response.data.choices[0].message.content,
    usage: usage,
    model: response.data.model || model
  }
}

export async function generateText(
  messages: OpenRouterMessage[],
  model?: string,
  maxTokens: number = 1000
): Promise<string> {
  console.log("[DEBUG] generateText - Iniciando função")
  
  const apiKey = await getOpenRouterApiKey()
  console.log("[DEBUG] generateText - Chave API obtida:", apiKey ? "***chave encontrada***" : 'não encontrada')
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not found')
  }

  const config = await getOpenRouterConfig()
  const primaryModel = model || config.default_model
  const fallbackModel = config.fallback_model
  
  console.log("[MODEL-TEST] ====================================")
  console.log("[MODEL-TEST] MODELO CONFIGURADO:", config.default_model)
  console.log("[MODEL-TEST] MODELO SENDO USADO:", primaryModel)
  console.log("[MODEL-TEST] MODELO FALLBACK:", fallbackModel)
  console.log("[MODEL-TEST] ====================================")
  
  console.log("[DEBUG] generateText - Modelo principal:", primaryModel)
  console.log("[DEBUG] generateText - Modelo fallback:", fallbackModel)
  
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'Explica AI'
  }

  // Primeira tentativa: modelo principal
  try {
    console.log("[DEBUG] generateText - Tentativa 1: Usando modelo principal")
    const result = await makeOpenRouterRequest(apiKey, primaryModel, messages, maxTokens, headers)
    console.log("[DEBUG] generateText - ✅ Sucesso com modelo principal")
    return result.content
  } catch (primaryError) {
    console.warn("[DEBUG] generateText - ⚠️ Falha no modelo principal:", primaryError)
    
    // Se os modelos são iguais, não tenta fallback
    if (primaryModel === fallbackModel) {
      console.error("[DEBUG] generateText - Modelos são iguais, não há fallback disponível")
      throw primaryError
    }
    
    // Segunda tentativa: modelo fallback
    try {
      console.log("[DEBUG] generateText - Tentativa 2: Usando modelo fallback")
      const result = await makeOpenRouterRequest(apiKey, fallbackModel, messages, maxTokens, headers)
      console.log("[DEBUG] generateText - ✅ Sucesso com modelo fallback")
      console.log("[FALLBACK] Modelo principal falhou, usado fallback:", { primaryModel, fallbackModel })
      return result.content
    } catch (fallbackError) {
      console.error("[DEBUG] generateText - ❌ Ambos os modelos falharam")
      console.error("[DEBUG] generateText - Erro principal:", primaryError)
      console.error("[DEBUG] generateText - Erro fallback:", fallbackError)
      
      // Retorna o erro mais específico
      if (axios.isAxiosError(primaryError)) {
        if (primaryError.response?.status === 401) {
          throw new Error('Invalid OpenRouter API key')
        } else if (primaryError.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.')
        } else if (primaryError.response?.status === 500) {
          throw new Error('OpenRouter service temporarily unavailable')
        }
      }
      
      throw new Error(`Both primary and fallback models failed. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`)
    }
  }
}

// Nova função para testes que retorna dados completos incluindo usage
export async function generateTextWithUsage(
  messages: OpenRouterMessage[],
  model?: string,
  maxTokens: number = 1000
): Promise<OpenRouterResult> {
  console.log("[DEBUG] generateTextWithUsage - Iniciando função")
  
  const apiKey = await getOpenRouterApiKey()
  console.log("[DEBUG] generateTextWithUsage - Chave API obtida:", apiKey ? "***chave encontrada***" : 'não encontrada')
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not found')
  }

  const config = await getOpenRouterConfig()
  const primaryModel = model || config.default_model
  const fallbackModel = config.fallback_model
  
  console.log("[DEBUG] generateTextWithUsage - Modelo principal:", primaryModel)
  console.log("[DEBUG] generateTextWithUsage - Modelo fallback:", fallbackModel)
  
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'Explica AI'
  }

  // Primeira tentativa: modelo principal
  try {
    console.log("[DEBUG] generateTextWithUsage - Tentativa 1: Usando modelo principal")
    const result = await makeOpenRouterRequest(apiKey, primaryModel, messages, maxTokens, headers)
    console.log("[DEBUG] generateTextWithUsage - ✅ Sucesso com modelo principal")
    return result
  } catch (primaryError) {
    console.warn("[DEBUG] generateTextWithUsage - ⚠️ Falha no modelo principal:", primaryError)
    
    // Se os modelos são iguais, não tenta fallback
    if (primaryModel === fallbackModel) {
      console.error("[DEBUG] generateTextWithUsage - Modelos são iguais, não há fallback disponível")
      throw primaryError
    }
    
    // Segunda tentativa: modelo fallback
    try {
      console.log("[DEBUG] generateTextWithUsage - Tentativa 2: Usando modelo fallback")
      const result = await makeOpenRouterRequest(apiKey, fallbackModel, messages, maxTokens, headers)
      console.log("[DEBUG] generateTextWithUsage - ✅ Sucesso com modelo fallback")
      console.log("[FALLBACK] Modelo principal falhou, usado fallback:", { primaryModel, fallbackModel })
      return result
    } catch (fallbackError) {
      console.error("[DEBUG] generateTextWithUsage - ❌ Ambos os modelos falharam")
      console.error("[DEBUG] generateTextWithUsage - Erro principal:", primaryError)
      console.error("[DEBUG] generateTextWithUsage - Erro fallback:", fallbackError)
      
      // Retorna o erro mais específico
      if (axios.isAxiosError(primaryError)) {
        if (primaryError.response?.status === 401) {
          throw new Error('Invalid OpenRouter API key')
        } else if (primaryError.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.')
        } else if (primaryError.response?.status === 500) {
          throw new Error('OpenRouter service temporarily unavailable')
        }
      }
      
      throw new Error(`Both primary and fallback models failed. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`)
    }
  }
}

/**
 * Test OpenRouter connection
 */
export async function testOpenRouterConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const testMessages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: 'Hello, this is a test message. Please respond with "Connection successful".'
      }
    ]

    const response = await generateText(testMessages, undefined, 50)
    
    return {
      success: true,
      message: `Connection successful. Response: ${response}`
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
