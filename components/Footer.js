'use client'

/**
 * Footer Component
 * Hospital-style footer with contact info, quick links, and copyright
 */

import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Health Queue</h3>
            <p className="text-sm text-gray-400 mb-4">
              ระบบจองนัดหมายแพทย์ออนไลน์ เพื่อความสะดวกและรวดเร็วในการรับบริการทางการแพทย์
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">ลิงก์ด่วน</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/book-appointment" className="text-gray-400 hover:text-white transition-colors">
                  จองนัดหมาย
                </Link>
              </li>
              <li>
                <Link href="/dashboard/appointments" className="text-gray-400 hover:text-white transition-colors">
                  นัดหมายของฉัน
                </Link>
              </li>
              <li>
                <Link href="/dashboard/profile" className="text-gray-400 hover:text-white transition-colors">
                  โปรไฟล์
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  คำถามที่พบบ่อย
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">ติดต่อเรา</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  ระบบจองนัดหมายออนไลน์<br />
                  บริการรพ. ทั่วประเทศ
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:021234567" className="text-gray-400 hover:text-white transition-colors">
                  02-123-4567
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:support@healthqueue.com" className="text-gray-400 hover:text-white transition-colors">
                  support@healthqueue.com
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">เวลาให้บริการ</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-1 flex-shrink-0" />
                <div className="text-gray-400">
                  <p className="font-medium text-white">จันทร์ - ศุกร์</p>
                  <p>08:00 - 18:00 น.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-1 flex-shrink-0" />
                <div className="text-gray-400">
                  <p className="font-medium text-white">เสาร์ - อาทิตย์</p>
                  <p>09:00 - 17:00 น.</p>
                </div>
              </li>
              <li className="text-blue-400 text-xs mt-2">
                * บริการจองนัดตลอด 24 ชั่วโมง
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Health Queue - ระบบจองนัดหมายแพทย์ออนไลน์. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
