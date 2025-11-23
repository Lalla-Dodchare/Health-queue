'use client'

/**
 * User Dashboard Page
 * Main dashboard for patients/users
 * Features: Modern header, quick actions, upcoming appointments, medical chatbot
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useTranslation } from '@/hooks/useTranslation'
import UserHeader from '@/components/UserHeader'
import Footer from '@/components/Footer'
import UnifiedChatbot from '@/components/UnifiedChatbot'
import { Calendar, Heart, User, Zap, Baby, Stethoscope, Activity, Eye, Smile, X, Bone, Camera, Brain, Wind, Droplet, Syringe, Pill, FileText, Ear, Sparkles, Microscope } from 'lucide-react'

export default function UserDashboard() {
  const router = useRouter()
  const { t } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [selectedBranch, setSelectedBranch] = useState(null)

  // Medical centers data with full information (no need to fetch from DB)
  const medicalCenters = [
    {
      id: 1,
      name: 'สุขภาพสตรี',
      nameEn: 'Women\'s Health Center',
      icon: Heart,
      color: 'pink',
      departmentId: 8,
      description: 'ศูนย์สุขภาพสตรี โรงพยาบาลเปาโล ไชยภูมิ 4 ให้บริการตรวจรักษาโรคเฉพาะทางสตรีอย่างครบวงจร ด้วยแพทย์ผู้เชี่ยวชาญที่มีประสบการณ์มากกว่า 15 ปี และเครื่องมือทางการแพทย์ที่ทันสมัย พร้อมดูแลสุขภาพผู้หญิงทุกช่วงวัย ตั้งแต่วัยรุ่น วัยทำงาน ไปจนถึงวัยทอง ด้วยความเอาใจใส่และความเป็นส่วนตัว เรามุ่งเน้นการป้องกันและรักษาโรคด้วยเทคโนโลジีล้ำสมัย เพื่อให้ผู้หญิงทุกคนมีสุขภาพที่ดีและมีคุณภาพชีวิตที่ดีขึ้น ทั้งด้านร่างกายและจิตใจ',
      services: [
        'ตรวจสุขภาพสตรีทั่วไป และตรวจคัดกรองโรคต่างๆ',
        'ฝากครรภ์และดูแลหลังคลอด พร้อมคำปรึกษาการเลี้ยงลูกด้วยนมแม่',
        'ตรวจคัดกรองมะเร็งเต้านมและมะเร็งปากมดลูก ด้วยเครื่องมือทันสมัย',
        'รักษาโรคประจำเดือน ภาวะฮอร์โมนผิดปกติ และโรคเกี่ยวกับระบบสืบพันธุ์',
        'การวางแผนครอบครัว คำปรึกษาการคุมกำเนิด และดูแลสุขภาพก่อนตั้งครรภ์'
      ]
    },
    {
      id: 2,
      name: 'หัวใจ',
      nameEn: 'Heart Center',
      icon: Activity,
      color: 'red',
      departmentId: 2,
      description: 'ศูนย์หัวใจ โรงพยาบาลเปาโล ไชยภูมิ 4 เป็นศูนย์ความเป็นเลิศด้านการดูแลโรคหัวใจและหลอดเลือด มีทีมแพทย์โรคหัวใจผู้เชี่ยวชาญที่ได้รับการรับรองจากสมาคมโรคหัวใจแห่งประเทศไทย พร้อมด้วยเครื่องมือตรวจวินิจฉัยและรักษาที่ทันสมัยที่สุด เรามุ่งมั่นในการให้บริการตรวจหาความเสี่ยง การป้องกัน การรักษา และการฟื้นฟูสภาพหัวใจ เพื่อให้ผู้ป่วยมีหัวใจที่แข็งแรงและมีคุณภาพชีวิตที่ดี พร้อมให้คำปรึกษาด้านการดูแลสุขภาพหัวใจในชีวิตประจำวัน',
      services: [
        'ตรวจคลื่นไฟฟ้าหัวใจ (EKG/ECG) และตรวจคลื่นไฟฟ้าหัวใจขณะออกกำลังกาย (Exercise Stress Test)',
        'ตรวจอัลตราซาวด์หัวใจ (Echocardiography) เพื่อประเมินการทำงานของหัวใจ',
        'ตรวจความดันเลือด 24 ชั่วโมง (Holter Monitor) และตรวจการเต้นของหัวใจตลอด 24 ชั่วโมง',
        'รักษาโรคหัวใจและหลอดเลือด โรคความดันโลหิตสูง และโรคหัวใจเต้นผิดจังหวะ',
        'คำปรึกษาการดูแลสุขภาพหัวใจ โภชนาการ และโปรแกรมฟื้นฟูสภาพหัวใจ'
      ]
    },
    {
      id: 3,
      name: 'กุมารเวช',
      nameEn: 'Pediatrics Center',
      icon: Baby,
      color: 'blue',
      departmentId: 3,
      description: 'ศูนย์กุมารเวช โรงพยาบาลเปาโล ไชยภูมิ 4 ให้บริการดูแลสุขภาพเด็กอย่างครบวงจร ตั้งแต่แรกเกิดจนถึงวัยรุ่น ด้วยทีมกุมารแพทย์ที่มีความเชี่ยวชาญเฉพาะทางและพยาบาลที่มีประสบการณ์ในการดูแลเด็ก เรามีห้องตรวจที่ออกแบบมาเป็นพิเศษให้เด็กรู้สึกสบายใจและไม่กลัว พร้อมอุปกรณ์ทางการแพทย์ที่เหมาะสำหรับเด็กโดยเฉพาะ เรามุ่งเน้นการป้องกันโรค การส่งเสริมพัฒนาการ และการรักษาโรคในเด็ก เพื่อให้ลูกน้อยของคุณเติบโตอย่างแข็งแรงและมีพัฒนาการที่สมวัย',
      services: [
        'ตรวจสุขภาพเด็กทั่วไป ตรวจคัดกรองโรคแทรกซ้อนในทารกแรกเกิด และตรวจสุขภาพก่อนเข้าเรียน',
        'ฉีดวัคซีนป้องกันโรคตามตารางมาตรฐาน และวัคซีนเสริมสำหรับเด็กทุกช่วงวัย',
        'ติดตามและประเมินพัฒนาการเด็ก ตรวจคัดกรองความล่าช้าทางพัฒนาการ',
        'รักษาโรคเด็กทั่วไป โรคติดเชื้อ โรคภูมิแพ้ และโรคเฉพาะทางในเด็ก',
        'คำปรึกษาการเลี้ยงดูบุตร โภชนาการสำหรับเด็ก และปัญหาพฤติกรรมเด็ก'
      ]
    },
    {
      id: 4,
      name: 'ตา',
      nameEn: 'Eye Center',
      icon: Eye,
      color: 'cyan',
      departmentId: 4,
      description: 'ศูนย์ตา โรงพยาบาลเปาโล ไชยภูมิ 4 เป็นศูนย์รักษาโรคตาที่ครบครันที่สุด มีจักษุแพทย์ผู้เชี่ยวชาญที่ได้รับการอบรมเฉพาะทางด้านต่างๆ พร้อมเครื่องมือและอุปกรณ์ทางการแพทย์ที่ทันสมัยที่สุด เช่น เครื่องตรวจจอประสาทตาด้วยคอมพิวเตอร์ เครื่อง OCT และห้องผ่าตัดที่ได้มาตรฐานสากล เรามุ่งมั่นที่จะดูแลสุขภาพดวงตาของคุณให้มีสายตาที่ดี ป้องกันการเกิดโรคตา และรักษาโรคตาทุกชนิดด้วยเทคโนโลยีที่ทันสมัยและปลอดภัย เพื่อให้คุณมองเห็นโลกอย่างชัดเจนตลอดไป',
      services: [
        'ตรวจวัดสายตา ตรวจหักเหแสง และจ่ายแว่นสายตาที่เหมาะสม',
        'รักษาโรคต้อหิน ต้อกระจก และโรคจอประสาทตาเสื่อม',
        'ผ่าตัดต้อกระจก ต้อหิน กล้ามเนื้อตา และผ่าตัดเลเซอร์แก้ไขสายตา',
        'ตรวจจอประสาทตาด้วย OCT สำหรับผู้ป่วยเบาหวานและความดันโลหิตสูง',
        'รักษาโรคตาในเด็ก โรคตาแดง ตาแห้ง และโรคตาต่างๆ ในผู้ใหญ่และผู้สูงอายุ'
      ]
    },
    {
      id: 5,
      name: 'ทันตกรรม',
      nameEn: 'Dental Center',
      icon: Smile,
      color: 'green',
      departmentId: 5,
      description: 'ศูนย์ทันตกรรม โรงพยาบาลเปาโล ไชยภูมิ 4 ให้บริการดูแลสุขภาพช่องปากและฟันอย่างครบวงจร ด้วยทันตแพทย์ผู้เชี่ยวชาญที่มีประสบการณ์และทักษะสูง พร้อมด้วยเทคโนโลยีทางทันตกรรมที่ทันสมัย เช่น เครื่อง X-ray แบบดิจิตอล กล้องภายในปาก และเครื่องมือผ่าตัดที่ได้มาตรฐานสากล เรามุ่งเน้นการดูแลรักษาที่ไม่เจ็บปวด สะอาด ปลอดภัย และได้ผลลัพธ์ที่สวยงามตามธรรมชาติ เพื่อให้คุณมีรอยยิ้มที่สดใสและสุขภาพช่องปากที่ดี',
      services: [
        'ตรวจสุขภาพช่องปากและฟัน ขูดหินปูน และทำความสะอาดฟันเป็นระยะ',
        'อุดฟันด้วยวัสดุคุณภาพสูง ถอนฟัน รักษารากฟัน และผ่าตัดช่องปากเล็กน้อย',
        'ทำฟันปลอมแบบต่างๆ รากฟันเทียมระบบดิจิตอล และบริดจ์ฟันที่สวยงาม',
        'จัดฟันด้วยเทคโนโลยีทันสมัย ทั้งจัดฟันแบบใส และแบบธรรมดา',
        'ฟอกสีฟันแบบมืออาชีพ ติดเพชรที่ฟัน และทำ Veneer เพื่อรอยยิ้มที่สวยงาม'
      ]
    },
    {
      id: 6,
      name: 'ระบบทางเดินอาหารและตับ',
      nameEn: 'Gastroenterology Center',
      icon: Stethoscope,
      color: 'amber',
      departmentId: 6,
      description: 'ศูนย์ระบบทางเดินอาหารและตับ โรงพยาบาลเปาโล ไชยภูมิ 4 เป็นศูนย์เฉพาะทางที่ให้บริการตรวจวินิจฉัยและรักษาโรคระบบทางเดินอาหาร กระเพาะอาหาร ลำไส้ ตับ ท่อน้ำดี และตับอ่อน ด้วยทีมแพทย์ผู้เชี่ยวชาญที่ผ่านการอบรมเฉพาะทางด้านระบบทางเดินอาหารและตับ พร้อมเครื่องมือส่องกล้องและตรวจวินิจฉัยที่ทันสมัย เรามุ่งเน้นการตรวจหาสาเหตุ การรักษาที่ตรงจุด และการป้องกันโรคระบบทางเดินอาหาร เพื่อให้คุณมีสุขภาพที่ดีและคุณภาพชีวิตที่ดีขึ้น',
      services: [
        'ตรวจส่องกล้องระบบทางเดินอาหาร ทั้งส่องกล้องกระเพาะอาหาร และส่องกล้องลำไส้ใหญ่',
        'รักษาโรคกระเพาะอาหารอักเสบ โรคแผลในกระเพาะอาหาร และโรคลำไส้แปรปรวน',
        'รักษาโรคตับ ตับอักเสบ ตับแข็ง โรคท่อน้ำดี และโรคตับอ่อนอักเสบ',
        'ตรวจคัดกรองมะเร็งลำไส้ใหญ่ มะเร็งกระเพาะอาหาร และมะเร็งตับ',
        'คำปรึกษาโภชนาการสำหรับผู้ป่วยโรคระบบทางเดินอาหาร และโปรแกรมดูแลสุขภาพ'
      ]
    },
    {
      id: 7,
      name: 'อายุรกรรม',
      nameEn: 'Internal Medicine',
      icon: User,
      color: 'purple',
      departmentId: 7,
      description: 'ศูนย์อายุรกรรม โรงพยาบาลเปาโล ไชยภูมิ 4 ให้บริการตรวจวินิจฉัยและรักษาโรคทั่วไปและโรคเฉพาะทางในผู้ใหญ่อย่างครบวงจร ด้วยทีมอายุรแพทย์ผู้เชี่ยวชาญที่มีประสบการณ์และความชำนาญในหลากหลายสาขา พร้อมเครื่องมือตรวจวินิจฉัยที่ทันสมัยและห้องปฏิบัติการที่ได้มาตรฐาน เรามุ่งเน้นการดูแลผู้ป่วยแบบองค์รวม ทั้งการรักษาโรคเฉียบพลัน การดูแลโรคเรื้อรัง และการป้องกันโรค เพื่อให้ผู้ป่วยมีสุขภาพที่ดีและสามารถใช้ชีวิตได้อย่างมีคุณภาพ',
      services: [
        'ตรวจรักษาโรคทั่วไป โรคไข้หวัดใหญ่ โรคติดเชื้อต่างๆ และโรคเฉียบพลัน',
        'รักษาและดูแลโรคเรื้อรัง เช่น โรคเบาหวาน ความดันโลหิตสูง ไขมันในเลือดสูง',
        'รักษาโรคติดเชื้อ โรคไข้เลือดออก และโรคติดเชื้อทางเดินหายใจ',
        'ตรวจสุขภาพประจำปี ตรวจคัดกรองโรค และประเมินความเสี่ยงโรคต่างๆ',
        'คำปรึกษาการดูแลสุขภาพผู้สูงอายุ โภชนาการ และการออกกำลังกายที่เหมาะสม'
      ]
    },
    {
      id: 8,
      name: 'วัคซีน',
      nameEn: 'Vaccination Center',
      icon: Zap,
      color: 'indigo',
      departmentId: 10,
      description: 'ศูนย์วัคซีน โรงพยาบาลเปาโล ไชยภูมิ 4 เป็นศูนย์บริการฉีดวัคซีนป้องกันโรคที่ครบครันที่สุด มีวัคซีนคุณภาพสูงจากบริษัทชั้นนำทั้งในและต่างประเทศ เก็บรักษาในระบบ Cold Chain ที่ได้มาตรฐาน พร้อมทีมแพทย์และพยาบาลที่มีความเชี่ยวชาญด้านวัคซีนวิทยา เรามุ่งเน้นการให้บริการฉีดวัคซีนที่ปลอดภัย ได้มาตรฐาน และมีประสิทธิภาพสูง พร้อมให้คำปรึกษาเกี่ยวกับวัคซีนและการป้องกันโรคสำหรับทุกช่วงวัย เพื่อสร้างภูมิคุ้มกันที่แข็งแรงและป้องกันโรคติดเชื้อต่างๆ',
      services: [
        'วัคซีนสำหรับเด็กตามตารางมาตรฐานกระทรวงสาธารณสุข และวัคซีนเสริมคุณภาพสูง',
        'วัคซีนสำหรับผู้ใหญ่และผู้สูงอายุ เช่น วัคซีนไข้หวัดใหญ่ ปอดบวม และงูสวัด',
        'วัคซีนป้องกันโรคติดเชื้อต่างๆ เช่น วัคซีนไวรัสตับอักเสบ HPV และวัคซีน COVID-19',
        'วัคซีนก่อนเดินทางต่างประเทศ ตามประเทศปลายทาง และคำปรึกษาการป้องกันโรค',
        'คำปรึกษาเรื่องวัคซีน ตารางการฉีดวัคซีน และติดตามผลหลังฉีดวัคซีน'
      ]
    }
  ]

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        router.push('/login')
        return
      }

      if (currentUser.role !== 'user') {
        // ถ้า role ไม่ใช่ user ให้ redirect ไปหน้าที่ถูกต้อง
        router.push(`/${currentUser.role === 'admin' ? 'admin' : 'doctor'}/dashboard`)
        return
      }

      setUser(currentUser)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Component */}
      <UserHeader />

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-12 max-w-6xl mx-auto space-y-16">
        {/* Quick Actions - Paolo Style */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">เมนูหลัก</h2>
          <div className="max-w-sm">
            <button
              onClick={() => router.push('/dashboard/book-appointment')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-9 h-9 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-xl mb-1">จองนัดหมาย</h3>
                  <p className="text-blue-100 text-sm">จองคิวพบแพทย์ล่วงหน้า</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* แพ็กเกจและโปรโมชั่น */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">แพ็กเกจและโปรโมชั่น</h2>
            <button
              onClick={() => router.push('/dashboard/packages')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              ดูทั้งหมด →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Package Card 1 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <Heart className="w-20 h-20 text-blue-600" />
              </div>
              <div className="p-5">
                <div className="mb-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">แพ็กเกจ 1</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  โปรแกรมตรวจสุขภาพ<br />ประจำปี
                </h3>
                <p className="text-gray-600 text-sm mb-3">ตรวจสุขภาพครอบคลุม เหมาะสำหรับทุกเพศทุกวัย</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">5,990 ฿</span>
                  <span className="text-sm text-gray-500 line-through">7,500 ฿</span>
                </div>
                <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  เพิ่ม
                </button>
              </div>
            </div>

            {/* Package Card 2 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="relative h-48 bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
                <User className="w-20 h-20 text-pink-600" />
              </div>
              <div className="p-5">
                <div className="mb-2">
                  <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded">แพ็กเกจ 2</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  โปรแกรมตรวจสุขภาพ<br />สำหรับผู้หญิง
                </h3>
                <p className="text-gray-600 text-sm mb-3">ตรวจสุขภาพเฉพาะทางสำหรับผู้หญิง</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">8,500 ฿</span>
                  <span className="text-sm text-gray-500 line-through">11,000 ฿</span>
                </div>
                <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  เพิ่ม
                </button>
              </div>
            </div>

            {/* Package Card 3 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="relative h-48 bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                <Zap className="w-20 h-20 text-amber-600" />
              </div>
              <div className="p-5">
                <div className="mb-2">
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">แพ็กเกจ 3</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  แพ็กเกจตรวจสุขภาพ<br />ผู้สูงอายุ
                </h3>
                <p className="text-gray-600 text-sm mb-3">ตรวจสุขภาพครอบคลุมสำหรับผู้สูงอายุ</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">12,900 ฿</span>
                  <span className="text-sm text-gray-500 line-through">15,500 ฿</span>
                </div>
                <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  เพิ่ม
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* บทความสุขภาพ */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">บทความสุขภาพ</h2>
            <button
              onClick={() => router.push('/dashboard/articles')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              ดูทั้งหมด →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Article Card 1 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="relative h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <Activity className="w-20 h-20 text-green-600" />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  7 ข้อดีของคนโสด ที่คนมีคู่ต้องอิจฉา
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  คนโสดสามารถใช้เวลากับตัวเองได้อย่างเต็มที่ สุขภาพ เพราะอาหารการกินควบคุมง่าย...
                </p>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  อ่านต่อ →
                </button>
              </div>
            </div>

            {/* Article Card 2 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="relative h-48 bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                <Stethoscope className="w-20 h-20 text-purple-600" />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  สายตาเด็กติดบ้านต่างากการเรียนออนไลน์
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  เมื่อต้องอ ยู่กับการเรียนออนไลน์ ใช้ถือเป็นหมุนหำคู่ที่จะอ…
                </p>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  อ่านต่อ →
                </button>
              </div>
            </div>

            {/* Article Card 3 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="relative h-48 bg-gradient-to-br from-cyan-50 to-cyan-100 flex items-center justify-center">
                <Baby className="w-20 h-20 text-cyan-600" />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  ตรวจ DNA Circle Premium แบบพรีเมียม
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  DNA Circle Premium การตรวจสอบความสุขภาพพรีเมียม แบบระเมียด...
                </p>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  อ่านต่อ →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ศูนย์และคลินิก */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">ศูนย์และคลินิก</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {medicalCenters.map((center, index) => {
              const IconComponent = center.icon
              return (
                <div
                  key={center.id}
                  onClick={() => setSelectedCenter(center)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer text-center"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-${center.color}-100 to-${center.color}-200 rounded-full flex items-center justify-center`}>
                    <IconComponent className={`w-8 h-8 text-${center.color}-600`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{center.name}</h3>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Unified Chatbot */}
      <UnifiedChatbot userId={user?.id} userRole="user" />

      {/* Medical Center Modal */}
      {selectedCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCenter(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header with Icon */}
            <div className="relative bg-gradient-to-br from-gray-50 to-white p-8 border-b border-gray-200">
              <button
                onClick={() => setSelectedCenter(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>

              <div className="flex items-center gap-6">
                {(() => {
                  const IconComponent = selectedCenter.icon
                  return (
                    <div className={`w-20 h-20 bg-gradient-to-br from-${selectedCenter.color}-100 to-${selectedCenter.color}-200 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className={`w-10 h-10 text-${selectedCenter.color}-600`} />
                    </div>
                  )
                })()}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">{selectedCenter.name}</h2>
                  {selectedCenter.nameEn && (
                    <p className="text-gray-600">{selectedCenter.nameEn}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">เกี่ยวกับศูนย์</h3>
                <p className="text-gray-700 leading-relaxed">{selectedCenter.description}</p>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">บริการตรวจรักษา</h3>
                <ul className="space-y-2">
                  {selectedCenter.services.map((service, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{service}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Book Appointment Button */}
              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => {
                    setSelectedCenter(null)
                    router.push('/dashboard/book-appointment')
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-blue-200 hover:shadow-xl"
                >
                  จองนัดหมายแพทย์
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
