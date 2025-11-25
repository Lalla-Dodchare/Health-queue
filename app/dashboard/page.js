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
import { Calendar, Heart, User, Zap, Baby, Stethoscope, Activity, Eye, Smile, X, Bone, Camera, Brain, Wind, Droplet, Syringe, Pill, FileText, Ear, Sparkles, Microscope, ChevronLeft, ChevronRight } from 'lucide-react'

export default function UserDashboard() {
  const router = useRouter()
  const { t } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [selectedBranch, setSelectedBranch] = useState(null)

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000) // เปลี่ยนสไลด์ทุก 5 วินาที

    return () => clearInterval(interval)
  }, [])

  // Carousel controls
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3)
  }

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3)
  }

  // Medical centers data with full information (no need to fetch from DB)
  const medicalCenters = [
    // สาขา จุฬา + พหลโยธิน (7 แผนก)
    {
      id: 1,
      name: 'อายุรกรรม',
      nameEn: 'Internal Medicine',
      icon: User,
      color: 'purple',
      departmentId: 10,
      hasBranches: true,
      branches: ['จุฬา', 'พหลโยธิน'],
      description: 'ศูนย์อายุรกรรมให้บริการตรวจวินิจฉัยและรักษาโรคทั่วไปและโรคเฉพาะทางในผู้ใหญ่อย่างครบวงจร ด้วยทีมอายุรแพทย์ผู้เชี่ยวชาญที่มีประสบการณ์และความชำนาญในหลากหลายสาขา พร้อมเครื่องมือตรวจวินิจฉัยที่ทันสมัยและห้องปฏิบัติการที่ได้มาตรฐาน เรามุ่งเน้นการดูแลผู้ป่วยแบบองค์รวม ทั้งการรักษาโรคเฉียบพลัน การดูแลโรคเรื้อรัง และการป้องกันโรค เพื่อให้ผู้ป่วยมีสุขภาพที่ดีและสามารถใช้ชีวิตได้อย่างมีคุณภาพ',
      services: [
        'ตรวจรักษาโรคทั่วไป โรคไข้หวัดใหญ่ โรคติดเชื้อต่างๆ และโรคเฉียบพลัน',
        'รักษาและดูแลโรคเรื้อรัง เช่น โรคเบาหวาน ความดันโลหิตสูง ไขมันในเลือดสูง',
        'รักษาโรคติดเชื้อ โรคไข้เลือดออก และโรคติดเชื้อทางเดินหายใจ',
        'ตรวจสุขภาพประจำปี ตรวจคัดกรองโรค และประเมินความเสี่ยงโรคต่างๆ',
        'คำปรึกษาการดูแลสุขภาพผู้สูงอายุ โภชนาการ และการออกกำลังกายที่เหมาะสม'
      ]
    },
    {
      id: 2,
      name: 'กุมารเวช',
      nameEn: 'Pediatrics',
      icon: Baby,
      color: 'blue',
      departmentId: 15,
      hasBranches: true,
      branches: ['จุฬา', 'พหลโยธิน'],
      description: 'ศูนย์กุมารเวชให้บริการดูแลสุขภาพเด็กอย่างครบวงจร ตั้งแต่แรกเกิดจนถึงวัยรุ่น ด้วยทีมกุมารแพทย์ที่มีความเชี่ยวชาญเฉพาะทางและพยาบาลที่มีประสบการณ์ในการดูแลเด็ก เรามีห้องตรวจที่ออกแบบมาเป็นพิเศษให้เด็กรู้สึกสบายใจและไม่กลัว พร้อมอุปกรณ์ทางการแพทย์ที่เหมาะสำหรับเด็กโดยเฉพาะ เรามุ่งเน้นการป้องกันโรค การส่งเสริมพัฒนาการ และการรักษาโรคในเด็ก',
      services: [
        'ตรวจสุขภาพเด็กทั่วไป ตรวจคัดกรองโรคแทรกซ้อนในทารกแรกเกิด และตรวจสุขภาพก่อนเข้าเรียน',
        'ฉีดวัคซีนป้องกันโรคตามตารางมาตรฐาน และวัคซีนเสริมสำหรับเด็กทุกช่วงวัย',
        'ติดตามและประเมินพัฒนาการเด็ก ตรวจคัดกรองความล่าช้าทางพัฒนาการ',
        'รักษาโรคเด็กทั่วไป โรคติดเชื้อ โรคภูมิแพ้ และโรคเฉพาะทางในเด็ก',
        'คำปรึกษาการเลี้ยงดูบุตร โภชนาการสำหรับเด็ก และปัญหาพฤติกรรมเด็ก'
      ]
    },
    {
      id: 3,
      name: 'สุขภาพสตรี',
      nameEn: 'Women\'s Health Center',
      icon: Heart,
      color: 'pink',
      departmentId: 1,
      hasBranches: true,
      branches: ['จุฬา', 'พหลโยธิน'],
      description: 'ศูนย์สุขภาพสตรีให้บริการตรวจรักษาโรคเฉพาะทางสตรีอย่างครบวงจร ด้วยแพทย์ผู้เชี่ยวชาญที่มีประสบการณ์และเครื่องมือทางการแพทย์ที่ทันสมัย พร้อมดูแลสุขภาพผู้หญิงทุกช่วงวัย ตั้งแต่วัยรุ่น วัยทำงาน ไปจนถึงวัยทอง ด้วยความเอาใจใส่และความเป็นส่วนตัว เรามุ่งเน้นการป้องกันและรักษาโรคด้วยเทคโนโลยีล้ำสมัย',
      services: [
        'ตรวจสุขภาพสตรีทั่วไป และตรวจคัดกรองโรคต่างๆ',
        'ฝากครรภ์และดูแลหลังคลอด พร้อมคำปรึกษาการเลี้ยงลูกด้วยนมแม่',
        'ตรวจคัดกรองมะเร็งเต้านมและมะเร็งปากมดลูก ด้วยเครื่องมือทันสมัย',
        'รักษาโรคประจำเดือน ภาวะฮอร์โมนผิดปกติ และโรคเกี่ยวกับระบบสืบพันธุ์',
        'การวางแผนครอบครัว คำปรึกษาการคุมกำเนิด และดูแลสุขภาพก่อนตั้งครรภ์'
      ]
    },
    {
      id: 4,
      name: 'หู คอ จมูก',
      nameEn: 'ENT (Ear, Nose & Throat)',
      icon: Ear,
      color: 'orange',
      departmentId: 16,
      hasBranches: true,
      branches: ['จุฬา', 'พหลโยธิน'],
      description: 'ศูนย์หู คอ จมูก ให้บริการตรวจวินิจฉัยและรักษาโรคหู คอ จมูก และระบบหายใจส่วนต้นอย่างครบวงจร ด้วยทีมแพทย์ผู้เชี่ยวชาญที่มีประสบการณ์ พร้อมเครื่องมือตรวจและรักษาที่ทันสมัย เช่น กล้องส่องจมูก กล้องส่องหู และเครื่องตรวจการได้ยิน เรามุ่งเน้นการรักษาที่มีประสิทธิภาพและปลอดภัย',
      services: [
        'ตรวจและรักษาโรคหูอักเสบ หูน้ำหนวก ฟังไม่ชัด และโรคเกี่ยวกับการได้ยิน',
        'รักษาโรคจมูกอักเสบ ไซนัสอักเสบ โพลีปจมูก และโรคภูมิแพ้จมูก',
        'รักษาโรคคออักเสบ ต่อมทอนซิลอักเสบ และต่อมลูกระโห่งโต',
        'ตรวจและรักษาอาการนอนกรน ภาวะหยุดหายใจขณะหลับ',
        'ผ่าตัดและรักษาโรคเกี่ยวกับหู คอ จมูก ด้วยเทคนิคที่ทันสมัย'
      ]
    },
    {
      id: 5,
      name: 'ผิวหนัง',
      nameEn: 'Dermatology',
      icon: Sparkles,
      color: 'teal',
      departmentId: 5,
      hasBranches: true,
      branches: ['จุฬา', 'พหลโยธิน'],
      description: 'ศูนย์ผิวหนังให้บริการตรวจวินิจฉัยและรักษาโรคผิวหนังทุกชนิด ด้วยแพทย์ผิวหนังผู้เชี่ยวชาญและเครื่องมือทางการแพทย์ที่ทันสมัย รวมถึงเทคโนโลยีเลเซอร์และการรักษาเพื่อความงาม เรามุ่งเน้นการดูแลผิวพรรณให้สุขภาพดี รักษาโรคผิวหนังอย่างมีประสิทธิภาพ และให้คำปรึกษาการดูแลผิวที่เหมาะสมกับแต่ละบุคคล',
      services: [
        'ตรวจและรักษาโรคผิวหนังทุกชนิด เช่น สิว ผื่นภูมิแพ้ โรคผิวหนังติดเชื้อ',
        'รักษาโรคเชื้อราผิวหนัง โรคกลาก และโรคผิวหนังเรื้อรัง',
        'ตรวจคัดกรองและรักษาโรคมะเร็งผิวหนัง ไฝที่ผิดปกติ',
        'การรักษาเพื่อความงาม เช่น รักษารอยแผลเป็น รอยดำ ฝ้า กระ',
        'เลเซอร์รักษาโรคผิวหนัง ลดริ้วรอย และฉีดโบท็อกซ์ ฟิลเลอร์'
      ]
    },
    {
      id: 6,
      name: 'วัคซีน',
      nameEn: 'Vaccination Center',
      icon: Syringe,
      color: 'indigo',
      departmentId: 17,
      hasBranches: true,
      branches: ['จุฬา', 'พหลโยธิน'],
      description: 'ศูนย์วัคซีนเป็นศูนย์บริการฉีดวัคซีนป้องกันโรคที่ครบครันที่สุด มีวัคซีนคุณภาพสูงจากบริษัทชั้นนำทั้งในและต่างประเทศ เก็บรักษาในระบบ Cold Chain ที่ได้มาตรฐาน พร้อมทีมแพทย์และพยาบาลที่มีความเชี่ยวชาญด้านวัคซีนวิทยา เรามุ่งเน้นการให้บริการฉีดวัคซีนที่ปลอดภัย ได้มาตรฐาน และมีประสิทธิภาพสูง',
      services: [
        'วัคซีนสำหรับเด็กตามตารางมาตรฐานกระทรวงสาธารณสุข และวัคซีนเสริมคุณภาพสูง',
        'วัคซีนสำหรับผู้ใหญ่และผู้สูงอายุ เช่น วัคซีนไข้หวัดใหญ่ ปอดบวม และงูสวัด',
        'วัคซีนป้องกันโรคติดเชื้อต่างๆ เช่น วัคซีนไวรัสตับอักเสบ HPV และวัคซีน COVID-19',
        'วัคซีนก่อนเดินทางต่างประเทศ ตามประเทศปลายทาง และคำปรึกษาการป้องกันโรค',
        'คำปรึกษาเรื่องวัคซีน ตารางการฉีดวัคซีน และติดตามผลหลังฉีดวัคซีน'
      ]
    },
    {
      id: 7,
      name: 'ส่งเสริมสุขภาพและอาชีวเวชศาสตร์',
      nameEn: 'Occupational Health',
      icon: Activity,
      color: 'lime',
      departmentId: 18,
      hasBranches: true,
      branches: ['จุฬา', 'พหลโยธิน'],
      description: 'ศูนย์ส่งเสริมสุขภาพและอาชีวเวชศาสตร์ให้บริการตรวจสุขภาพเชิงป้องกัน การส่งเสริมสุขภาพ และการดูแลสุขภาพในสถานประกอบการ ด้วยทีมแพทย์และบุคลากรทางการแพทย์ที่มีความเชี่ยวชาญ เรามุ่งเน้นการตรวจสุขภาพประจำปี การประเมินความเสี่ยงโรค และการให้คำปรึกษาด้านสุขภาพเพื่อป้องกันโรค',
      services: [
        'ตรวจสุขภาพประจำปีสำหรับบุคคลทั่วไปและพนักงานองค์กร',
        'ตรวจสุขภาพเพื่อขอใบอนุญาต ใบรับรอง และตรวจสุขภาพตามกฎหมาย',
        'ตรวจคัดกรองโรคเบาหวาน ความดันโลหิตสูง ไขมันในเลือดสูง และโรคเรื้อรัง',
        'ประเมินความเสี่ยงด้านสุขภาพและให้คำปรึกษาการดูแลสุขภาพเชิงป้องกัน',
        'บริการตรวจสุขภาพสำหรับผู้สูงอายุ และโปรแกรมส่งเสริมสุขภาพเฉพาะบุคคล'
      ]
    },

    // สาขา จุฬา เท่านั้น (14 แผนก)
    {
      id: 8,
      name: 'กระดูกและข้อ',
      nameEn: 'Orthopedics',
      icon: Bone,
      color: 'slate',
      departmentId: 7,
      hasBranches: false,
      description: 'ศูนย์กระดูกและข้อให้บริการตรวจวินิจฉัยและรักษาโรคกระดูก ข้อ กล้ามเนื้อ และเอ็น อย่างครบวงจร ด้วยทีมแพทย์ออร์โธปิดิกส์ผู้เชี่ยวชาญ พร้อมเครื่องมือทันสมัย เช่น เครื่อง X-ray ดิจิตอล เครื่อง MRI และห้องผ่าตัดมาตรฐานสากล เรามุ่งเน้นการรักษาที่มีประสิทธิภาพและการฟื้นฟูสมรรถภาพหลังการรักษา',
      services: [
        'ตรวจและรักษาโรคข้อเสื่อม ข้ออักเสบ ปวดหลัง ปวดคอ และโรคกระดูกพรุน',
        'รักษาการบาดเจ็บจากอุบัติเหตุ กระดูกหัก เอ็นฉีก และข้อเคลื่อน',
        'ผ่าตัดเปลี่ยนข้อเข่า ข้อสะโพก และผ่าตัดกระดูกสันหลัง',
        'ตรวจและรักษาโรคกระดูกในเด็ก การเจริญเติบโตของกระดูกที่ผิดปกติ',
        'ฟื้นฟูสมรรถภาพทางกระดูกและข้อ กายภาพบำบัด และโปรแกรมออกกำลังกาย'
      ]
    },
    {
      id: 9,
      name: 'คลินิกส่องกล้อง',
      nameEn: 'Endoscopy Center',
      icon: Camera,
      color: 'sky',
      departmentId: 21,
      hasBranches: false,
      description: 'คลินิกส่องกล้องให้บริการตรวจส่องกล้องทางเดินอาหาร ทั้งส่วนบนและส่วนล่าง ด้วยแพทย์ผู้เชี่ยวชาญและกล้องส่องที่ทันสมัย มีความคมชัดสูง เรามุ่งเน้นการตรวจหาโรคในระยะเริ่มต้น การวินิจฉัยที่แม่นยำ และการรักษาด้วยกล้องส่องที่ปลอดภัย มีมาตรฐาน พร้อมดูแลความสะดวกสบายของผู้ป่วยอย่างดีที่สุด',
      services: [
        'ตรวจส่องกล้องกระเพาะอาหารและหลอดอาหาร (Gastroscopy) เพื่อวินิจฉัยและรักษา',
        'ตรวจส่องกล้องลำไส้ใหญ่ (Colonoscopy) เพื่อตรวจคัดกรองมะเร็งลำไส้',
        'ตรวจส่องกล้องและตัดติ่งเนื้อ เก็บชิ้นเนื้อเพื่อส่งตรวจทางพยาธิวิทยา',
        'รักษาเส้นเลือดขอดในหลอดอาหาร แผลในกระเพาะ ด้วยวิธีส่องกล้อง',
        'ให้คำปรึกษาการเตรียมตัวก่อนส่องกล้องและการดูแลหลังการตรวจ'
      ]
    },
    {
      id: 10,
      name: 'จิตเวช',
      nameEn: 'Psychiatry',
      icon: Brain,
      color: 'violet',
      departmentId: 20,
      hasBranches: false,
      description: 'ศูนย์จิตเวชให้บริการตรวจวินิจฉัยและรักษาโรคทางจิตเวชและปัญหาสุขภาพจิต ด้วยทีมจิตแพทย์และนักจิตวิทยาคลินิกผู้เชี่ยวชาญ ในบรรยากาศที่เป็นส่วนตัวและปลอดภัย เรามุ่งเน้นการรักษาแบบองค์รวม ทั้งด้านการให้ยา การพูดคุยบำบัด และการปรับเปลี่ยนพฤติกรรม เพื่อให้ผู้ป่วยมีสุขภาพจิตที่ดีและสามารถใช้ชีวิตได้อย่างมีความสุข',
      services: [
        'ตรวจและรักษาโรคซึมเศร้า โรควิตกกังวล และโรคเครียด',
        'รักษาโรคจิตเภท โรคสองขั้ว และโรคทางจิตเวชเรื้อรัง',
        'ให้คำปรึกษาปัญหาทางจิตใจ ความสัมพันธ์ และการปรับตัว',
        'รักษาภาวะนอนไม่หลับ การติดสุรา สารเสพติด และพฤติกรรมเสพติด',
        'จิตบำบัดและให้คำปรึกษาเชิงจิตวิทยา พัฒนาศักยภาพและคุณภาพชีวิต'
      ]
    },
    {
      id: 11,
      name: 'ตา',
      nameEn: 'Ophthalmology',
      icon: Eye,
      color: 'cyan',
      departmentId: 11,
      hasBranches: false,
      description: 'ศูนย์ตาเป็นศูนย์รักษาโรคตาที่ครบครันที่สุด มีจักษุแพทย์ผู้เชี่ยวชาญที่ได้รับการอบรมเฉพาะทางด้านต่างๆ พร้อมเครื่องมือและอุปกรณ์ทางการแพทย์ที่ทันสมัยที่สุด เช่น เครื่องตรวจจอประสาทตาด้วยคอมพิวเตอร์ เครื่อง OCT และห้องผ่าตัดที่ได้มาตรฐานสากล เรามุ่งมั่นที่จะดูแลสุขภาพดวงตาของคุณให้มีสายตาที่ดี',
      services: [
        'ตรวจวัดสายตา ตรวจหักเหแสง และจ่ายแว่นสายตาที่เหมาะสม',
        'รักษาโรคต้อหิน ต้อกระจก และโรคจอประสาทตาเสื่อม',
        'ผ่าตัดต้อกระจก ต้อหิน กล้ามเนื้อตา และผ่าตัดเลเซอร์แก้ไขสายตา',
        'ตรวจจอประสาทตาด้วย OCT สำหรับผู้ป่วยเบาหวานและความดันโลหิตสูง',
        'รักษาโรคตาในเด็ก โรคตาแดง ตาแห้ง และโรคตาต่างๆ ในผู้ใหญ่และผู้สูงอายุ'
      ]
    },
    {
      id: 12,
      name: 'ทันตกรรม',
      nameEn: 'Dentistry',
      icon: Smile,
      color: 'green',
      departmentId: 19,
      hasBranches: false,
      description: 'ศูนย์ทันตกรรมให้บริการดูแลสุขภาพช่องปากและฟันอย่างครบวงจร ด้วยทันตแพทย์ผู้เชี่ยวชาญที่มีประสบการณ์และทักษะสูง พร้อมด้วยเทคโนโลยีทางทันตกรรมที่ทันสมัย เช่น เครื่อง X-ray แบบดิจิตอล กล้องภายในปาก และเครื่องมือผ่าตัดที่ได้มาตรฐานสากล เรามุ่งเน้นการดูแลรักษาที่ไม่เจ็บปวด สะอาด ปลอดภัย',
      services: [
        'ตรวจสุขภาพช่องปากและฟัน ขูดหินปูน และทำความสะอาดฟันเป็นระยะ',
        'อุดฟันด้วยวัสดุคุณภาพสูง ถอนฟัน รักษารากฟัน และผ่าตัดช่องปากเล็กน้อย',
        'ทำฟันปลอมแบบต่างๆ รากฟันเทียมระบบดิจิตอล และบริดจ์ฟันที่สวยงาม',
        'จัดฟันด้วยเทคโนโลยีทันสมัย ทั้งจัดฟันแบบใส และแบบธรรมดา',
        'ฟอกสีฟันแบบมืออาชีพ ติดเพชรที่ฟัน และทำ Veneer เพื่อรอยยิ้มที่สวยงาม'
      ]
    },
    {
      id: 13,
      name: 'เบาหวานและต่อมไร้ท่อ',
      nameEn: 'Endocrinology & Diabetes',
      icon: Pill,
      color: 'rose',
      departmentId: 3,
      hasBranches: false,
      description: 'ศูนย์เบาหวานและต่อมไร้ท่อให้บริการตรวจวินิจฉัยและรักษาโรคเบาหวาน โรคต่อมไร้ท่อ และความผิดปกติของฮอร์โมนอย่างครบวงจร ด้วยทีมแพทย์ผู้เชี่ยวชาญด้านต่อมไร้ท่อและเบาหวาน พร้อมนักโภชนาการและพยาบาลผู้ชำนาญการ เรามุ่งเน้นการควบคุมระดับน้ำตาลในเลือด การป้องกันภาวะแทรกซ้อน และการดูแลแบบองค์รวม',
      services: [
        'ตรวจและรักษาโรคเบาหวานทุกประเภท ควบคุมระดับน้ำตาลในเลือด',
        'รักษาโรคต่อมไทรอยด์ โรคต่อมหมวกไต และโรคต่อมไร้ท่ออื่นๆ',
        'รักษาภาวะฮอร์โมนผิดปกติ โรคอ้วน และภาวะเมตาบอลิซึมผิดปกติ',
        'ตรวจคัดกรองภาวะแทรกซ้อนจากโรคเบาหวาน เช่น โรคไต โรคตา และโรคหลอดเลือด',
        'ให้คำปรึกษาโภชนาการ การออกกำลังกาย และการดูแลตัวเองสำหรับผู้ป่วยเบาหวาน'
      ]
    },
    {
      id: 14,
      name: 'ระบบทางเดินอาหารและตับ',
      nameEn: 'Gastroenterology',
      icon: Stethoscope,
      color: 'amber',
      departmentId: 2,
      hasBranches: false,
      description: 'ศูนย์ระบบทางเดินอาหารและตับเป็นศูนย์เฉพาะทางที่ให้บริการตรวจวินิจฉัยและรักษาโรคระบบทางเดินอาหาร กระเพาะอาหาร ลำไส้ ตับ ท่อน้ำดี และตับอ่อน ด้วยทีมแพทย์ผู้เชี่ยวชาญที่ผ่านการอบรมเฉพาะทาง พร้อมเครื่องมือส่องกล้องและตรวจวินิจฉัยที่ทันสมัย',
      services: [
        'ตรวจส่องกล้องระบบทางเดินอาหาร ทั้งส่องกล้องกระเพาะอาหาร และส่องกล้องลำไส้ใหญ่',
        'รักษาโรคกระเพาะอาหารอักเสบ โรคแผลในกระเพาะอาหาร และโรคลำไส้แปรปรวน',
        'รักษาโรคตับ ตับอักเสบ ตับแข็ง โรคท่อน้ำดี และโรคตับอ่อนอักเสบ',
        'ตรวจคัดกรองมะเร็งลำไส้ใหญ่ มะเร็งกระเพาะอาหาร และมะเร็งตับ',
        'คำปรึกษาโภชนาการสำหรับผู้ป่วยโรคระบบทางเดินอาหาร และโปรแกรมดูแลสุขภาพ'
      ]
    },
    {
      id: 15,
      name: 'รังสีวินิจฉัย X-Ray',
      nameEn: 'Radiology & Imaging',
      icon: FileText,
      color: 'gray',
      departmentId: 8,
      hasBranches: false,
      description: 'ศูนย์รังสีวินิจฉัยให้บริการตรวจทางรังสีวิทยาและการถ่ายภาพทางการแพทย์ครบวงจร ด้วยเครื่องมือทันสมัย เช่น เครื่อง X-ray ดิจิตอล เครื่องอัลตราซาวด์ เครื่อง CT Scan และเครื่อง MRI พร้อมทีมรังสีแพทย์และนักรังสีเทคนิคผู้เชี่ยวชาญ เรามุ่งเน้นการให้บริการที่รวดเร็ว แม่นยำ และปลอดภัย',
      services: [
        'ถ่ายภาพรังสีทั่วไป (X-ray) สำหรับกระดูก ปอด หัวใจ และอวัยวะต่างๆ',
        'ตรวจอัลตราซาวด์ (Ultrasound) อวัยวะภายใน ครรภ์ และหลอดเลือด',
        'ตรวจด้วยคอมพิวเตอร์ (CT Scan) เพื่อวินิจฉัยโรคระบบต่างๆ อย่างละเอียด',
        'ตรวจด้วยคลื่นแม่เหล็กไฟฟ้า (MRI) สำหรับสมอง ไขสันหลัง และข้อ',
        'ตรวจแมมโมแกรม (Mammogram) เพื่อคัดกรองมะเร็งเต้านม'
      ]
    },
    {
      id: 16,
      name: 'โรคระบบทางเดินปัสสาวะ',
      nameEn: 'Urology',
      icon: Droplet,
      color: 'blue',
      departmentId: 4,
      hasBranches: false,
      description: 'ศูนย์โรคระบบทางเดินปัสสาวะให้บริการตรวจวินิจฉัยและรักษาโรคไต กระเพาะปัสสาวะ ท่อปัสสาวะ และระบบสืบพันธุ์ในเพศชาย ด้วยทีมแพทย์ผู้เชี่ยวชาญด้านศัลยกรรมระบบทางเดินปัสสาวะ พร้อมเครื่องมือตรวจวินิจฉัยและรักษาที่ทันสมัย เรามุ่งเน้นการรักษาที่มีประสิทธิภาพและการดูแลที่เป็นส่วนตัว',
      services: [
        'ตรวจและรักษาโรคนิ่วในไต นิ่วในกระเพาะปัสสาวะ ด้วยการสลายนิ่วและผ่าตัด',
        'รักษาโรคกระเพาะปัสสาวะอักเสบ การปัสสาวะเร่งรีบ และปัสสาวะเล็ด',
        'รักษาโรคต่อมลูกหมากโต มะเร็งต่อมลูกหมาก และโรคต่อมลูกหมากอักเสบ',
        'รักษาโรคไตอักเสบ ไตวาย และโรคเกี่ยวกับระบบไต',
        'ผ่าตัดและรักษาโรคระบบทางเดินปัสสาวะด้วยกล้องส่องและเทคนิคที่ทันสมัย'
      ]
    },
    {
      id: 17,
      name: 'โรคระบบทางเดินหายใจ',
      nameEn: 'Pulmonology',
      icon: Wind,
      color: 'emerald',
      departmentId: 6,
      hasBranches: false,
      description: 'ศูนย์โรคระบบทางเดินหายใจให้บริการตรวจวินิจฉัยและรักษาโรคปอด หลอดลม และระบบทางเดินหายใจ ด้วยทีมแพทย์โรคปอดและระบบทางเดินหายใจผู้เชี่ยวชาญ พร้อมเครื่องมือตรวจและรักษาที่ทันสมัย เช่น เครื่องตรวจสมรรถภาพปอด กล้องส่องหลอดลม และเครื่องช่วยหายใจ',
      services: [
        'ตรวจและรักษาโรคหอบหืด โรคปอดอุดกั้นเรื้อรัง (COPD) และโรคภูมิแพ้ทางเดินหายใจ',
        'รักษาโรคปอดบวม วัณโรค และโรคติดเชื้อทางเดินหายใจ',
        'ตรวจคัดกรองและรักษามะเร็งปอด เนื้องอกในปอด',
        'รักษาภาวะหยุดหายใจขณะหลับ นอนกรน และความผิดปกติการหายใจขณะนอน',
        'ตรวจสมรรถภาพปอด ส่องกล้องหลอดลม และให้ออกซิเจนบำบัด'
      ]
    },
    {
      id: 18,
      name: 'โรคระบบประสาทและสมอง',
      nameEn: 'Neurology',
      icon: Brain,
      color: 'fuchsia',
      departmentId: 13,
      hasBranches: false,
      description: 'ศูนย์โรคระบบประสาทและสมองให้บริการตรวจวินิจฉัยและรักษาโรคทางระบบประสาท สมอง ไขสันหลัง และเส้นประสาท ด้วยทีมประสาทแพทย์ผู้เชี่ยวชาญและเครื่องมือตรวจทางระบบประสาทที่ทันสมัย เช่น เครื่อง EEG เครื่อง EMG และเครื่อง MRI สมอง เรามุ่งเน้นการวินิจฉัยที่แม่นยำและการรักษาที่มีประสิทธิภาพ',
      services: [
        'ตรวจและรักษาโรคหลอดเลือดสมอง โรคอัมพาต และโรคหลอดเลือดสมองตีบ',
        'รักษาโรคลมชัก โรคพาร์กินสัน โรคอัลไซเมอร์ และโรคสมองเสื่อม',
        'รักษาโรคไมเกรน ปวดศีรษะเรื้อรัง และอาการปวดศีรษะชนิดต่างๆ',
        'รักษาโรคเส้นประสาท เช่น โรคเส้นประสาทอักเสบ มือชา เท้าชา',
        'ตรวจคลื่นไฟฟ้าสมอง (EEG) และตรวจการนำไฟฟ้าของเส้นประสาทและกล้ามเนื้อ (EMG/NCV)'
      ]
    },
    {
      id: 19,
      name: 'เวชศาสตร์ฟื้นฟูและกายภาพบำบัด',
      nameEn: 'Rehabilitation Medicine',
      icon: Activity,
      color: 'orange',
      departmentId: 14,
      hasBranches: false,
      description: 'ศูนย์เวชศาสตร์ฟื้นฟูและกายภาพบำบัดให้บริการฟื้นฟูสมรรถภาพทางร่างกายและการเคลื่อนไหว สำหรับผู้ป่วยที่มีความบกพร่องทางร่างกายจากโรคหรืออุบัติเหตุ ด้วยทีมแพทย์เวชศาสตร์ฟื้นฟู นักกายภาพบำบัด และนักกิจกรรมบำบัด พร้อมอุปกรณ์ฟื้นฟูสมรรถภาพที่ทันสมัย',
      services: [
        'กายภาพบำบัดสำหรับผู้ป่วยหลังผ่าตัด ผู้ป่วยอัมพาต และผู้ป่วยโรคระบบประสาท',
        'ฟื้นฟูสมรรถภาพผู้ป่วยบาดเจ็บกระดูกและข้อ เอ็นฉีก และกล้ามเนื้ออักเสบ',
        'รักษาอาการปวดเรื้อรัง ปวดหลัง ปวดคอ ปวดไหล่ ด้วยกายภาพบำบัด',
        'ฟื้นฟูสมรรถภาพผู้สูงอายุ เพิ่มความแข็งแรงและการทรงตัว',
        'กิจกรรมบำบัด การบำบัดด้วยการพูด และการฟื้นฟูสมรรถภาพแบบองค์รวม'
      ]
    },
    {
      id: 20,
      name: 'ศัลยกรรม',
      nameEn: 'Surgery',
      icon: Zap,
      color: 'red',
      departmentId: 9,
      hasBranches: false,
      description: 'ศูนย์ศัลยกรรมให้บริการผ่าตัดและรักษาโรคทางศัลยกรรมทุกชนิด ด้วยทีมศัลยแพทย์ผู้เชี่ยวชาญที่มีประสบการณ์สูง พร้อมห้องผ่าตัดที่ทันสมัยและได้มาตรฐานสากล เครื่องมือผ่าตัดแบบ Minimally Invasive และระบบดูแลหลังผ่าตัดที่มีคุณภาพ เรามุ่งเน้นความปลอดภัยและการฟื้นตัวที่รวดเร็ว',
      services: [
        'ผ่าตัดทางเดินอาหาร ไส้ติ่งอักเสบ ไส้เลื่อน และโรคทางเดินอาหารต่างๆ',
        'ผ่าตัดต่อมไทรอยด์ ต่อมเต้านม และต่อมน้ำเหลืองบวม',
        'ผ่าตัดนิ่วในถุงน้ำดี ผ่าตัดตับ และผ่าตัดตับอ่อน',
        'ผ่าตัดรักษาเนื้องอก มะเร็ง และผ่าตัดผิวหนังเล็กน้อย',
        'ผ่าตัดแบบส่องกล้อง (Laparoscopy) ที่มีแผลเล็ก ฟื้นตัวเร็ว'
      ]
    },
    {
      id: 21,
      name: 'หัวใจ',
      nameEn: 'Cardiology',
      icon: Heart,
      color: 'red',
      departmentId: 12,
      hasBranches: false,
      description: 'ศูนย์หัวใจเป็นศูนย์ความเป็นเลิศด้านการดูแลโรคหัวใจและหลอดเลือด มีทีมแพทย์โรคหัวใจผู้เชี่ยวชาญที่ได้รับการรับรองจากสมาคมโรคหัวใจแห่งประเทศไทย พร้อมด้วยเครื่องมือตรวจวินิจฉัยและรักษาที่ทันสมัยที่สุด เรามุ่งมั่นในการให้บริการตรวจหาความเสี่ยง การป้องกัน การรักษา และการฟื้นฟูสภาพหัวใจ',
      services: [
        'ตรวจคลื่นไฟฟ้าหัวใจ (EKG/ECG) และตรวจคลื่นไฟฟ้าหัวใจขณะออกกำลังกาย (Exercise Stress Test)',
        'ตรวจอัลตราซาวด์หัวใจ (Echocardiography) เพื่อประเมินการทำงานของหัวใจ',
        'ตรวจความดันเลือด 24 ชั่วโมง (Holter Monitor) และตรวจการเต้นของหัวใจตลอด 24 ชั่วโมง',
        'รักษาโรคหัวใจและหลอดเลือด โรคความดันโลหิตสูง และโรคหัวใจเต้นผิดจังหวะ',
        'คำปรึกษาการดูแลสุขภาพหัวใจ โภชนาการ และโปรแกรมฟื้นฟูสภาพหัวใจ'
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
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-12">
        {/* Hero Carousel */}
        <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
          {/* Slides */}
          <div className="relative w-full h-full">
            {[1, 2, 3].map((slide, index) => (
              <div
                key={slide}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  currentSlide === index ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Slide 1 - All You Can Check */}
                {index === 0 && (
                  <div className="relative w-full h-full bg-gradient-to-r from-gray-100 to-gray-200">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full md:w-1/2 px-8 md:px-16 z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
                          {t('dashboard.allYouCanCheck')}
                        </h2>
                        <p className="text-lg md:text-xl text-gray-700 mb-2">
                          {t('dashboard.customHealthProgram')}
                        </p>
                        <ul className="space-y-2 mb-6">
                          <li className="flex items-center gap-2 text-gray-700">
                            <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                            <span>{t('dashboard.moreThan70Items')}</span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-700">
                            <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                            <span>{t('dashboard.specializedEquipment')}</span>
                          </li>
                          <li className="flex items-center gap-2 text-gray-700">
                            <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                            <span>{t('dashboard.yearRoundConsultation')}</span>
                          </li>
                        </ul>
                        <div className="mb-6">
                          <span className="text-sm text-gray-600">{t('dashboard.startingFrom')} </span>
                          <span className="text-4xl md:text-5xl font-bold text-gray-900">19,500</span>
                          <span className="text-xl text-gray-600"> {t('dashboard.baht')}</span>
                        </div>
                        <button className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-full transition-colors shadow-lg">
                          {t('dashboard.clickHere')}
                        </button>
                      </div>
                      <div className="hidden md:block absolute right-0 top-0 w-1/2 h-full">
                        <div className="relative w-full h-full flex items-center justify-end pr-16">
                          <div className="text-right">
                            <h3 className="text-5xl font-bold text-gray-800 leading-tight mb-4">
                              {t('dashboard.check')}<br />{t('dashboard.modify')}<br />{t('dashboard.monitor')}<br />{t('dashboard.continuous')}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Slide 2 - Health Check Package */}
                {index === 1 && (
                  <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-blue-700">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center px-8 z-10">
                        <Heart className="w-24 h-24 text-white mx-auto mb-6" />
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                          {t('dashboard.annualHealthCheck')}
                        </h2>
                        <p className="text-xl md:text-2xl text-blue-100 mb-8">
                          {t('dashboard.comprehensiveHealthCheck')}
                        </p>
                        <button className="px-10 py-4 bg-white text-blue-600 font-bold text-lg rounded-full hover:bg-blue-50 transition-colors shadow-xl">
                          {t('dashboard.viewDetails')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Slide 3 - Book Now */}
                {index === 2 && (
                  <div className="relative w-full h-full bg-gradient-to-br from-green-500 to-green-700">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center px-8 z-10">
                        <Calendar className="w-24 h-24 text-white mx-auto mb-6" />
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4" dangerouslySetInnerHTML={{ __html: t('dashboard.easyBooking') }} />
                        <p className="text-xl md:text-2xl text-green-100 mb-8">
                          {t('dashboard.chooseConvenientTime')}
                        </p>
                        <button
                          onClick={() => router.push('/dashboard/book-appointment')}
                          className="px-10 py-4 bg-white text-green-600 font-bold text-lg rounded-full hover:bg-green-50 transition-colors shadow-xl"
                        >
                          {t('dashboard.bookNow')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={previousSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>

        {/* แพ็กเกจและโปรโมชั่น */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.packagesAndPromotions')}</h2>
            <button
              onClick={() => router.push('/dashboard/packages')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              {t('dashboard.viewAll')}
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
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">{t('dashboard.package1')}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {t('dashboard.annualHealthCheckPackage')}
                </h3>
                <p className="text-gray-600 text-sm mb-3">{t('dashboard.suitableForAllAges')}</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">5,990 ฿</span>
                  <span className="text-sm text-gray-500 line-through">7,500 ฿</span>
                </div>
                <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  {t('dashboard.add')}
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
                  <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded">{t('dashboard.package2')}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {t('dashboard.womensHealthPackage')}
                </h3>
                <p className="text-gray-600 text-sm mb-3">{t('dashboard.specializedForWomen')}</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">8,500 ฿</span>
                  <span className="text-sm text-gray-500 line-through">11,000 ฿</span>
                </div>
                <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  {t('dashboard.add')}
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
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">{t('dashboard.package3')}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {t('dashboard.elderlyHealthPackage')}
                </h3>
                <p className="text-gray-600 text-sm mb-3">{t('dashboard.comprehensiveForElderly')}</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">12,900 ฿</span>
                  <span className="text-sm text-gray-500 line-through">15,500 ฿</span>
                </div>
                <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  {t('dashboard.add')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* บทความสุขภาพ */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.healthArticles')}</h2>
            <button
              onClick={() => router.push('/dashboard/articles')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              {t('dashboard.viewAll')}
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
                  {t('dashboard.readMore')}
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
                  {t('dashboard.readMore')}
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
                  {t('dashboard.readMore')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ศูนย์และคลินิก */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.centersAndClinics')}</h2>
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
      {selectedCenter && !selectedCenter.hasBranches && (
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.aboutCenter')}</h3>
                <p className="text-gray-700 leading-relaxed">{selectedCenter.description}</p>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.treatmentServices')}</h3>
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
                  {t('dashboard.bookDoctorAppointment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branch Selection Modal for departments with multiple branches */}
      {selectedCenter && selectedCenter.hasBranches && !selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCenter(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('dashboard.selectBranch')}</h2>
              <p className="text-gray-600 mb-6">{t('dashboard.selectBranchToBook')}</p>

              <div className="space-y-3">
                {selectedCenter.branches.map((branch, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedBranch(branch)}
                    className="w-full p-4 border-2 border-gray-200 hover:border-blue-500 rounded-xl transition-all hover:shadow-md text-left"
                  >
                    <div className="font-semibold text-gray-900 text-lg">{t('dashboard.branchPrefix')}{branch}</div>
                    <div className="text-gray-500 text-sm mt-1">{selectedCenter.name}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedCenter(null)}
                className="w-full mt-4 py-3 text-gray-600 hover:text-gray-800 font-medium"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Detail Modal (after branch selection) */}
      {selectedCenter && selectedCenter.hasBranches && selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => { setSelectedCenter(null); setSelectedBranch(null); }}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header with Icon */}
            <div className="relative bg-gradient-to-br from-gray-50 to-white p-8 border-b border-gray-200">
              <button
                onClick={() => { setSelectedCenter(null); setSelectedBranch(null); }}
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
                  <p className="text-blue-600 font-medium">สาขา{selectedBranch}</p>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.aboutCenter')}</h3>
                <p className="text-gray-700 leading-relaxed">{selectedCenter.description}</p>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.treatmentServices')}</h3>
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
                  onClick={() => { setSelectedBranch(null); }}
                  className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl transition-colors"
                >
                  {t('dashboard.changeBranch')}
                </button>
                <button
                  onClick={() => {
                    setSelectedCenter(null)
                    setSelectedBranch(null)
                    router.push('/dashboard/book-appointment')
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-blue-200 hover:shadow-xl"
                >
                  {t('dashboard.bookDoctorAppointment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
