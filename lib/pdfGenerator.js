import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Generate Receipt PDF
 * @param {Object} paymentData - Payment data object
 * @param {string} language - 'th' or 'en'
 */
export function generateReceipt(paymentData, language = 'th') {
  const doc = new jsPDF()

  // Add Thai font support (using default for now, can add custom font later)
  doc.setFont('helvetica')

  // Header with logo placeholder
  doc.setFontSize(24)
  doc.setTextColor(37, 99, 235) // Blue-600
  doc.text('Health Queue', 105, 20, { align: 'center' })

  doc.setFontSize(18)
  doc.setTextColor(0, 0, 0)
  doc.text(
    language === 'th' ? 'ใบเสร็จรับเงิน' : 'Payment Receipt',
    105,
    30,
    { align: 'center' }
  )

  // Divider line
  doc.setLineWidth(0.5)
  doc.setDrawColor(229, 231, 235) // Gray-200
  doc.line(20, 35, 190, 35)

  // Receipt Information
  doc.setFontSize(12)
  doc.setTextColor(75, 85, 99) // Gray-600

  const receiptDate = new Date(paymentData.created_at)
  const formattedDate = language === 'th'
    ? receiptDate.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : receiptDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

  let yPos = 45

  // Receipt number
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text(
    language === 'th' ? 'เลขที่ใบเสร็จ:' : 'Receipt No:',
    20,
    yPos
  )
  doc.setTextColor(75, 85, 99)
  doc.text(paymentData.id.substring(0, 8).toUpperCase(), 70, yPos)

  yPos += 8

  // Date
  doc.setTextColor(0, 0, 0)
  doc.text(
    language === 'th' ? 'วันที่:' : 'Date:',
    20,
    yPos
  )
  doc.setTextColor(75, 85, 99)
  doc.text(formattedDate, 70, yPos)

  yPos += 8

  // Patient name
  doc.setTextColor(0, 0, 0)
  doc.text(
    language === 'th' ? 'ชื่อผู้ป่วย:' : 'Patient Name:',
    20,
    yPos
  )
  doc.setTextColor(75, 85, 99)
  doc.text(paymentData.user_name || 'N/A', 70, yPos)

  yPos += 8

  // Payment method
  doc.setTextColor(0, 0, 0)
  doc.text(
    language === 'th' ? 'ช่องทางชำระเงิน:' : 'Payment Method:',
    20,
    yPos
  )
  doc.setTextColor(75, 85, 99)
  const paymentMethod = paymentData.payment_method === 'promptpay'
    ? 'PromptPay'
    : paymentData.payment_method === 'creditcard'
      ? (language === 'th' ? 'บัตรเครดิต' : 'Credit Card')
      : (language === 'th' ? 'โอนเงิน' : 'Bank Transfer')
  doc.text(paymentMethod, 70, yPos)

  yPos += 8

  // Status
  doc.setTextColor(0, 0, 0)
  doc.text(
    language === 'th' ? 'สถานะ:' : 'Status:',
    20,
    yPos
  )

  // Status badge
  const statusText = paymentData.status === 'completed'
    ? (language === 'th' ? 'ชำระเงินสำเร็จ' : 'Paid')
    : paymentData.status === 'pending'
      ? (language === 'th' ? 'รอชำระเงิน' : 'Pending')
      : (language === 'th' ? 'ยกเลิก' : 'Cancelled')

  const statusColor = paymentData.status === 'completed'
    ? [34, 197, 94] // Green-500
    : paymentData.status === 'pending'
      ? [234, 179, 8] // Yellow-500
      : [239, 68, 68] // Red-500

  doc.setTextColor(...statusColor)
  doc.text(statusText, 70, yPos)

  yPos += 15

  // Divider
  doc.setLineWidth(0.3)
  doc.setDrawColor(229, 231, 235)
  doc.line(20, yPos, 190, yPos)

  yPos += 10

  // Payment Details Table
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text(
    language === 'th' ? 'รายละเอียดการชำระเงิน' : 'Payment Details',
    20,
    yPos
  )

  yPos += 5

  // Table
  doc.autoTable({
    startY: yPos,
    head: [[
      language === 'th' ? 'รายการ' : 'Description',
      language === 'th' ? 'จำนวนเงิน' : 'Amount'
    ]],
    body: [
      [
        language === 'th' ? 'ค่าบริการนัดหมายแพทย์' : 'Appointment Fee',
        `฿${paymentData.amount.toFixed(2)}`
      ],
      ...(paymentData.doctor_name ? [[
        language === 'th' ? `แพทย์: ${paymentData.doctor_name}` : `Doctor: ${paymentData.doctor_name}`,
        ''
      ]] : []),
      ...(paymentData.appointment_date ? [[
        language === 'th'
          ? `วันที่นัด: ${new Date(paymentData.appointment_date).toLocaleDateString('th-TH')}`
          : `Appointment: ${new Date(paymentData.appointment_date).toLocaleDateString('en-US')}`,
        ''
      ]] : [])
    ],
    foot: [[
      language === 'th' ? 'ยอดรวมทั้งหมด' : 'Total Amount',
      `฿${paymentData.amount.toFixed(2)}`
    ]],
    headStyles: {
      fillColor: [37, 99, 235], // Blue-600
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: 'bold'
    },
    footStyles: {
      fillColor: [243, 244, 246], // Gray-100
      textColor: [0, 0, 0],
      fontSize: 12,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [75, 85, 99]
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] // Gray-50
    },
    margin: { left: 20, right: 20 }
  })

  // Footer
  const finalY = doc.lastAutoTable.finalY + 20

  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128) // Gray-500
  doc.text(
    language === 'th'
      ? 'ขอบคุณที่ใช้บริการ Health Queue'
      : 'Thank you for using Health Queue',
    105,
    finalY,
    { align: 'center' }
  )

  doc.setFontSize(9)
  doc.text(
    language === 'th'
      ? 'หากมีข้อสงสัย กรุณาติดต่อ: support@healthqueue.com'
      : 'For inquiries, please contact: support@healthqueue.com',
    105,
    finalY + 6,
    { align: 'center' }
  )

  // Divider at bottom
  doc.setLineWidth(0.3)
  doc.line(20, finalY + 12, 190, finalY + 12)

  // Save with timestamp
  const timestamp = Date.now()
  const fileName = `Receipt_${paymentData.id.substring(0, 8)}_${timestamp}.pdf`
  doc.save(fileName)
}

/**
 * Generate Appointment Summary PDF
 * @param {Object} appointmentData - Appointment data
 * @param {string} language - 'th' or 'en'
 */
export function generateAppointmentSummary(appointmentData, language = 'th') {
  const doc = new jsPDF()

  doc.setFont('helvetica')

  // Header
  doc.setFontSize(24)
  doc.setTextColor(37, 99, 235)
  doc.text('Health Queue', 105, 20, { align: 'center' })

  doc.setFontSize(18)
  doc.setTextColor(0, 0, 0)
  doc.text(
    language === 'th' ? 'สรุปการนัดหมาย' : 'Appointment Summary',
    105,
    30,
    { align: 'center' }
  )

  // Divider
  doc.setLineWidth(0.5)
  doc.setDrawColor(229, 231, 235)
  doc.line(20, 35, 190, 35)

  let yPos = 45

  // Appointment details
  const appointmentDate = new Date(`${appointmentData.appointment_date}T${appointmentData.appointment_time}`)
  const formattedDate = language === 'th'
    ? appointmentDate.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : appointmentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)

  const details = [
    { label: language === 'th' ? 'รหัสนัด:' : 'Appointment ID:', value: appointmentData.id.substring(0, 8).toUpperCase() },
    { label: language === 'th' ? 'ชื่อผู้ป่วย:' : 'Patient:', value: appointmentData.user_name || 'N/A' },
    { label: language === 'th' ? 'แพทย์:' : 'Doctor:', value: appointmentData.doctor_name || 'N/A' },
    { label: language === 'th' ? 'แผนก:' : 'Department:', value: appointmentData.specialization || 'N/A' },
    { label: language === 'th' ? 'วันที่:' : 'Date:', value: formattedDate },
    { label: language === 'th' ? 'เวลา:' : 'Time:', value: appointmentData.appointment_time },
    { label: language === 'th' ? 'สถานะ:' : 'Status:', value: appointmentData.status }
  ]

  details.forEach(detail => {
    doc.setTextColor(0, 0, 0)
    doc.text(detail.label, 20, yPos)
    doc.setTextColor(75, 85, 99)
    doc.text(detail.value, 70, yPos)
    yPos += 8
  })

  // Save
  const timestamp = Date.now()
  const fileName = `Appointment_${appointmentData.id.substring(0, 8)}_${timestamp}.pdf`
  doc.save(fileName)
}
