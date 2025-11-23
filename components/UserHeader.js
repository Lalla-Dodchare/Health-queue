'use client'

/**
 * UserHeader Component
 * Main header for patient/user dashboard
 * Features: Search, Appointments, Notifications, Language Switcher, Profile Menu
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, logout } from '@/lib/auth'
import { useTranslation } from '@/hooks/useTranslation'
import SearchDoctor from './SearchDoctor'
import NotificationDropdown from './NotificationDropdown'
import {
  Menu,
  X,
  Calendar,
  FileText,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Globe,
  Activity,
} from 'lucide-react'

export default function UserHeader() {
  const router = useRouter()
  const { t, language, toggleLanguage } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileRef = useRef(null)

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      }
      setLoading(false)
    }
    loadUser()
  }, [])

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle logout
  const handleLogout = async () => {
    await logout()
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U'
    if (user.name) {
      const names = user.name.split(' ')
      if (names.length >= 2) {
        return names[0][0] + names[1][0]
      }
      return names[0][0]
    }
    return user.email?.[0]?.toUpperCase() || 'U'
  }

  if (loading) {
    return (
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="animate-pulse flex items-center justify-between">
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-96 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md border-b border-gray-100">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
              <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight">Health Queue</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden md:block">Hospital Appointment</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0">
            {/* Appointments Link */}
            <Link
              href="/dashboard/appointments"
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            >
              <Calendar className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{t('header.appointments')}</span>
            </Link>

            {/* Notifications */}
            <NotificationDropdown userId={user?.id} />

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
            >
              <Globe className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <span className="font-medium text-gray-700 text-sm">
                {language === 'th' ? 'TH' : 'EN'}
              </span>
            </button>

            {/* Profile Menu with Name */}
            <div ref={profileRef} className="relative flex-shrink-0">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {getUserInitials()}
                </div>
                <div className="text-left max-w-[150px]">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.name || 'User'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-sm text-gray-600 break-all">{user?.email}</p>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">โปรไฟล์</span>
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">ตั้งค่า</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Profile + Menu Button */}
          <div className="flex lg:hidden items-center gap-2 flex-shrink-0">
            {/* Mobile Profile Icon */}
            <Link href="/dashboard/profile" className="flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getUserInitials()}
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/dashboard/appointments"
              className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Calendar className="w-5 h-5 text-gray-600" />
              <span>นัดหมายของฉัน</span>
            </Link>

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-5 h-5 text-gray-600" />
              <span>โปรไฟล์</span>
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <span>ตั้งค่า</span>
            </Link>

            <button
              onClick={toggleLanguage}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg"
            >
              <Globe className="w-5 h-5 text-gray-600" />
              <span>{language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
