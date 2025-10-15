import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function createSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Database types
export interface User {
  id: string
  email: string
  username: string
  plan_type: 'gratuito' | 'credito' | 'mensal' | 'anual' | 'admin' | 'cortesia' | 'parceria' | 'presente'
  subscription_status: 'ativa' | 'pendente' | 'cancelada'
  created_at: string
  trial_ends_at?: string
  credits_remaining?: number
}

export interface Generation {
  id: string
  user_id: string
  concept: string
  audience: string
  analogies: string[]
  created_at: string
}

export interface FavoriteAnalogy {
  id: string
  user_id: string
  analogy_text: string
  concept: string
  audience: string
  created_at: string
}

export interface AudienceProfile {
  id: string
  user_id: string
  name: string
  description: string
  notes: string
  created_at: string
}

export interface Badge {
  id: string
  user_id: string
  badge_type: string
  earned_at: string
}