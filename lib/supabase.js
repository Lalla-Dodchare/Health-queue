import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client-side Supabase client with proper Auth configuration
// ใช้ Supabase Auth จริง (auth.users) ไม่ใช่ custom profiles.password_hash
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // เปิดเพื่อรองรับ magic link / OAuth callbacks
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})
