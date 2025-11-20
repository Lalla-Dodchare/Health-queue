'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getRedirectPath } from '@/lib/auth'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // รอให้ Supabase set session
        await new Promise(resolve => setTimeout(resolve, 500))

        // ดึงข้อมูล user
        const user = await getCurrentUser()

        if (user) {
          // Redirect ตาม role
          const redirectPath = getRedirectPath(user.role)
          router.push(redirectPath)
        } else {
          // ถ้าไม่มี user ให้กลับไปหน้า login
          router.push('/login?error=auth_failed')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/login?error=auth_failed')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="inline-block">
          <svg
            className="animate-spin h-12 w-12 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <p className="mt-4 text-gray-600 font-medium">กำลังเข้าสู่ระบบ...</p>
      </div>
    </div>
  )
}
