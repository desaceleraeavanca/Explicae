export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          plan_type: 'gratuito' | 'credito' | 'mensal' | 'anual' | 'admin' | 'cortesia' | 'parceria' | 'presente'
          subscription_status: 'ativa' | 'pendente' | 'cancelada'
          trial_ends_at: string | null
          credits_remaining: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          plan_type?: 'gratuito' | 'credito' | 'mensal' | 'anual' | 'admin' | 'cortesia' | 'parceria' | 'presente'
          subscription_status?: 'ativa' | 'pendente' | 'cancelada'
          trial_ends_at?: string | null
          credits_remaining?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          plan_type?: 'gratuito' | 'credito' | 'mensal' | 'anual' | 'admin' | 'cortesia' | 'parceria' | 'presente'
          subscription_status?: 'ativa' | 'pendente' | 'cancelada'
          trial_ends_at?: string | null
          credits_remaining?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      generations: {
        Row: {
          id: string
          user_id: string | null
          concept: string
          audience: string
          analogies: Json
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          concept: string
          audience: string
          analogies: Json
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          concept?: string
          audience?: string
          analogies?: Json
          category?: string | null
          created_at?: string
        }
      }
      favorite_analogies: {
        Row: {
          id: string
          user_id: string
          analogy_text: string
          concept: string
          audience: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          analogy_text: string
          concept: string
          audience: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          analogy_text?: string
          concept?: string
          audience?: string
          category?: string | null
          created_at?: string
        }
      }
      audience_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          user_id: string
          badge_type: string
          badge_name: string
          badge_description: string | null
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_type: string
          badge_name: string
          badge_description?: string | null
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_type?: string
          badge_name?: string
          badge_description?: string | null
          earned_at?: string
        }
      }
      anonymous_sessions: {
        Row: {
          id: string
          session_token: string
          generations_count: number | null
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          session_token: string
          generations_count?: number | null
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          session_token?: string
          generations_count?: number | null
          created_at?: string
          expires_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          event_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          event_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          event_data?: Json | null
          created_at?: string
        }
      }
      kiwify_webhooks: {
        Row: {
          id: string
          user_id: string | null
          webhook_data: Json
          processed: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          webhook_data: Json
          processed?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          webhook_data?: Json
          processed?: boolean | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos auxiliares
export type UserPlanType = Database['public']['Tables']['users']['Row']['plan_type']
export type SubscriptionStatus = Database['public']['Tables']['users']['Row']['subscription_status']
export type UserProfile = Database['public']['Tables']['users']['Row']
export type Generation = Database['public']['Tables']['generations']['Row']
export type FavoriteAnalogy = Database['public']['Tables']['favorite_analogies']['Row']
export type AudienceProfile = Database['public']['Tables']['audience_profiles']['Row']
export type Badge = Database['public']['Tables']['badges']['Row']