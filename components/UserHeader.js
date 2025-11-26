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
import LanguageSelector from './LanguageSelector'
import { supabase } from '@/lib/supabase'
import {
  Menu,
  X,
  Calendar,
  FileText,
  User,
  LogOut,
  ChevronDown,
  Globe,
  Activity,
  Search,
  Building2,
  MapPin,
  ChevronRight,
} from 'lucide-react'

export default function UserHeader() {
  const router = useRouter()
  const { t } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [branchModalOpen, setBranchModalOpen] = useState(false)
  const [branches, setBranches] = useState([])
  const profileRef = useRef(null)
  const branchModalRef = useRef(null)


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

  // Load branches
  useEffect(() => {
    const loadBranches = async () => {
      const { data } = await supabase
        .from('branches')
        .select('*')
        .order('name')
      if (data) setBranches(data)
    }
    loadBranches()
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

  // Close branch modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (branchModalOpen && branchModalRef.current && !branchModalRef.current.contains(event.target)) {
        setBranchModalOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [branchModalOpen])

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
            {/* Book Appointment Button */}
            <Link
              href="/dashboard/book-appointment"
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            >
              <Calendar className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{t('userHeader.bookAppointment')}</span>
            </Link>

            {/* Search Doctor Button */}
            <Link
              href="/dashboard/doctors"
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{t('userHeader.searchDoctor')}</span>
            </Link>

            {/* Select Branch Button */}
            <button
              onClick={() => setBranchModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
            >
              <Building2 className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{t('userHeader.selectBranch')}</span>
            </button>

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

            {/* Language Selector */}
            <LanguageSelector />

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
                      <span className="text-gray-700">{t('userHeader.profile')}</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>{t('userHeader.logout')}</span>
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
              href="/dashboard/book-appointment"
              className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Calendar className="w-5 h-5 text-gray-600" />
              <span>{t('userHeader.bookAppointment')}</span>
            </Link>

            <Link
              href="/dashboard/doctors"
              className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="w-5 h-5 text-gray-600" />
              <span>{t('userHeader.searchDoctor')}</span>
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setBranchModalOpen(true)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg"
            >
              <Building2 className="w-5 h-5 text-gray-600" />
              <span>{t('userHeader.selectBranch')}</span>
            </button>

            <Link
              href="/dashboard/appointments"
              className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Calendar className="w-5 h-5 text-gray-600" />
              <span>{t('header.appointments')}</span>
            </Link>

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-5 h-5 text-gray-600" />
              <span>{t('userHeader.profile')}</span>
            </Link>

            <div className="px-4 py-2">
              <LanguageSelector />
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('userHeader.logout')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Branch Selection Modal */}
      {branchModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div ref={branchModalRef} className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{t('userHeader.selectBranchTitle')}</h2>
                    <p className="text-green-50 text-sm">{t('userHeader.selectBranchDescription')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setBranchModalOpen(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {branches.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t('userHeader.noBranchesFound')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {branches.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => {
                        setBranchModalOpen(false)
                        router.push(`/dashboard/doctors?branch=${branch.id}`)
                      }}
                      className="w-full bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-7 h-7 text-white" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                              {branch.name}
                            </h3>
                            {branch.address && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">{branch.address}</span>
                              </div>
                            )}
                            {branch.phone && (
                              <p className="text-sm text-gray-500 mt-1">
                                {t('userHeader.phone')}: {branch.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
