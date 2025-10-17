import { createClient } from "@/lib/supabase/server"
import axios from 'axios'
import { unstable_noStore as noStore } from 'next/cache'

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
  noStore()
  const supabase = await createClient()

  const { data, error } = await supabase.from("system_settings").select("value").eq("key", "openrouter_config").single()

  if (error || !data) {
    // Return default config if not found
    return {
      api_key: "",
      default_model: "google/gemini-2.5-flash-lite",
      fallback_model: "google/gemini-2.5-flash-lite",
      fair_use_limit: 1000,
    }
  }

  return data.value as OpenRouterConfig
}

export async function getOpenRouterApiKey(): Promise<string> {
  console.log("[DEBUG] getOpenRouterApiKey - Iniciando busca da chave API")
  
  // Primeiro, tenta pegar da variável de ambiente
  const envKey = process.env.OPENROUTER_API_KEY
  console.log("[DEBUG] getOpenRouterApiKey - Variável de ambiente:", envKey ? `${envKey.substring(0, 10)}...` : 'não encontrada')
  
  if (envKey) {
    console.log("[DEBUG] getOpenRouterApiKey - Usando chave da variável de ambiente")
    return envKey
  }

  console.log("[DEBUG] getOpenRouterApiKey - Buscando configuração do banco de dados")
  // Se não encontrar, busca da configuração do banco
  const config = await getOpenRouterConfig()
  console.log("[DEBUG] getOpenRouterApiKey - Config do banco:", config.api_key ? `${config.api_key.substring(0, 10)}...` : 'não encontrada')
  
  const finalKey = config.api_key || ''
  console.log("[DEBUG] getOpenRouterApiKey - Chave final:", finalKey ? `${finalKey.substring(0, 10)}...` : 'vazia')
  
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
  console.log("[DEBUG] generateText - Chave API obtida:", apiKey ? `${apiKey.substring(0, 15)}...` : 'não encontrada')
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not found')
  }

  const config = await getOpenRouterConfig()
  const primaryModel = model || config.default_model
  const fallbackModel = config.fallback_model
  
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
  console.log("[DEBUG] generateTextWithUsage - Chave API obtida:", apiKey ? `${apiKey.substring(0, 15)}...` : 'não encontrada')
  
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
