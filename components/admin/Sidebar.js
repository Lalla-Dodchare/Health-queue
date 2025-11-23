'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Building2,
  BarChart3,
  Star,
  Bell,
  TrendingUp,
  MessageCircle,
  Settings,
  LogOut,
  Calendar,
} from 'lucide-react'
import { logout } from '@/lib/auth'

const navigation = [
  {
    name: 'แดชบอร์ด',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'จัดการนัดหมาย',
    href: '/admin/appointments',
    icon: Calendar,
  },
  {
    name: 'จัดการผู้ใช้งาน',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'จัดการหมอ/ตารางหมอ',
    href: '/admin/doctors',
    icon: Stethoscope,
  },
  {
    name: 'ระบบบริหารกิจ',
    href: '/admin/departments',
    icon: Building2,
  },
  {
    name: 'รายงานการใช้งาน',
    href: '/admin/reports',
    icon: BarChart3,
  },
  {
    name: 'ปักหมุดแนะนำ',
    href: '/admin/hot-service',
    icon: Star,
  },
  {
    name: 'ระบบแจ้งเตือนอัตโนมัติ',
    href: '/admin/notifications',
    icon: Bell,
  },
  {
    name: 'สถิติการเข้าถึง',
    href: '/admin/statistics',
    icon: TrendingUp,
  },
  {
    name: 'ตอบคำถาม/แชท',
    href: '/admin/chat',
    icon: MessageCircle,
    badge: true, // แสดง badge ถ้ามีข้อความใหม่
  },
]

export default function AdminSidebar({ user }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-red-600 to-red-700 text-white">
      {/* Logo & User Info */}
      <div className="p-6 border-b border-red-500">
        <h1 className="text-2xl font-bold mb-1">Health Queue</h1>
        <p className="text-red-100 text-sm">Admin Panel</p>
        <div className="mt-4 p-3 bg-red-500/30 rounded-lg">
          <p className="text-sm font-medium">{user?.name || 'ผู้ดูแลระบบ'}</p>
          <p className="text-xs text-red-100 mt-1">{user?.email || ''}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-white text-red-600 shadow-lg font-semibold'
                    : 'text-red-50 hover:bg-red-500/30 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-sm">{item.name}</span>
              {item.badge && (
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="p-4 border-t border-red-500 space-y-2">
        <button
          onClick={() => router.push('/admin/settings')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-50 hover:bg-red-500/30 hover:text-white transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">ตั้งค่าระบบ</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-50 hover:bg-red-800 hover:text-white transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">ออกจากระบบ</span>
        </button>
      </div>
    </div>
  )
}
