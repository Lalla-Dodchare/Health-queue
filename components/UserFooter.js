'use client'

/**
 * User Footer Component
 * Footer for patient/user pages only
 * Displays links, contact info, and copyright
 */

import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Heart, Activity } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function UserFooter() {
  const { language } = useTranslation()

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Health Queue</h3>
                <p className="text-xs text-gray-400">
                  {language === 'th' ? 'ระบบจองนัดหมายออนไลน์' : 'Online Appointment System'}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {language === 'th'
                ? 'จองนัดหมายแพทย์ออนไลน์ได้ง่ายๆ ผ่านระบบ Health Queue พร้อมบริการดูแลสุขภาพครบวงจร'
                : 'Book doctor appointments online easily through Health Queue with comprehensive healthcare services'}
            </p>
            {/* Social Media */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-700 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-700 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-700 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {language === 'th' ? 'ลิงก์ด่วน' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                  {language === 'th' ? 'แดชบอร์ด' : 'Dashboard'}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/book-appointment" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                  {language === 'th' ? 'จองนัดหมาย' : 'Book Appointment'}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/appointments" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                  {language === 'th' ? 'นัดหมายของฉัน' : 'My Appointments'}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/medical-history" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                  {language === 'th' ? 'ประวัติการรักษา' : 'Medical History'}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/profile" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                  {language === 'th' ? 'โปรไฟล์' : 'Profile'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {language === 'th' ? 'บริการ' : 'Services'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                {language === 'th' ? 'จองนัดหมายออนไลน์' : 'Online Booking'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                {language === 'th' ? 'ปรึกษาหมอ AI' : 'AI Doctor Consultation'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                {language === 'th' ? 'แจ้งเตือนนัดหมาย' : 'Appointment Reminders'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                {language === 'th' ? 'ชำระเงินออนไลน์' : 'Online Payment'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                {language === 'th' ? 'รีวิวและให้คะแนนหมอ' : 'Doctor Reviews & Ratings'}
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {language === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>
                  {language === 'th'
                    ? '123 ถนนสุขภาพดี เขตบางนา กรุงเทพฯ 10260'
                    : '123 Health Street, Bangkok 10260, Thailand'}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a href="tel:+6621234567" className="hover:text-blue-400 transition-colors">
                  02-123-4567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a href="mailto:support@healthqueue.com" className="hover:text-blue-400 transition-colors">
                  support@healthqueue.com
                </a>
              </li>
            </ul>

            {/* Operating Hours */}
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-xs font-semibold text-white mb-1">
                {language === 'th' ? 'เวลาทำการ' : 'Operating Hours'}
              </p>
              <p className="text-xs text-gray-400">
                {language === 'th' ? 'จันทร์ - ศุกร์: 08:00 - 20:00' : 'Mon - Fri: 08:00 - 20:00'}
              </p>
              <p className="text-xs text-gray-400">
                {language === 'th' ? 'เสาร์ - อาทิตย์: 09:00 - 18:00' : 'Sat - Sun: 09:00 - 18:00'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <p className="text-gray-400">
                © {currentYear} Health Queue.
              </p>
              <span className="text-gray-600">|</span>
              <p className="text-gray-400 flex items-center gap-1">
                {language === 'th' ? 'สร้างด้วย' : 'Made with'}
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                {language === 'th' ? 'ในประเทศไทย' : 'in Thailand'}
              </p>
            </div>

            <div className="flex gap-6 text-gray-400">
              <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                {language === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
              </Link>
              <Link href="/terms" className="hover:text-blue-400 transition-colors">
                {language === 'th' ? 'เงื่อนไขการใช้งาน' : 'Terms of Service'}
              </Link>
              <Link href="/help" className="hover:text-blue-400 transition-colors">
                {language === 'th' ? 'ช่วยเหลือ' : 'Help'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
