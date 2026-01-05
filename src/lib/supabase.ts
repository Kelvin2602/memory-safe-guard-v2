import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/database'

/**
 * Environment configuration với validation
 */
const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const

/**
 * Validate environment variables
 */
function validateConfig() {
  const missing = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}

// Validate config on module load
validateConfig()

/**
 * Supabase client instance với cấu hình tối ưu cho password manager
 * 
 * Note: Cấu hình này phù hợp cho việc sync data giữa devices
 * Nếu chỉ cần local storage, hãy sử dụng IndexedDB thông qua DatabaseManager
 */
export const supabase = createClient<Database>(
  config.supabaseUrl, 
  config.supabaseAnonKey, 
  {
    auth: {
      // Cấu hình auth cho password manager
      autoRefreshToken: true, // Bật để maintain session
      persistSession: true,   // Persist để user không cần login lại
      detectSessionInUrl: false, // Tắt vì không cần OAuth redirect
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'memory-safe-guard'
      }
    }
  }
)

/**
 * Utility functions cho Supabase operations
 */
export class SupabaseService {
  /**
   * Test connection đến Supabase
   */
  static async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('passwords').select('count').limit(1)
      return !error
    } catch {
      return false
    }
  }

  /**
   * Sync local data với Supabase (nếu cần)
   */
  static async syncWithLocal() {
    // TODO: Implement sync logic between IndexedDB and Supabase
    // Có thể sử dụng khi cần backup hoặc sync giữa devices
  }
}

/**
 * Type-safe Supabase client
 */
export type SupabaseClient = typeof supabase

/**
 * Re-export types để sử dụng trong components
 */
export type { Database } from './types/database'