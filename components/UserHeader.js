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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 md:h-24 gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">Health Queue</h1>
              <p className="text-sm text-gray-500 mt-0.5">Hospital Appointment System</p>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8" style={{ minWidth: '300px' }}>
            <SearchDoctor />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {/* Appointments Link */}
            <Link
              href="/dashboard/appointments"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">{t('header.appointments')}</span>
            </Link>

            {/* Medical Records Link */}
            <Link
              href="/dashboard/medical-history"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">{t('header.medicalRecords')}</span>
            </Link>

            {/* Notifications */}
            <NotificationDropdown userId={user?.id} />

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Globe className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700 text-sm">
                {language === 'th' ? 'TH' : 'EN'}
              </span>
            </button>

            {/* Profile Menu */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {getUserInitials()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">{t('header.profile')}</span>
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">{t('header.settings')}</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>{t('header.logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <SearchDoctor />
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/dashboard/appointments"
              className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Calendar className="w-5 h-5 text-gray-600" />
              <span>{t('header.appointments')}</span>
            </Link>

            <Link
              href="/dashboard/medical-history"
              className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FileText className="w-5 h-5 text-gray-600" />
              <span>{t('header.medicalRecords')}</span>
            </Link>

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-5 h-5 text-gray-600" />
              <span>{t('header.profile')}</span>
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <span>{t('header.settings')}</span>
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
              <span>{t('header.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
