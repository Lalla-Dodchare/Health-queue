/**
 * Translation strings for Thai/English language support
 * Health Queue - Hospital Appointment Booking System
 */

export const translations = {
  // Header & Navigation
  header: {
    searchPlaceholder: {
      th: 'ค้นหาแพทย์ ตามชื่อ, อาการ, หรือความเชี่ยวชาญ...',
      en: 'Search doctors by name, symptoms, or specialty...',
    },
    quickBook: {
      th: 'จองนัดหมาย',
      en: 'Book Appointment',
    },
    appointments: {
      th: 'นัดหมายของฉัน',
      en: 'My Appointments',
    },
    medicalRecords: {
      th: 'ประวัติการรักษา',
      en: 'Medical Records',
    },
    notifications: {
      th: 'การแจ้งเตือน',
      en: 'Notifications',
    },
    profile: {
      th: 'โปรไฟล์',
      en: 'Profile',
    },
    settings: {
      th: 'ตั้งค่า',
      en: 'Settings',
    },
    logout: {
      th: 'ออกจากระบบ',
      en: 'Logout',
    },
  },

  // Search
  search: {
    noResults: {
      th: 'ไม่พบผลลัพธ์',
      en: 'No results found',
    },
    searching: {
      th: 'กำลังค้นหา...',
      en: 'Searching...',
    },
    viewProfile: {
      th: 'ดูโปรไฟล์',
      en: 'View Profile',
    },
    bookNow: {
      th: 'จองเลย',
      en: 'Book Now',
    },
    availableSlots: {
      th: 'เวลาว่าง',
      en: 'Available Slots',
    },
    branch: {
      th: 'สาขา',
      en: 'Branch',
    },
  },

  // Notifications
  notif: {
    markAllRead: {
      th: 'ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว',
      en: 'Mark all as read',
    },
    marking: {
      th: 'กำลังทำเครื่องหมาย...',
      en: 'Marking...',
    },
    updating: {
      th: 'กำลังอัพเดท...',
      en: 'Updating...',
    },
    markReadError: {
      th: 'ไม่สามารถทำเครื่องหมายว่าอ่านแล้วได้',
      en: 'Failed to mark as read',
    },
    markAllReadError: {
      th: 'ไม่สามารถทำเครื่องหมายทั้งหมดว่าอ่านแล้วได้',
      en: 'Failed to mark all as read',
    },
    viewAll: {
      th: 'ดูทั้งหมด',
      en: 'View All',
    },
    noNotifications: {
      th: 'ไม่มีการแจ้งเตือน',
      en: 'No notifications',
    },
    appointmentReminder: {
      th: 'แจ้งเตือนนัดหมาย',
      en: 'Appointment Reminder',
    },
    testResults: {
      th: 'ผลตรวจพร้อมแล้ว',
      en: 'Test Results Ready',
    },
    doctorMessage: {
      th: 'ข้อความจากแพทย์',
      en: 'Doctor Message',
    },
  },

  // Appointments
  appointment: {
    upcoming: {
      th: 'นัดหมายถัดไป',
      en: 'Upcoming',
    },
    past: {
      th: 'ประวัติ',
      en: 'Past',
    },
    cancelled: {
      th: 'ยกเลิก',
      en: 'Cancelled',
    },
    noUpcoming: {
      th: 'ไม่มีนัดหมายที่กำลังจะมาถึง',
      en: 'No upcoming appointments',
    },
    bookNew: {
      th: 'จองนัดหมายใหม่',
      en: 'Book New Appointment',
    },
  },

  // Chatbot
  chatbot: {
    title: {
      th: 'ผู้ช่วยแนะนำแพทย์',
      en: 'Medical Assistant',
    },
    placeholder: {
      th: 'พิมพ์อาการของคุณ...',
      en: 'Describe your symptoms...',
    },
    send: {
      th: 'ส่ง',
      en: 'Send',
    },
    welcome: {
      th: 'สวัสดีค่ะ ฉันสามารถช่วยแนะนำแพทย์ที่เหมาะสมกับอาการของคุณได้ กรุณาบอกอาการที่คุณมี',
      en: 'Hello! I can help recommend the right doctor for your symptoms. Please describe what you\'re experiencing.',
    },
    thinking: {
      th: 'กำลังคิด...',
      en: 'Thinking...',
    },
  },

  // Booking Flow
  booking: {
    redirecting: {
      th: 'กำลังนำคุณไปหน้าจองนัดหมาย...',
      en: 'Redirecting to booking page...',
    },
    step1: {
      th: 'เลือกสาขา',
      en: 'Select Branch',
    },
    step2: {
      th: 'เลือกคลินิก',
      en: 'Select Clinic',
    },
    step3: {
      th: 'เลือกแพทย์',
      en: 'Select Doctor',
    },
    step4: {
      th: 'เลือกวันเวลา',
      en: 'Select Date & Time',
    },
    selectBranch: {
      th: 'เลือกสาขาโรงพยาบาล',
      en: 'Select Hospital Branch',
    },
    selectBranchDescription: {
      th: 'กรุณาเลือกสาขาที่คุณต้องการเข้ารับบริการ',
      en: 'Please select the branch you would like to visit',
    },
    selectThisBranch: {
      th: 'เลือกสาขานี้',
      en: 'Select This Branch',
    },
    selectClinic: {
      th: 'เลือกคลินิก/แผนก',
      en: 'Select Clinic/Department',
    },
    selectClinicDescription: {
      th: 'กรุณาเลือกคลินิกหรือแผนกที่คุณต้องการพบแพทย์',
      en: 'Please select the clinic or department you need',
    },
    doctors: {
      th: 'แพทย์',
      en: 'Doctors',
    },
    selectDoctor: {
      th: 'เลือกแพทย์',
      en: 'Select Doctor',
    },
    selectDoctorDescription: {
      th: 'กรุณาเลือกแพทย์ที่คุณต้องการพบใน',
      en: 'Please select a doctor in',
    },
    selectThisDoctor: {
      th: 'เลือกแพทย์ท่านนี้',
      en: 'Select This Doctor',
    },
    education: {
      th: 'การศึกษา',
      en: 'Education',
    },
    specialization: {
      th: 'ความเชี่ยวชาญ',
      en: 'Specialization',
    },
    experience: {
      th: 'ประสบการณ์',
      en: 'Experience',
    },
    years: {
      th: 'ปี',
      en: 'Years',
    },
    availableDays: {
      th: 'วันที่ให้บริการ',
      en: 'Available Days',
    },
    selectDateTime: {
      th: 'เลือกวันและเวลา',
      en: 'Select Date and Time',
    },
    selectDateTimeDescription: {
      th: 'กรุณาเลือกวันและเวลาที่คุณต้องการนัดหมาย',
      en: 'Please select your preferred date and time',
    },
    availableTimeSlots: {
      th: 'ช่วงเวลาที่ว่าง',
      en: 'Available Time Slots',
    },
    morning: {
      th: 'เช้า',
      en: 'Morning',
    },
    afternoon: {
      th: 'บ่าย',
      en: 'Afternoon',
    },
    evening: {
      th: 'เย็น',
      en: 'Evening',
    },
    bookingSummary: {
      th: 'สรุปการจอง',
      en: 'Booking Summary',
    },
    branch: {
      th: 'สาขา',
      en: 'Branch',
    },
    clinic: {
      th: 'คลินิก',
      en: 'Clinic',
    },
    doctor: {
      th: 'แพทย์',
      en: 'Doctor',
    },
    date: {
      th: 'วันที่',
      en: 'Date',
    },
    time: {
      th: 'เวลา',
      en: 'Time',
    },
    notSelected: {
      th: 'ยังไม่ได้เลือก',
      en: 'Not selected',
    },
    confirmBooking: {
      th: 'ยืนยันการจอง',
      en: 'Confirm Booking',
    },
    confirmationMessage: {
      th: 'จองนัดหมายสำเร็จ! เราจะส่งการยืนยันไปยังอีเมลของคุณ',
      en: 'Booking confirmed! We will send a confirmation to your email',
    },
    back: {
      th: 'ย้อนกลับ',
      en: 'Back',
    },
  },

  // Appointments Page
  appointments: {
    title: {
      th: 'นัดหมายของฉัน',
      en: 'My Appointments',
    },
    description: {
      th: 'ดูและจัดการนัดหมายของคุณ',
      en: 'View and manage your appointments',
    },
    upcoming: {
      th: 'นัดหมายถัดไป',
      en: 'Upcoming',
    },
    past: {
      th: 'ประวัติ',
      en: 'Past',
    },
    cancelled: {
      th: 'ยกเลิกแล้ว',
      en: 'Cancelled',
    },
    searchPlaceholder: {
      th: 'ค้นหานัดหมาย...',
      en: 'Search appointments...',
    },
    noAppointments: {
      th: 'ไม่มีนัดหมาย',
      en: 'No appointments',
    },
    bookNew: {
      th: 'จองนัดหมายใหม่',
      en: 'Book New Appointment',
    },
    notes: {
      th: 'หมายเหตุ',
      en: 'Notes',
    },
    reschedule: {
      th: 'เลื่อนนัด',
      en: 'Reschedule',
    },
    cancel: {
      th: 'ยกเลิก',
      en: 'Cancel',
    },
    confirmCancel: {
      th: 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกนัดหมายนี้?',
      en: 'Are you sure you want to cancel this appointment?',
    },
    viewDetails: {
      th: 'ดูรายละเอียด',
      en: 'View Details',
    },
  },

  // Medical History
  medicalHistory: {
    title: {
      th: 'ประวัติการรักษา',
      en: 'Medical History',
    },
    description: {
      th: 'ดูประวัติการรักษาและผลตรวจของคุณ',
      en: 'View your treatment history and test results',
    },
    searchPlaceholder: {
      th: 'ค้นหาประวัติการรักษา...',
      en: 'Search medical history...',
    },
    allTime: {
      th: 'ทั้งหมด',
      en: 'All Time',
    },
    last3Months: {
      th: '3 เดือนที่แล้ว',
      en: 'Last 3 Months',
    },
    last6Months: {
      th: '6 เดือนที่แล้ว',
      en: 'Last 6 Months',
    },
    lastYear: {
      th: '1 ปีที่แล้ว',
      en: 'Last Year',
    },
    noRecords: {
      th: 'ไม่มีประวัติการรักษา',
      en: 'No medical records',
    },
    diagnosis: {
      th: 'การวินิจฉัย',
      en: 'Diagnosis',
    },
    symptoms: {
      th: 'อาการ',
      en: 'Symptoms',
    },
    treatment: {
      th: 'การรักษา',
      en: 'Treatment',
    },
    prescriptions: {
      th: 'ใบสั่งยา',
      en: 'Prescriptions',
    },
    dosage: {
      th: 'ขนาดยา',
      en: 'Dosage',
    },
    duration: {
      th: 'ระยะเวลา',
      en: 'Duration',
    },
    testResults: {
      th: 'ผลตรวจ',
      en: 'Test Results',
    },
    visionResults: {
      th: 'ผลตรวจสายตา',
      en: 'Vision Results',
    },
    rightEye: {
      th: 'ตาขวา',
      en: 'Right Eye',
    },
    leftEye: {
      th: 'ตาซ้าย',
      en: 'Left Eye',
    },
    notes: {
      th: 'หมายเหตุ',
      en: 'Notes',
    },
    nextAppointment: {
      th: 'นัดหมายถัดไป',
      en: 'Next Appointment',
    },
    download: {
      th: 'ดาวน์โหลด',
      en: 'Download',
    },
    downloadStarted: {
      th: 'เริ่มดาวน์โหลดเอกสาร',
      en: 'Download started',
    },
  },

  // Profile
  profile: {
    title: {
      th: 'โปรไฟล์',
      en: 'Profile',
    },
    description: {
      th: 'จัดการข้อมูลส่วนตัวและการตั้งค่าของคุณ',
      en: 'Manage your personal information and settings',
    },
    personalInfo: {
      th: 'ข้อมูลส่วนตัว',
      en: 'Personal Information',
    },
    edit: {
      th: 'แก้ไข',
      en: 'Edit',
    },
    save: {
      th: 'บันทึก',
      en: 'Save',
    },
    saving: {
      th: 'กำลังบันทึก...',
      en: 'Saving...',
    },
    saved: {
      th: 'บันทึกสำเร็จ',
      en: 'Saved successfully',
    },
    cancel: {
      th: 'ยกเลิก',
      en: 'Cancel',
    },
    fullName: {
      th: 'ชื่อ-นามสกุล',
      en: 'Full Name',
    },
    email: {
      th: 'อีเมล',
      en: 'Email',
    },
    phone: {
      th: 'เบอร์โทรศัพท์',
      en: 'Phone Number',
    },
    dateOfBirth: {
      th: 'วันเกิด',
      en: 'Date of Birth',
    },
    address: {
      th: 'ที่อยู่',
      en: 'Address',
    },
    bloodType: {
      th: 'กรุ๊ปเลือด',
      en: 'Blood Type',
    },
    selectBloodType: {
      th: 'เลือกกรุ๊ปเลือด',
      en: 'Select Blood Type',
    },
    allergies: {
      th: 'อาการแพ้',
      en: 'Allergies',
    },
    allergiesPlaceholder: {
      th: 'เช่น ยาแอสไพริน, อาหารทะเล',
      en: 'e.g. Aspirin, Seafood',
    },
    emergencyContact: {
      th: 'ผู้ติดต่อฉุกเฉิน',
      en: 'Emergency Contact',
    },
    emergencyContactName: {
      th: 'ชื่อผู้ติดต่อฉุกเฉิน',
      en: 'Emergency Contact Name',
    },
    emergencyContactPhone: {
      th: 'เบอร์โทรผู้ติดต่อฉุกเฉิน',
      en: 'Emergency Contact Phone',
    },
    changePassword: {
      th: 'เปลี่ยนรหัสผ่าน',
      en: 'Change Password',
    },
    currentPassword: {
      th: 'รหัสผ่านปัจจุบัน',
      en: 'Current Password',
    },
    newPassword: {
      th: 'รหัสผ่านใหม่',
      en: 'New Password',
    },
    confirmPassword: {
      th: 'ยืนยันรหัสผ่าน',
      en: 'Confirm Password',
    },
    updatePassword: {
      th: 'อัปเดตรหัสผ่าน',
      en: 'Update Password',
    },
    passwordMismatch: {
      th: 'รหัสผ่านไม่ตรงกัน',
      en: 'Passwords do not match',
    },
    passwordTooShort: {
      th: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
      en: 'Password must be at least 6 characters',
    },
    passwordChanged: {
      th: 'เปลี่ยนรหัสผ่านสำเร็จ',
      en: 'Password changed successfully',
    },
    notifications: {
      th: 'การแจ้งเตือน',
      en: 'Notifications',
    },
    emailNotifications: {
      th: 'แจ้งเตือนทางอีเมล',
      en: 'Email Notifications',
    },
    emailNotificationsDesc: {
      th: 'รับการแจ้งเตือนทางอีเมล',
      en: 'Receive notifications via email',
    },
    smsNotifications: {
      th: 'แจ้งเตือนทาง SMS',
      en: 'SMS Notifications',
    },
    smsNotificationsDesc: {
      th: 'รับการแจ้งเตือนทาง SMS',
      en: 'Receive notifications via SMS',
    },
    appointmentReminders: {
      th: 'แจ้งเตือนนัดหมาย',
      en: 'Appointment Reminders',
    },
    appointmentRemindersDesc: {
      th: 'แจ้งเตือนก่อนถึงเวลานัดหมาย',
      en: 'Remind before appointment time',
    },
    healthTips: {
      th: 'คำแนะนำสุขภาพ',
      en: 'Health Tips',
    },
    healthTipsDesc: {
      th: 'รับคำแนะนำและบทความด้านสุขภาพ',
      en: 'Receive health tips and articles',
    },
    savePreferences: {
      th: 'บันทึกการตั้งค่า',
      en: 'Save Preferences',
    },
    notificationsSaved: {
      th: 'บันทึกการตั้งค่าสำเร็จ',
      en: 'Preferences saved successfully',
    },
    language: {
      th: 'ภาษา',
      en: 'Language',
    },
    gender: {
      th: 'เพศ',
      en: 'Gender',
    },
    selectGender: {
      th: 'เลือกเพศ',
      en: 'Select Gender',
    },
    male: {
      th: 'ชาย',
      en: 'Male',
    },
    female: {
      th: 'หญิง',
      en: 'Female',
    },
    other: {
      th: 'อื่นๆ',
      en: 'Other',
    },
  },

  // Dashboard
  dashboard: {
    subtitle: {
      th: 'ระบบจองนัดหมายแพทย์ออนไลน์',
      en: 'Online Doctor Appointment System',
    },
    upcomingAppointments: {
      th: 'นัดหมายถัดไป',
      en: 'Upcoming Appointments',
    },
    totalVisits: {
      th: 'การเข้ารับบริการ',
      en: 'Total Visits',
    },
    loyaltyPoints: {
      th: 'คะแนนสะสม',
      en: 'Loyalty Points',
    },
    bookAppointment: {
      th: 'จองนัดหมาย',
      en: 'Book Appointment',
    },
    bookAppointmentDesc: {
      th: 'จองคิวพบแพทย์ล่วงหน้า',
      en: 'Book a doctor appointment in advance',
    },
    appointmentHistory: {
      th: 'นัดหมายของฉัน',
      en: 'My Appointments',
    },
    appointmentHistoryDesc: {
      th: 'ดูประวัตินัดหมายทั้งหมด',
      en: 'View all appointment history',
    },
    medicalHistory: {
      th: 'ประวัติการรักษา',
      en: 'Medical History',
    },
    medicalHistoryDesc: {
      th: 'ดูประวัติการรักษาของคุณ',
      en: 'View your medical records',
    },
    profile: {
      th: 'โปรไฟล์',
      en: 'Profile',
    },
    profileDesc: {
      th: 'จัดการข้อมูลส่วนตัว',
      en: 'Manage your personal information',
    },
    bookNew: {
      th: 'จองนัดหมายใหม่',
      en: 'Book New Appointment',
    },
    // Hero Carousel
    allYouCanCheck: {
      th: 'ALL YOU CAN CHECK',
      en: 'ALL YOU CAN CHECK',
    },
    customHealthProgram: {
      th: 'โปรแกรมตรวจสุขภาพที่คุณออกแบบได้',
      en: 'Customizable Health Check Program',
    },
    moreThan70Items: {
      th: 'ครอบคลุมมากกว่า 70 รายการ',
      en: 'Covers more than 70 items',
    },
    specializedEquipment: {
      th: 'เจาะลึกถึงเครื่องมือเฉพาะทาง',
      en: 'In-depth specialized equipment',
    },
    yearRoundConsultation: {
      th: 'รับคำแนะนำจากแพทย์ตลอดทั้งปี',
      en: 'Year-round medical consultation',
    },
    startingFrom: {
      th: 'เริ่มต้น',
      en: 'Starting from',
    },
    baht: {
      th: 'บาท',
      en: 'Baht',
    },
    clickHere: {
      th: 'คลิก →',
      en: 'Click →',
    },
    check: {
      th: 'ตรวจ',
      en: 'Check',
    },
    modify: {
      th: 'ปรับเปลี่ยน',
      en: 'Modify',
    },
    monitor: {
      th: 'ติดตาม',
      en: 'Monitor',
    },
    continuous: {
      th: 'ต่อเนื่อง',
      en: 'Continuous',
    },
    annualHealthCheck: {
      th: 'ตรวจสุขภาพประจำปี',
      en: 'Annual Health Check',
    },
    comprehensiveHealthCheck: {
      th: 'ครอบคลุมทุกการตรวจ เพื่อสุขภาพที่แข็งแรง',
      en: 'Comprehensive health checks for better health',
    },
    viewDetails: {
      th: 'ดูรายละเอียด',
      en: 'View Details',
    },
    easyBooking: {
      th: 'จองนัดหมาย<br />ง่ายๆ ไม่ต้องรอ',
      en: 'Easy Appointment<br />Booking, No Waiting',
    },
    chooseConvenientTime: {
      th: 'เลือกวันและเวลาที่สะดวกสำหรับคุณ',
      en: 'Choose a date and time that suits you',
    },
    bookNow: {
      th: 'จองเลย',
      en: 'Book Now',
    },
    // Packages & Promotions
    packagesAndPromotions: {
      th: 'แพ็กเกจและโปรโมชั่น',
      en: 'Packages & Promotions',
    },
    viewAll: {
      th: 'ดูทั้งหมด →',
      en: 'View All →',
    },
    package1: {
      th: 'แพ็กเกจ 1',
      en: 'Package 1',
    },
    package2: {
      th: 'แพ็กเกจ 2',
      en: 'Package 2',
    },
    package3: {
      th: 'แพ็กเกจ 3',
      en: 'Package 3',
    },
    annualHealthCheckPackage: {
      th: 'โปรแกรมตรวจสุขภาพประจำปี',
      en: 'Annual Health Check Program',
    },
    suitableForAllAges: {
      th: 'ตรวจสุขภาพครอบคลุม เหมาะสำหรับทุกเพศทุกวัย',
      en: 'Comprehensive health check suitable for all ages',
    },
    womensHealthPackage: {
      th: 'โปรแกรมตรวจสุขภาพสำหรับผู้หญิง',
      en: 'Women\'s Health Check Program',
    },
    specializedForWomen: {
      th: 'ตรวจสุขภาพเฉพาะทางสำหรับผู้หญิง',
      en: 'Specialized health check for women',
    },
    elderlyHealthPackage: {
      th: 'แพ็กเกจตรวจสุขภาพผู้สูงอายุ',
      en: 'Elderly Health Check Package',
    },
    comprehensiveForElderly: {
      th: 'ตรวจสุขภาพครอบคลุมสำหรับผู้สูงอายุ',
      en: 'Comprehensive health check for the elderly',
    },
    add: {
      th: 'เพิ่ม',
      en: 'Add',
    },
    // Health Articles
    healthArticles: {
      th: 'บทความสุขภาพ',
      en: 'Health Articles',
    },
    readMore: {
      th: 'อ่านต่อ →',
      en: 'Read More →',
    },
    // Medical Centers
    centersAndClinics: {
      th: 'ศูนย์และคลินิก',
      en: 'Centers & Clinics',
    },
    aboutCenter: {
      th: 'เกี่ยวกับศูนย์',
      en: 'About the Center',
    },
    treatmentServices: {
      th: 'บริการตรวจรักษา',
      en: 'Treatment Services',
    },
    bookDoctorAppointment: {
      th: 'จองนัดหมายแพทย์',
      en: 'Book Doctor Appointment',
    },
    selectBranch: {
      th: 'เลือกสาขา',
      en: 'Select Branch',
    },
    selectBranchToBook: {
      th: 'กรุณาเลือกสาขาที่ต้องการจองนัดหมาย',
      en: 'Please select the branch you want to book',
    },
    branchPrefix: {
      th: 'สาขา',
      en: 'Branch',
    },
    changeBranch: {
      th: 'เปลี่ยนสาขา',
      en: 'Change Branch',
    },
  },

  // Doctors Page
  doctors: {
    title: {
      th: 'แพทย์ทั้งหมด',
      en: 'All Doctors',
    },
    searchDoctor: {
      th: 'ค้นหาแพทย์',
      en: 'Search Doctor',
    },
    filterBy: {
      th: 'กรองตาม',
      en: 'Filter By',
    },
    allBranches: {
      th: 'ทุกสาขา',
      en: 'All Branches',
    },
    allDepartments: {
      th: 'ทุกแผนก',
      en: 'All Departments',
    },
    makeAppointment: {
      th: 'ทำนัด',
      en: 'Book',
    },
    details: {
      th: 'รายละเอียด',
      en: 'Details',
    },
    page: {
      th: 'หน้า',
      en: 'Page',
    },
    noDoctorsFound: {
      th: 'ไม่พบแพทย์',
      en: 'No doctors found',
    },
    showing: {
      th: 'แสดง',
      en: 'Showing',
    },
    of: {
      th: 'จาก',
      en: 'of',
    },
    results: {
      th: 'ผลลัพธ์',
      en: 'results',
    },
  },

  // Doctor Detail Page
  doctorDetail: {
    backToDoctors: {
      th: 'แพทย์ทั้งหมด',
      en: 'All Doctors',
    },
    centerAndClinic: {
      th: 'ศูนย์และคลินิก',
      en: 'Center & Clinic',
    },
    doctorNotFound: {
      th: 'ไม่พบข้อมูลแพทย์',
      en: 'Doctor Not Found',
    },
    backToDoctorsList: {
      th: 'กลับไปหน้ารายการแพทย์',
      en: 'Back to Doctors List',
    },
  },

  // Packages Page
  packages: {
    title: {
      th: 'แพ็กเกจตรวจสุขภาพ',
      en: 'Health Check Packages',
    },
    searchPackages: {
      th: 'ค้นหาแพ็กเกจ',
      en: 'Search Packages',
    },
    all: {
      th: 'ทั้งหมด',
      en: 'All',
    },
    men: {
      th: 'ผู้ชาย',
      en: 'Men',
    },
    women: {
      th: 'ผู้หญิง',
      en: 'Women',
    },
    elderly: {
      th: 'ผู้สูงอายุ',
      en: 'Elderly',
    },
    contactConsult: {
      th: 'ติดต่อปรึกษา',
      en: 'Contact & Consult',
    },
    noPackagesFound: {
      th: 'ไม่พบแพ็กเกจ',
      en: 'No packages found',
    },
    originalPrice: {
      th: 'ราคาเดิม',
      en: 'Original Price',
    },
  },

  // Branches Page
  branches: {
    title: {
      th: 'สาขาทั้งหมด',
      en: 'All Branches',
    },
    address: {
      th: 'ที่อยู่',
      en: 'Address',
    },
    phone: {
      th: 'เบอร์โทร',
      en: 'Phone',
    },
    selectThisBranch: {
      th: 'เลือกสาขานี้',
      en: 'Select This Branch',
    },
  },

  // Book Appointment New Page
  bookAppointmentNew: {
    bookingInformation: {
      th: 'ข้อมูลการจอง',
      en: 'Booking Information',
    },
    preferredDate: {
      th: 'วันที่ต้องการ',
      en: 'Preferred Date',
    },
    preferredTime: {
      th: 'เวลาที่ต้องการ',
      en: 'Preferred Time',
    },
    option1: {
      th: 'ตัวเลือกที่ 1',
      en: 'Option 1',
    },
    option2: {
      th: 'ตัวเลือกที่ 2',
      en: 'Option 2',
    },
    symptoms: {
      th: 'อาการ',
      en: 'Symptoms',
    },
    additionalNotes: {
      th: 'หมายเหตุเพิ่มเติม',
      en: 'Additional Notes',
    },
    pleaseFillAllFields: {
      th: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      en: 'Please fill in all fields',
    },
    step1: {
      th: 'เลือกสาขา',
      en: 'Select Branch',
    },
    step2: {
      th: 'เลือกแผนก',
      en: 'Select Department',
    },
    step3: {
      th: 'เลือกแพทย์',
      en: 'Select Doctor',
    },
    step4: {
      th: 'เลือกวันและเวลา',
      en: 'Select Date & Time',
    },
  },

  // Footer
  footer: {
    aboutUs: {
      th: 'ระบบจองนัดหมายแพทย์ออนไลน์ เพื่อความสะดวกและรวดเร็วในการรับบริการทางการแพทย์',
      en: 'Online doctor appointment booking system for convenient and fast medical services',
    },
    quickLinks: {
      th: 'ลิงก์ด่วน',
      en: 'Quick Links',
    },
    bookAppointment: {
      th: 'จองนัดหมาย',
      en: 'Book Appointment',
    },
    myAppointments: {
      th: 'นัดหมายของฉัน',
      en: 'My Appointments',
    },
    profile: {
      th: 'โปรไฟล์',
      en: 'Profile',
    },
    faq: {
      th: 'คำถามที่พบบ่อย',
      en: 'FAQ',
    },
    contactUs: {
      th: 'ติดต่อเรา',
      en: 'Contact Us',
    },
    onlineBookingSystem: {
      th: 'ระบบจองนัดหมายออนไลน์',
      en: 'Online Booking System',
    },
    hospitalServiceNationwide: {
      th: 'บริการรพ. ทั่วประเทศ',
      en: 'Hospital Service Nationwide',
    },
    openingHours: {
      th: 'เวลาให้บริการ',
      en: 'Opening Hours',
    },
    mondayToFriday: {
      th: 'จันทร์ - ศุกร์',
      en: 'Monday - Friday',
    },
    saturdayToSunday: {
      th: 'เสาร์ - อาทิตย์',
      en: 'Saturday - Sunday',
    },
    available24Hours: {
      th: '* บริการจองนัดตลอด 24 ชั่วโมง',
      en: '* 24/7 Booking Service Available',
    },
    allRightsReserved: {
      th: 'ระบบจองนัดหมายแพทย์ออนไลน์. All rights reserved.',
      en: 'Online Doctor Appointment System. All rights reserved.',
    },
  },

  // UserHeader
  userHeader: {
    bookAppointment: {
      th: 'จองนัดหมาย',
      en: 'Book Appointment',
    },
    searchDoctor: {
      th: 'ค้นหาแพทย์',
      en: 'Search Doctor',
    },
    selectBranch: {
      th: 'เลือกสาขา',
      en: 'Select Branch',
    },
    profile: {
      th: 'โปรไฟล์',
      en: 'Profile',
    },
    logout: {
      th: 'ออกจากระบบ',
      en: 'Logout',
    },
    switchToEnglish: {
      th: 'Switch to English',
      en: 'Switch to English',
    },
    switchToThai: {
      th: 'เปลี่ยนเป็นภาษาไทย',
      en: 'เปลี่ยนเป็นภาษาไทย',
    },
    selectBranchTitle: {
      th: 'เลือกสาขา',
      en: 'Select Branch',
    },
    selectBranchDescription: {
      th: 'เลือกสาขาที่คุณต้องการรับบริการ',
      en: 'Select the branch you want to receive service',
    },
    noBranchesFound: {
      th: 'ไม่พบข้อมูลสาขา',
      en: 'No branches found',
    },
    phone: {
      th: 'โทร',
      en: 'Tel',
    },
  },

  // Common
  common: {
    welcome: {
      th: 'ยินดีต้อนรับ',
      en: 'Welcome',
    },
    quickActions: {
      th: 'เมนูหลัก',
      en: 'Quick Actions',
    },
    loading: {
      th: 'กำลังโหลด...',
      en: 'Loading...',
    },
    error: {
      th: 'เกิดข้อผิดพลาด',
      en: 'An error occurred',
    },
    retry: {
      th: 'ลองใหม่',
      en: 'Retry',
    },
    cancel: {
      th: 'ยกเลิก',
      en: 'Cancel',
    },
    confirm: {
      th: 'ยืนยัน',
      en: 'Confirm',
    },
    close: {
      th: 'ปิด',
      en: 'Close',
    },
    healthScore: {
      th: 'คะแนนสุขภาพ',
      en: 'Health Score',
    },
    justNow: {
      th: 'เมื่อสักครู่',
      en: 'just now',
    },
    minutesAgo: {
      th: 'นาทีที่แล้ว',
      en: 'minutes ago',
    },
    hoursAgo: {
      th: 'ชั่วโมงที่แล้ว',
      en: 'hours ago',
    },
    daysAgo: {
      th: 'วันที่แล้ว',
      en: 'days ago',
    },
  },

  // Language helper
  language: {
    th: 'th',
    en: 'en',
  },
}
