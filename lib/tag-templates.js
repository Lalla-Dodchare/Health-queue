/**
 * Predefined tag templates for admin chat
 * These are the standard tags that admins can choose from
 */

export const TAG_TEMPLATES = {
  // สถานะการนัด (Appointment Status)
  status: [
    { name: 'รอดำเนินการ', color: '#10b981', emoji: '🟢' },
    { name: 'รอการชำระเงิน', color: '#f59e0b', emoji: '🟡' },
    { name: 'รอยืนยันเอกสาร', color: '#3b82f6', emoji: '🔵' },
    { name: 'ยืนยันนัดแล้ว', color: '#8b5cf6', emoji: '🟣' },
    { name: 'เสร็จสิ้น', color: '#6b7280', emoji: '⚪' },
    { name: 'ยกเลิก', color: '#ef4444', emoji: '🔴' },
  ],

  // ความต้องการพิเศษ (Special Needs)
  special_need: [
    { name: 'ต้องการหมอหญิง', color: '#ec4899', emoji: '🏥' },
    { name: 'แพ้ยา', color: '#dc2626', emoji: '💊' },
    { name: 'ต่างชาติ', color: '#0ea5e9', emoji: '🌍' },
    { name: 'ต้องการรถเข็น', color: '#8b5cf6', emoji: '♿' },
    { name: 'มาพร้อมเด็ก', color: '#f97316', emoji: '👶' },
    { name: 'ผู้สูงอายุ', color: '#059669', emoji: '👴' },
  ],

  // ประเภทลูกค้า (Customer Type)
  customer_type: [
    { name: 'VIP', color: '#fbbf24', emoji: '⭐' },
    { name: 'ลูกค้าใหม่', color: '#10b981', emoji: '🆕' },
    { name: 'ลูกค้าประจำ', color: '#3b82f6', emoji: '🔄' },
    { name: 'ติดต่อบ่อย', color: '#8b5cf6', emoji: '📞' },
    { name: 'ต้องติดตาม', color: '#f59e0b', emoji: '⚠️' },
  ],
}

/**
 * Get all tags flattened
 */
export function getAllTagTemplates() {
  const allTags = []
  Object.entries(TAG_TEMPLATES).forEach(([category, tags]) => {
    tags.forEach((tag) => {
      allTags.push({
        ...tag,
        category,
      })
    })
  })
  return allTags
}

/**
 * Get tags by category
 */
export function getTagsByCategory(category) {
  return TAG_TEMPLATES[category] || []
}

/**
 * Find tag template by name
 */
export function findTagTemplate(name) {
  const allTags = getAllTagTemplates()
  return allTags.find((tag) => tag.name === name)
}
