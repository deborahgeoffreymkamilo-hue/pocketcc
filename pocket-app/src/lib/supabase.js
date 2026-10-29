import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawUrl.startsWith('http') &&
  !rawUrl.includes('your_supabase_project_url') &&
  rawKey &&
  !rawKey.includes('your_supabase_anon_key')
)

// Safe fallback placeholder URL for initializing createClient without crashes
const safeUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder-project.supabase.co'
const safeKey = isSupabaseConfigured ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder'

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})
