import { createClient } from "@/lib/supabase/server"
import axios from 'axios'

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
  }
}

export async function getOpenRouterConfig(): Promise<OpenRouterConfig> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("system_settings").select("value").eq("key", "openrouter_config").single()

  if (error || !data) {
    // Return default config if not found
    return {
      api_key: "",
      default_model: "anthropic/claude-3.5-sonnet",
      fallback_model: "meta-llama/llama-3.1-8b-instruct:free",
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
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", userId)
    .single()

  const config = await getOpenRouterConfig()
  
  // Use premium model for paid users, fallback for free users
  if (profile?.subscription_tier === "premium") {
    return config.default_model
  }
  
  return config.fallback_model
}

/**
 * Generate text using OpenRouter API with direct HTTP requests
 */
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
  const selectedModel = model || config.default_model
  console.log("[DEBUG] generateText - Modelo selecionado:", selectedModel)

  const requestData = {
    model: selectedModel,
    messages: messages,
    max_tokens: maxTokens,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: false
  }
  
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'Explica AI'
  }
  
  console.log("[DEBUG] generateText - Dados da requisição:", JSON.stringify(requestData, null, 2))
  console.log("[DEBUG] generateText - Headers:", JSON.stringify(headers, null, 2))

  try {
    console.log("[DEBUG] generateText - Fazendo requisição para OpenRouter...")
    
    const response = await axios.post<OpenRouterResponse>(
      'https://openrouter.ai/api/v1/chat/completions',
      requestData,
      {
        headers,
        timeout: 30000 // 30 seconds timeout
      }
    )

    console.log("[DEBUG] generateText - Resposta recebida:", response.status, response.statusText)
    console.log("[DEBUG] generateText - Dados da resposta:", JSON.stringify(response.data, null, 2))

    if (!response.data.choices || response.data.choices.length === 0) {
      throw new Error('No response from OpenRouter API')
    }

    return response.data.choices[0].message.content
  } catch (error) {
    console.error('[DEBUG] generateText - Erro completo:', error)
    
    if (axios.isAxiosError(error)) {
      console.error('[DEBUG] generateText - Status do erro:', error.response?.status)
      console.error('[DEBUG] generateText - Dados do erro:', error.response?.data)
      console.error('[DEBUG] generateText - Headers do erro:', error.response?.headers)
      
      if (error.response?.status === 401) {
        throw new Error('Invalid OpenRouter API key')
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      } else if (error.response?.status === 500) {
        throw new Error('OpenRouter service temporarily unavailable')
      } else {
        throw new Error(`OpenRouter API error: ${error.response?.statusText || error.message}`)
      }
    }
    
    throw new Error('Failed to generate text with OpenRouter')
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