import { createClient } from "@/lib/supabase/server"

export interface OpenRouterConfig {
  default_model: string
  fallback_model: string
  fair_use_limit: number
}

export async function getOpenRouterConfig(): Promise<OpenRouterConfig> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("system_settings").select("value").eq("key", "openrouter_config").single()

  if (error || !data) {
    // Return default config if not found
    return {
      default_model: "openai/gpt-4o-mini",
      fallback_model: "meta-llama/llama-3.1-8b-instruct:free",
      fair_use_limit: 1000,
    }
  }

  return data.value as OpenRouterConfig
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
  const config = await getOpenRouterConfig()

  // Count generations this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from("generations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString())

  const monthlyGenerations = count || 0

  // If user exceeded fair use limit, use fallback model
  if (monthlyGenerations >= config.fair_use_limit) {
    return config.fallback_model
  }

  return config.default_model
}
