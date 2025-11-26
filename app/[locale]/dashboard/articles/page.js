'use client'

/**
 * Health Articles Page
 * Display health articles and educational content
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { useTranslation } from '@/hooks/useTranslation'
import UserHeader from '@/components/UserHeader'
import Footer from '@/components/Footer'
import UnifiedChatbot from '@/components/UnifiedChatbot'
import { Heart, Activity, Stethoscope, Baby, Brain, Eye, Utensils, Dumbbell, Smile, Search, SlidersHorizontal, BookOpen } from 'lucide-react'

export default function ArticlesPage() {
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

  // Mock articles data
  const articles = [
    {
      id: 1,
      category: 'lifestyle',
      title: '7 ข้อดีของคนโสด ที่คนมีคู่ต้องอิจฉา',
      excerpt: 'คนโสดสามารถใช้เวลากับตัวเองได้อย่างเต็มที่ สุขภาพ เพราะอาหารการกินควบคุมง่าย มีเวลาออกกำลังกาย และดูแลตัวเองได้ดี',
      content: 'เนื้อหาบทความเต็ม...',
      icon: Activity,
      color: 'green',
      readTime: '5 นาที',
      date: '15 ม.ค. 2025'
    },
    {
      id: 2,
      category: 'children',
      title: 'สายตาเด็กติดบ้านต่างากการเรียนออนไลน์',
      excerpt: 'เมื่อต้องอยู่กับการเรียนออนไลน์ ใช้ถือเป็นหมุนหำคู่ที่จะอันตรายต่อดวงตาของเด็ก วิธีดูแลและป้องกันที่พ่อแม่ควรรู้',
      content: 'เนื้อหาบทความเต็ม...',
      icon: Eye,
      color: 'purple',
      readTime: '7 นาที',
      date: '12 ม.ค. 2025'
    },
    {
      id: 3,
      category: 'technology',
      title: 'ตรวจ DNA Circle Premium แบบพรีเมียม',
      excerpt: 'DNA Circle Premium การตรวจสอบความสุขภาพพรีเมียม แบบระเมียดรู้ถึงสุขภาพตัวเองล่วงหน้า',
      content: 'เนื้อหาบทความเต็ม...',
      icon: Brain,
      color: 'cyan',
      readTime: '10 นาที',
      date: '10 ม.ค. 2025'
    },
    {
      id: 4,
      category: 'heart',
      title: 'วิธีดูแลหัวใจให้แข็งแรง',
      excerpt: 'หัวใจเป็นอวัยวะสำคัญที่สุด เรียนรู้วิธีดูแลให้หัวใจแข็งแรง ป้องกันโรคหัวใจ และมีอายุยืน',
      content: 'เนื้อหาบทความเต็ม...',
      icon: Heart,
      color: 'red',
      readTime: '8 นาที',
      date: '8 ม.ค. 2025'
    },
    {
      id: 5,
      category: 'pregnancy',
      title: 'คู่มือดูแลตัวเองสำหรับคุณแม่ตั้งครรภ์',
      excerpt: 'แนะนำการดูแลตัวเองในช่วงตั้งครรภ์ อาหารที่ควรทาน และการออกกำลังกายที่เหมาะสม',
      content: 'เนื้อหาบทความเต็ม...',
      icon: Baby,
      color: 'pink',
      readTime: '12 นาที',
      date: '5 ม.ค. 2025'
    },
    {
      id: 6,
      category: 'nutrition',
      title: 'อาหารเพื่อสุขภาพที่ควรทานทุกวัน',
      excerpt: 'รวมอาหารที่มีประโยชน์ต่อสุขภาพ ช่วยเสริมภูมิคุ้มกัน และป้องกันโรคต่างๆ',
      content: 'เนื้อหาบทความเต็ม...',
      icon: Utensils,
      color: 'orange',
      readTime: '6 นาที',
      date: '3 ม.ค. 2025'
    },
    {
      id: 7,
      category: 'exercise',
      title: 'ออกกำลังกายอย่างไรให้เหมาะกับวัย',
      excerpt: 'การออกกำลังกายที่เหมาะสมในแต่ละช่วงวัย เพื่อสุขภาพที่ดีและแข็งแรง',
      content: 'เนื้อหาบทความเต็ม...',
      icon: Dumbbell,
      color: 'blue',
      readTime: '9 นาที',
      date: '1 ม.ค. 2025'
    },
    {
      id: 8,
      category: 'mental',
      title: 'จิตใจแข็งแรง สุขภาพดีตามมา',
      excerpt: 'สุขภาพจิตที่ดีส่งผลต่อสุขภาพกายโดยตรง เทคนิคดูแลจิตใจให้แข็งแรง',
      content: 'เนื้อหาบทความเต็ม...',
      icon: Smile,
      color: 'yellow',
      readTime: '7 นาที',
      date: '28 ธ.ค. 2024'
    },
    {
      id: 9,
      category: 'checkup',
      title: 'ตรวจสุขภาพประจำปีสำคัญอย่างไร',
      excerpt: 'ทำไมต้องตรวจสุขภาพประจำปี และควรตรวจอะไรบ้างตามช่วงอายุ',
      content: 'เนื้อหาบทความเต็ม...',
      icon: Stethoscope,
      color: 'indigo',
      readTime: '8 นาที',
      date: '25 ธ.ค. 2024'
    }
  ]

  const categories = [
    { id: 'all', name: 'ทั้งหมด' },
    { id: 'lifestyle', name: 'ไลฟ์สไตล์' },
    { id: 'children', name: 'เด็กและเยาวชน' },
    { id: 'heart', name: 'หัวใจ' },
    { id: 'pregnancy', name: 'ตั้งครรภ์' },
    { id: 'nutrition', name: 'โภชนาการ' },
    { id: 'exercise', name: 'ออกกำลังกาย' },
    { id: 'mental', name: 'สุขภาพจิต' },
    { id: 'technology', name: 'เทคโนโลยี' },
    { id: 'checkup', name: 'ตรวจสุขภาพ' }
  ]

  const getColorClasses = (color) => {
    const colors = {
      green: {
        bg: 'from-green-50 to-green-100',
        icon: 'text-green-600',
        badge: 'bg-green-50 text-green-600'
      },
      purple: {
        bg: 'from-purple-50 to-purple-100',
        icon: 'text-purple-600',
        badge: 'bg-purple-50 text-purple-600'
      },
      cyan: {
        bg: 'from-cyan-50 to-cyan-100',
        icon: 'text-cyan-600',
        badge: 'bg-cyan-50 text-cyan-600'
      },
      red: {
        bg: 'from-red-50 to-red-100',
        icon: 'text-red-600',
        badge: 'bg-red-50 text-red-600'
      },
      pink: {
        bg: 'from-pink-50 to-pink-100',
        icon: 'text-pink-600',
        badge: 'bg-pink-50 text-pink-600'
      },
      orange: {
        bg: 'from-orange-50 to-orange-100',
        icon: 'text-orange-600',
        badge: 'bg-orange-50 text-orange-600'
      },
      blue: {
        bg: 'from-blue-50 to-blue-100',
        icon: 'text-blue-600',
        badge: 'bg-blue-50 text-blue-600'
      },
      yellow: {
        bg: 'from-yellow-50 to-yellow-100',
        icon: 'text-yellow-600',
        badge: 'bg-yellow-50 text-yellow-600'
      },
      indigo: {
        bg: 'from-indigo-50 to-indigo-100',
        icon: 'text-indigo-600',
        badge: 'bg-indigo-50 text-indigo-600'
      }
    }
    return colors[color] || colors.blue
  }

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">บทความสุขภาพ</h1>
          <p className="text-gray-600">อ่านบทความเกี่ยวกับสุขภาพและการดูแลตัวเอง</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาบทความ..."
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
            พบ <span className="font-semibold text-gray-900">{filteredArticles.length}</span> บทความ
          </p>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่พบบทความ</h3>
            <p className="text-gray-600">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนหมวดหมู่</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredArticles.map((article) => {
              const IconComponent = article.icon
              const colorClasses = getColorClasses(article.color)

              return (
                <div
                  key={article.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
                >
                  {/* Article Image/Icon */}
                  <div className={`relative h-48 bg-gradient-to-br ${colorClasses.bg} flex items-center justify-center`}>
                    <IconComponent className={`w-20 h-20 ${colorClasses.icon}`} />
                    <div className="absolute top-4 right-4 bg-white rounded-full p-2 hover:scale-110 transition-transform">
                      <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="p-5">
                    {/* Meta Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-500">{article.date}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500">อ่าน {article.readTime}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 text-xl mb-3">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>

                    {/* Read More Button */}
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                      อ่านต่อ →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Newsletter Subscription */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
          <BookOpen className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">รับบทความสุขภาพล่าสุด</h2>
          <p className="mb-6 text-blue-100">สมัครรับข่าวสารและบทความสุขภาพส่งตรงถึงอีเมลของคุณ</p>
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="อีเมลของคุณ"
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap">
              สมัครรับข่าวสาร
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Chatbot */}
      <UnifiedChatbot userId={user?.id} userRole="user" />
    </div>
  )
}
