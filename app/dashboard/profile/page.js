'use client'

/**
 * User Profile Page
 * View and edit user information
 * Change password, notification preferences
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import UserHeader from '@/components/UserHeader'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import {
  User,
  Phone,
  Shield,
  Bell,
  Save,
  Edit2,
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    allergies: '',
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    sms_notifications: false,
    appointment_reminders: true,
  })

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      console.log('👤 Current user from localStorage:', currentUser)
      setUser(currentUser)

      // Try to fetch full profile from Supabase profiles table
      try {
        const { data: userData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        console.log('📋 Supabase query result:', { userData, error })

        if (userData && !error) {
          console.log('✅ User data from Supabase:', userData)

          setFormData({
            full_name: userData.full_name || currentUser.name || '',
            email: userData.email || currentUser.email || '',
            phone: userData.phone || currentUser.phone || '',
            date_of_birth: userData.date_of_birth || '',
            address: userData.address || '',
            emergency_contact_name: userData.emergency_contact_name || '',
            emergency_contact_phone: userData.emergency_contact_phone || '',
            allergies: userData.allergies || '',
          })

          // Load notification preferences
          if (userData.notification_preferences) {
            setNotifications(userData.notification_preferences)
          }
        } else {
          console.warn('⚠️ No data from Supabase, using localStorage data')
          console.error('❌ Supabase error:', error)

          // Fallback to localStorage data
          setFormData({
            full_name: currentUser.name || '',
            email: currentUser.email || '',
            phone: currentUser.phone || '',
            date_of_birth: currentUser.date_of_birth || '',
            address: currentUser.address || '',
            emergency_contact_name: '',
            emergency_contact_phone: '',
            allergies: '',
          })
        }
      } catch (err) {
        console.error('❌ Exception loading user data:', err)

        // Fallback to localStorage data
        setFormData({
          full_name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          date_of_birth: '',
          address: '',
          emergency_contact_name: '',
          emergency_contact_phone: '',
          allergies: '',
        })
      }

      setLoading(false)
    }
    loadUser()
  }, [router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveMessage('')

    try {
      // Check if email changed
      const emailChanged = formData.email !== user.email

      // If email changed, update Supabase Auth email
      if (emailChanged) {
        const { data, error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        })

        if (emailError) {
          console.error('❌ Email update error:', emailError)
          throw new Error('ไม่สามารถเปลี่ยนอีเมลได้: ' + emailError.message)
        }

        console.log('✅ Email change initiated, confirmation sent to new email')
        setSaveMessage('ส่งลิงก์ยืนยันไปที่อีเมลใหม่แล้ว กรุณาตรวจสอบอีเมล')
      }

      // Update profile in Supabase profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          address: formData.address,
          allergies: formData.allergies,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
        })
        .eq('id', user.id)

      if (error) {
        console.error('❌ Supabase update error:', error)
        throw error
      }

      console.log('✅ Profile saved successfully')

      if (!emailChanged) {
        setSaveMessage(t('profile.saved') || 'บันทึกข้อมูลสำเร็จ')
      }

      setEditing(false)

      // Update local user state
      const updatedUser = { ...user, ...formData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

    } catch (error) {
      console.error('❌ Error saving profile:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      setSaveMessage(error.message || t('common.error') || 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(''), 5000)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (passwordData.new_password !== passwordData.confirm_password) {
      setSaveMessage(t('profile.passwordMismatch'))
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    if (passwordData.new_password.length < 6) {
      setSaveMessage(t('profile.passwordTooShort'))
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    try {
      // Use Supabase Auth to update password
      const { data, error } = await supabase.auth.updateUser({
        password: passwordData.new_password
      })

      if (error) throw error

      console.log('✅ Password changed successfully')
      setSaveMessage(t('profile.passwordChanged'))
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
      setTimeout(() => setSaveMessage(''), 3000)

    } catch (error) {
      console.error('❌ Error changing password:', error)
      setSaveMessage(t('common.error') + ': ' + error.message)
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      // Save notification preferences to Supabase profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: notifications
        })
        .eq('id', user.id)

      if (error) throw error

      setSaveMessage(t('profile.notificationsSaved'))
      setTimeout(() => setSaveMessage(''), 3000)

    } catch (error) {
      console.error('Error saving notifications:', error)
      setSaveMessage(t('common.error'))
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('profile.title')}</h1>
          <p className="text-gray-600">{t('profile.description')}</p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveMessage.includes(t('common.error'))
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {saveMessage}
          </div>
        )}

        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              {t('profile.personalInfo')}
            </h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {t('profile.edit')}
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('profile.fullName')}
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('profile.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              {editing && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ การเปลี่ยนอีเมลจะส่งลิงก์ยืนยันไปที่อีเมลใหม่
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('profile.phone')}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('profile.dateOfBirth')}
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('profile.address')}
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!editing}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('profile.allergies') || 'อาการแพ้ยา/อาหาร'}
              </label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                disabled={!editing}
                placeholder={t('profile.allergiesPlaceholder') || 'เช่น แพ้ยาปฏิชีวนะ, แพ้อาหารทะเล'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? t('profile.saving') : t('profile.save')}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                {t('profile.cancel')}
              </button>
            </div>
          )}
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Phone className="w-6 h-6 text-blue-600" />
            {t('profile.emergencyContact')}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('profile.emergencyContactName')}
              </label>
              <input
                type="text"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('profile.emergencyContactPhone')}
              </label>
              <input
                type="tel"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleInputChange}
                disabled={!editing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            {t('profile.changePassword')}
          </h2>

          <form onSubmit={handleChangePassword}>
            <div className="grid md:grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('profile.currentPassword')}
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('profile.newPassword')}
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('profile.confirmPassword')}
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              {t('profile.updatePassword')}
            </button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            {t('profile.notifications')}
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{t('profile.emailNotifications')}</p>
                <p className="text-sm text-gray-600">{t('profile.emailNotificationsDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email_notifications}
                  onChange={() => handleNotificationChange('email_notifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{t('profile.smsNotifications')}</p>
                <p className="text-sm text-gray-600">{t('profile.smsNotificationsDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.sms_notifications}
                  onChange={() => handleNotificationChange('sms_notifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{t('profile.appointmentReminders')}</p>
                <p className="text-sm text-gray-600">{t('profile.appointmentRemindersDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.appointment_reminders}
                  onChange={() => handleNotificationChange('appointment_reminders')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <button
            onClick={handleSaveNotifications}
            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {t('profile.savePreferences')}
          </button>
        </div>
      </div>
    </div>
  )
}
