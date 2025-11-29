'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AdminSidebar from '@/components/admin/Sidebar'
import { Settings, Save, Shield, Bell, Globe, Database } from 'lucide-react'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Settings state
  const [hospitalName, setHospitalName] = useState('Health Queue Hospital')
  const [contactEmail, setContactEmail] = useState('contact@healthqueue.com')
  const [contactPhone, setContactPhone] = useState('02-xxx-xxxx')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('1')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [newMessageNotifications, setNewMessageNotifications] = useState(true)
  const [language, setLanguage] = useState('th')
  const [timezone, setTimezone] = useState('Asia/Bangkok')

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()

      if (!currentUser || currentUser.role !== 'admin') {
        router.push('/login')
        return
      }

      setUser(currentUser)
      loadSettings()
      setLoading(false)
    }

    checkAuth()
  }, [router])

  // Load settings from localStorage
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('admin_settings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setHospitalName(settings.hospitalName || 'Health Queue Hospital')
        setContactEmail(settings.contactEmail || 'contact@healthqueue.com')
        setContactPhone(settings.contactPhone || '02-xxx-xxxx')
        setTwoFactorEnabled(settings.twoFactorEnabled || false)
        setSessionTimeout(settings.sessionTimeout || '1')
        setEmailNotifications(settings.emailNotifications !== false)
        setNewMessageNotifications(settings.newMessageNotifications !== false)
        setLanguage(settings.language || 'th')
        setTimezone(settings.timezone || 'Asia/Bangkok')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  // Save settings to localStorage
  const handleSave = () => {
    setSaving(true)

    const settings = {
      hospitalName,
      contactEmail,
      contactPhone,
      twoFactorEnabled,
      sessionTimeout,
      emailNotifications,
      newMessageNotifications,
      language,
      timezone,
      updatedAt: new Date().toISOString()
    }

    try {
      localStorage.setItem('admin_settings', JSON.stringify(settings))
      alert('✅ บันทึกการตั้งค่าเรียบร้อยแล้ว')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('❌ เกิดข้อผิดพลาดในการบันทึกการตั้งค่า')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0">
        <AdminSidebar user={user} />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ตั้งค่าระบบ</h1>
            <p className="text-gray-600">จัดการการตั้งค่าและกำหนดสิทธิ์การใช้งาน</p>
          </div>

          <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">การตั้งค่าทั่วไป</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อโรงพยาบาล
                  </label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    อีเมลติดต่อ
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">ความปลอดภัย</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">เพิ่มความปลอดภัยด้วย 2FA</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={twoFactorEnabled}
                      onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Session Timeout</p>
                    <p className="text-sm text-gray-600">ออกจากระบบอัตโนมัติเมื่อไม่มีการใช้งาน</p>
                  </div>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="0.25">15 นาที</option>
                    <option value="0.5">30 นาที</option>
                    <option value="1">1 ชั่วโมง</option>
                    <option value="2">2 ชั่วโมง</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">การแจ้งเตือน</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">แจ้งเตือนทางอีเมล</p>
                    <p className="text-sm text-gray-600">รับการแจ้งเตือนทางอีเมล</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">แจ้งเตือนข้อความใหม่</p>
                    <p className="text-sm text-gray-600">แจ้งเตือนเมื่อมีข้อความจากผู้ใช้</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={newMessageNotifications}
                      onChange={(e) => setNewMessageNotifications(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">ระบบ</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ภาษา
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="th">ไทย</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เขตเวลา
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
