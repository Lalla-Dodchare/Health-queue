'use client'

/**
 * Packages Page
 * Display all available health packages and promotions
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { useTranslation } from '@/hooks/useTranslation'
import UserHeader from '@/components/UserHeader'
import Footer from '@/components/Footer'
import UnifiedChatbot from '@/components/UnifiedChatbot'
import { Heart, User, Zap, Activity, Baby, Users, Brain, Shield, Search, SlidersHorizontal } from 'lucide-react'

export default function PackagesPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        router.push('/login')
        return
      }

      if (currentUser.role !== 'user') {
        router.push(`/${currentUser.role === 'admin' ? 'admin' : 'doctor'}/dashboard`)
        return
      }

      setUser(currentUser)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  // Mock packages data (in real app, fetch from database)
  const packages = [
    {
      id: 1,
      category: 'general',
      name: 'โปรแกรมตรวจสุขภาพประจำปี',
      description: 'ตรวจสุขภาพครอบคลุม เหมาะสำหรับทุกเพศทุกวัย ตรวจเลือด ตรวจปัสสาวะ และการตรวจทั่วไป',
      price: 5990,
      originalPrice: 7500,
      icon: Heart,
      color: 'blue',
      badge: 'แพ็กเกจ 1'
    },
    {
      id: 2,
      category: 'women',
      name: 'โปรแกรมตรวจสุขภาพสำหรับผู้หญิง',
      description: 'ตรวจสุขภาพเฉพาะทางสำหรับผู้หญิง ตรวจมะเร็งเต้านม มะเร็งปากมดลูก และฮอร์โมน',
      price: 8500,
      originalPrice: 11000,
      icon: User,
      color: 'pink',
      badge: 'แพ็กเกจ 2'
    },
    {
      id: 3,
      category: 'elderly',
      name: 'แพ็กเกจตรวจสุขภาพผู้สูงอายุ',
      description: 'ตรวจสุขภาพครอบคลุมสำหรับผู้สูงอายุ ตรวจหัวใจ ไต ตับ และกระดูก',
      price: 12900,
      originalPrice: 15500,
      icon: Zap,
      color: 'amber',
      badge: 'แพ็กเกจ 3'
    },
    {
      id: 4,
      category: 'heart',
      name: 'โปรแกรมตรวจสุขภาพหัวใจ',
      description: 'ตรวจสุขภาพหัวใจครอบคลุม EKG ภาพเอกซเรย์ทรวงอก และการตรวจด้วยคลื่นเสียง',
      price: 7990,
      originalPrice: 9500,
      icon: Activity,
      color: 'red',
      badge: 'ยอดนิยม'
    },
    {
      id: 5,
      category: 'pregnancy',
      name: 'โปรแกรมฝากครรภ์',
      description: 'แพ็กเกจตรวจสุขภาพครอบคลุมสำหรับคุณแม่ตั้งครรภ์ พร้อมคำปรึกษาแพทย์',
      price: 15000,
      originalPrice: 18000,
      icon: Baby,
      color: 'purple',
      badge: 'แนะนำ'
    },
    {
      id: 6,
      category: 'family',
      name: 'แพ็กเกจครอบครัว (4 คน)',
      description: 'ตรวจสุขภาพครอบครัว 4 คน ตรวจทั่วไปครอบคลุม ประหยัดกว่าซื้อแยก',
      price: 19990,
      originalPrice: 25000,
      icon: Users,
      color: 'green',
      badge: 'ประหยัด'
    },
    {
      id: 7,
      category: 'brain',
      name: 'โปรแกรมตรวจสมองและระบบประสาท',
      description: 'ตรวจสุขภาพสมอง MRI การทรงตัว และระบบประสาทครอบคลุม',
      price: 24500,
      originalPrice: 28000,
      icon: Brain,
      color: 'indigo',
      badge: 'พรีเมียม'
    },
    {
      id: 8,
      category: 'cancer',
      name: 'โปรแกรมตรวจมะเร็งเบื้องต้น',
      description: 'ตรวจคัดกรองมะเร็งทั่วไป ตรวจ Tumor Marker และอวัยวะต่างๆ',
      price: 18900,
      originalPrice: 22000,
      icon: Shield,
      color: 'orange',
      badge: 'สำคัญ'
    },
    {
      id: 9,
      category: 'men',
      name: 'โปรแกรมตรวจสุขภาพสำหรับผู้ชาย',
      description: 'ตรวจสุขภาพเฉพาะทางสำหรับผู้ชาย ต่อมลูกหมาก ฮอร์โมน และสุขภาพทั่วไป',
      price: 8900,
      originalPrice: 11500,
      icon: User,
      color: 'cyan',
      badge: 'แพ็กเกจ 4'
    }
  ]

  const categories = [
    { id: 'all', name: 'ทั้งหมด' },
    { id: 'general', name: 'ตรวจทั่วไป' },
    { id: 'women', name: 'สำหรับผู้หญิง' },
    { id: 'men', name: 'สำหรับผู้ชาย' },
    { id: 'elderly', name: 'ผู้สูงอายุ' },
    { id: 'family', name: 'ครอบครัว' },
    { id: 'heart', name: 'หัวใจ' },
    { id: 'pregnancy', name: 'ฝากครรภ์' },
    { id: 'brain', name: 'สมอง' },
    { id: 'cancer', name: 'มะเร็ง' }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'from-blue-50 to-blue-100',
        text: 'text-blue-600',
        badge: 'bg-blue-50 text-blue-600',
        icon: 'text-blue-600'
      },
      pink: {
        bg: 'from-pink-50 to-pink-100',
        text: 'text-pink-600',
        badge: 'bg-pink-50 text-pink-600',
        icon: 'text-pink-600'
      },
      amber: {
        bg: 'from-amber-50 to-amber-100',
        text: 'text-amber-600',
        badge: 'bg-amber-50 text-amber-600',
        icon: 'text-amber-600'
      },
      red: {
        bg: 'from-red-50 to-red-100',
        text: 'text-red-600',
        badge: 'bg-red-50 text-red-600',
        icon: 'text-red-600'
      },
      purple: {
        bg: 'from-purple-50 to-purple-100',
        text: 'text-purple-600',
        badge: 'bg-purple-50 text-purple-600',
        icon: 'text-purple-600'
      },
      green: {
        bg: 'from-green-50 to-green-100',
        text: 'text-green-600',
        badge: 'bg-green-50 text-green-600',
        icon: 'text-green-600'
      },
      indigo: {
        bg: 'from-indigo-50 to-indigo-100',
        text: 'text-indigo-600',
        badge: 'bg-indigo-50 text-indigo-600',
        icon: 'text-indigo-600'
      },
      orange: {
        bg: 'from-orange-50 to-orange-100',
        text: 'text-orange-600',
        badge: 'bg-orange-50 text-orange-600',
        icon: 'text-orange-600'
      },
      cyan: {
        bg: 'from-cyan-50 to-cyan-100',
        text: 'text-cyan-600',
        badge: 'bg-cyan-50 text-cyan-600',
        icon: 'text-cyan-600'
      }
    }
    return colors[color] || colors.blue
  }

  // Filter packages
  const filteredPackages = packages.filter(pkg => {
    const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <UserHeader />

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">แพ็กเกจและโปรโมชั่น</h1>
          <p className="text-gray-600">เลือกแพ็กเกจตรวจสุขภาพที่เหมาะกับคุณ</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาแพ็กเกจ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-500 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            พบ <span className="font-semibold text-gray-900">{filteredPackages.length}</span> แพ็กเกจ
          </p>
        </div>

        {/* Packages Grid */}
        {filteredPackages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่พบแพ็กเกจ</h3>
            <p className="text-gray-600">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนหมวดหมู่</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredPackages.map((pkg) => {
              const IconComponent = pkg.icon
              const colorClasses = getColorClasses(pkg.color)

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
                >
                  {/* Package Image/Icon */}
                  <div className={`relative h-52 bg-gradient-to-br ${colorClasses.bg} flex items-center justify-center`}>
                    <IconComponent className={`w-24 h-24 ${colorClasses.icon}`} />
                    <div className="absolute top-4 right-4 bg-white rounded-full p-2 hover:scale-110 transition-transform">
                      <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="p-6">
                    {/* Badge */}
                    <div className="mb-3">
                      <span className={`text-xs font-medium ${colorClasses.badge} px-3 py-1 rounded-full`}>
                        {pkg.badge}
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="font-semibold text-gray-900 text-xl mb-2">
                      {pkg.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {pkg.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-5">
                      <span className="text-3xl font-bold text-gray-900">
                        {pkg.price.toLocaleString()} ฿
                      </span>
                      {pkg.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {pkg.originalPrice.toLocaleString()} ฿
                        </span>
                      )}
                    </div>

                    {/* Discount Badge */}
                    {pkg.originalPrice && (
                      <div className="mb-4">
                        <span className="inline-block bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
                          ประหยัด {Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}%
                        </span>
                      </div>
                    )}

                    {/* Action Button */}
                    <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                      เลือกแพ็กเกจนี้
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">ไม่แน่ใจว่าควรเลือกแพ็กเกจไหน?</h2>
          <p className="mb-6 text-blue-100">ปรึกษาทีมแพทย์ผู้เชี่ยวชาญของเราเพื่อคำแนะนำที่เหมาะกับคุณ</p>
          <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
            ติดต่อปรึกษา
          </button>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Chatbot */}
      <UnifiedChatbot userId={user?.id} userRole="user" />
    </div>
  )
}
