import { supabase } from './supabase'

/**
 * ตรวจสอบ role ของผู้ใช้จาก admins/doctors tables
 * - ถ้ามี row ใน admins → admin
 * - ถ้ามี row ใน doctors → doctor
 * - ถ้าไม่มีทั้งสอง → user
 */
export const getUserRole = async (userId) => {
  try {
    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (!adminError && adminData) {
      return 'admin'
    }

    // Note: doctors table no longer has user_id column (removed in V2 migration)
    // Doctors are now external contacts (contact_type, contact_email, contact_name)
    // If a doctor needs to login, they should be added to admins table with role='doctor'

    // Default to regular user
    return 'user'
  } catch (error) {
    console.error('Error getting user role:', error)
    return 'user'
  }
}

/**
 * ดึงข้อมูลผู้ใช้ปัจจุบันจาก Supabase Auth session
 * Identity = auth.users (primary source)
 * Metadata = profiles (optional)
 */
export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return null
    }

    const user = session.user

    // Get user profile from profiles table - เลือกเฉพาะ full_name
    // ข้อมูลอื่นจะ fetch แยกเมื่อต้องการใช้ เพื่อความปลอดภัย
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()

    // ไม่ต้อง error ถ้าไม่มี profile - ใช้ข้อมูลจาก auth.users แทน
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError)
    }

    // Get role from admins/doctors tables (FK to auth.users.id)
    const role = await getUserRole(user.id)

    // ⚠️ SECURITY: เก็บเฉพาะข้อมูลที่จำเป็นใน client
    // ข้อมูลส่วนตัวอื่นๆ (phone, allergies, date_of_birth) จะ fetch ผ่าน API เมื่อต้องการ
    return {
      id: user.id,
      email: user.email,
      role: role,
      full_name: profile?.full_name || user.user_metadata?.full_name || user.email.split('@')[0],
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Login with email and password using Supabase Auth
 */
export const loginWithEmail = async (email, password) => {
  try {
    console.log('🔵 Attempting Supabase Auth login:', email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ Login error:', error)
      throw error
    }

    if (!data.session) {
      throw new Error('No session created')
    }

    console.log('✅ Login successful, getting user role...')

    // Get user role from database
    const role = await getUserRole(data.user.id)

    console.log('✅ User role:', role)

    // ⚠️ SECURITY: ส่งกลับเฉพาะข้อมูลที่จำเป็น
    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: role,
        full_name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
      },
      session: data.session,
    }
  } catch (error) {
    console.error('❌ Login failed:', error)
    return {
      success: false,
      error: error.message || 'เข้าสู่ระบบไม่สำเร็จ',
    }
  }
}

/**
 * Login with Google OAuth
 */
export const loginWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('❌ Google login failed:', error)
    throw error
  }
}

/**
 * Logout from Supabase Auth
 */
export const logout = async () => {
  try {
    await supabase.auth.signOut()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  } catch (error) {
    console.error('Logout error:', error)
  }
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session !== null
  } catch (error) {
    console.error('Error checking authentication:', error)
    return false
  }
}

/**
 * Get redirect path based on role
 */
export const getRedirectPath = (role) => {
  switch (role) {
    case 'user':
      return '/dashboard'
    case 'admin':
      return '/admin/dashboard'
    case 'doctor':
      return '/doctor/dashboard'
    default:
      return '/login'
  }
}

/**
 * Register new user with Supabase Auth
 * Design: auth.users = identity (primary), profiles = metadata (optional)
 */
export const registerWithEmail = async (email, password, fullName) => {
  try {
    console.log('🔵 Starting registration for:', email)

    // 1. สร้าง user ใน Supabase Auth (auth.users) - PRIMARY IDENTITY
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName, // เก็บใน auth.users metadata ด้วย
        },
      },
    })

    if (authError) {
      console.error('❌ Auth signup error:', authError)
      throw authError
    }

    if (!authData.user) {
      throw new Error('No user returned from signUp')
    }

    console.log('✅ Auth user created:', authData.user.id)

    // 2. สร้างหรืออัพเดท profile row (OPTIONAL METADATA)
    // ใช้ upsert เพราะ Supabase อาจมี trigger สร้าง profile อัตโนมัติ
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,  // FK to auth.users.id
        email: email,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id' // ถ้ามี id ซ้ำให้ update แทน insert
      })

    if (profileError) {
      console.error('⚠️ Profile upsert error:', profileError)
      // ไม่ throw error - profiles เป็น optional metadata
      // User ยังสามารถใช้งานได้จาก auth.users เพียงอย่างเดียว
    } else {
      console.log('✅ Profile created/updated successfully')
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session
    }
  } catch (error) {
    console.error('❌ Registration failed:', error)
    return {
      success: false,
      error: error.message || 'การสมัครสมาชิกไม่สำเร็จ',
    }
  }
}
