import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * ⚠️ SECURITY: Custom Storage Adapter
 * กรองข้อมูลส่วนตัวออกจาก session ก่อนเก็บใน localStorage
 * เก็บเฉพาะ access_token, refresh_token และข้อมูลพื้นฐาน
 */
const secureStorage = {
  getItem: (key) => {
    if (typeof window === 'undefined') return null
    const item = window.localStorage.getItem(key)
    return item
  },
  setItem: (key, value) => {
    if (typeof window === 'undefined') return

    try {
      // Parse session data
      const data = JSON.parse(value)

      // ถ้าเป็น session object ให้กรองข้อมูลออก
      if (data && data.user) {
        // เก็บเฉพาะข้อมูลที่จำเป็น
        const sanitizedUser = {
          id: data.user.id,
          email: data.user.email,
          aud: data.user.aud,
          role: data.user.role,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at,
          user_metadata: {
            full_name: data.user.user_metadata?.full_name,
          }
        }

        const sanitizedData = {
          ...data,
          user: sanitizedUser
        }

        window.localStorage.setItem(key, JSON.stringify(sanitizedData))
      } else {
        // สำหรับข้อมูลอื่นๆ เก็บตามปกติ
        window.localStorage.setItem(key, value)
      }
    } catch (e) {
      // ถ้า parse ไม่ได้ เก็บตามปกติ
      window.localStorage.setItem(key, value)
    }
  },
  removeItem: (key) => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(key)
  },
}

// Client-side Supabase client with proper Auth configuration
// ใช้ Supabase Auth จริง (auth.users) ไม่ใช่ custom profiles.password_hash
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // เปิดเพื่อรองรับ magic link / OAuth callbacks
    storage: secureStorage, // ใช้ custom storage ที่กรองข้อมูลแล้ว
  },
})
