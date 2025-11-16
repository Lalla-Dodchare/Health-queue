/**
 * API Route for Medical Chatbot
 * Uses OpenAI GPT-4 for intelligent symptom checking and doctor recommendations
 * NOTE: Chat history is NOT stored - all conversations are ephemeral
 */

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request) {
  try {
    const { messages, language } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEY not configured, using fallback')
      return await fallbackResponse(messages, language)
    }

    // Get the last user message for specialty detection
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop()?.content || ''

    // Create system prompt based on language
    const systemPrompt = language === 'th'
      ? `คุณเป็นผู้ช่วยทางการแพทย์สำหรับโรงพยาบาล Health Queue
         งานของคุณคือ:
         1. รับฟังอาการของผู้ป่วย
         2. แนะนำแผนกแพทย์ที่เหมาะสม (เช่น ประสาทวิทยา, โรคหัวใจ, ผิวหนัง)
         3. ให้คำแนะนำเบื้องต้น (ไม่ใช่การวินิจฉัย)
         4. แนะนำให้พบแพทย์เสมอ

         กรุณาตอบสั้นๆ กระชับ ไม่เกิน 3-4 ประโยค
         และระบุแผนกแพทย์ที่แนะนำไว้ในส่วนท้าย`
      : `You are a medical assistant for Health Queue Hospital.
         Your tasks:
         1. Listen to patient symptoms
         2. Recommend appropriate medical specialty (e.g., Neurology, Cardiology, Dermatology)
         3. Provide basic advice (not diagnosis)
         4. Always recommend seeing a doctor

         Keep responses concise (3-4 sentences max)
         Include recommended specialty at the end`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 300,
    })

    const aiResponse = completion.choices[0].message.content

    // Extract specialty from AI response
    const specialty = await extractSpecialty(aiResponse, language)

    // Find matching doctors
    const recommendations = await findDoctorsBySpecialty(specialty, language)

    return NextResponse.json({
      message: aiResponse,
      recommendations,
    })

  } catch (error) {
    console.error('❌ Chatbot API error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    // If OpenAI fails, use fallback
    try {
      const { messages, language } = await request.json()
      return await fallbackResponse(messages, language)
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError)
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          message: 'กรุณาลองใหม่อีกครั้ง หรือติดต่อเจ้าหน้าที่'
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Extract specialty from AI response
 */
async function extractSpecialty(aiResponse, language) {
  const specialtyKeywords = {
    neurology: ['ประสาท', 'neurology', 'neurologist', 'ปวดหัว', 'ไมเกรน', 'headache'],
    cardiology: ['หัวใจ', 'cardiology', 'cardiologist', 'หอบเหนื่อย', 'เจ็บหน้าอก', 'chest pain'],
    dermatology: ['ผิวหนัง', 'dermatology', 'dermatologist', 'ผื่น', 'สิว', 'skin', 'rash'],
    gastroenterology: ['ทางเดินอาหาร', 'gastro', 'ปวดท้อง', 'stomach', 'digestive'],
    orthopedics: ['กระดูก', 'orthopedic', 'ปวดหลัง', 'ปวดข้อ', 'bone', 'joint'],
    ent: ['หู คอ จมูก', 'ent', 'otolaryngology', 'เจ็บคอ', 'หูอื้อ'],
    ophthalmology: ['ตา', 'eye', 'ophthalmology', 'สายตา'],
    pediatrics: ['เด็ก', 'pediatric', 'child'],
  }

  const responseLower = aiResponse.toLowerCase()

  for (const [specialty, keywords] of Object.entries(specialtyKeywords)) {
    for (const keyword of keywords) {
      if (responseLower.includes(keyword.toLowerCase())) {
        return specialty
      }
    }
  }

  return 'general' // Default to general practice
}

/**
 * Find doctors by specialty
 */
async function findDoctorsBySpecialty(specialty, language) {
  try {
    const specialtyMap = {
      neurology: { th: 'ประสาทวิทยา', en: 'Neurology' },
      cardiology: { th: 'โรคหัวใจ', en: 'Cardiology' },
      dermatology: { th: 'ผิวหนัง', en: 'Dermatology' },
      gastroenterology: { th: 'ระบบทางเดินอาหาร', en: 'Gastroenterology' },
      orthopedics: { th: 'กระดูกและข้อ', en: 'Orthopedics' },
      ent: { th: 'หู คอ จมูก', en: 'ENT' },
      ophthalmology: { th: 'จักษุวิทยา', en: 'Ophthalmology' },
      pediatrics: { th: 'กุมารเวชศาสตร์', en: 'Pediatrics' },
      general: { th: 'อายุรกรรม', en: 'Internal Medicine' },
    }

    const searchTerm = specialtyMap[specialty] || specialtyMap.general

    const { data: doctors, error } = await supabase
      .from('doctors')
      .select('id, full_name, name_th, name_en, specialization, specialty_th, specialty_en, available_days')
      .or(`specialization.ilike.%${searchTerm.en}%,specialty_th.ilike.%${searchTerm.th}%,specialty_en.ilike.%${searchTerm.en}%`)
      .limit(3)

    if (error) throw error

    return (doctors || []).map(doctor => ({
      id: doctor.id,
      name: language === 'th'
        ? (doctor.name_th || doctor.full_name)
        : (doctor.name_en || doctor.full_name),
      specialty: language === 'th'
        ? (doctor.specialty_th || doctor.specialization)
        : (doctor.specialty_en || doctor.specialization),
      available: !!doctor.available_days,
    }))

  } catch (error) {
    console.error('Error fetching doctors:', error)
    return []
  }
}

/**
 * Fallback response when OpenAI is not available
 */
async function fallbackResponse(messages, language) {
  const lastUserMessage = messages
    .filter(m => m.role === 'user')
    .pop()?.content || ''

  const isThai = language === 'th'

  // Simple keyword matching for specialties
  const specialtyMapping = {
    'ปวดหัว|ไมเกรน|วิงเวียน|headache|migraine': {
      specialty: 'Neurology',
      specialty_th: 'ประสาทวิทยา',
      message_th: 'จากอาการที่คุณบอกมา แนะนำให้พบแพทย์ผู้เชี่ยวชาญด้านประสาทวิทยา เพื่อตรวจหาสาเหตุของอาการปวดหัวและให้การรักษาที่เหมาะสม',
      message_en: 'Based on your symptoms, I recommend seeing a neurologist to diagnose the cause of your headaches and provide appropriate treatment.',
    },
    'ปวดท้อง|ท้องเสีย|อาเจียน|แน่นท้อง|stomach|digestive': {
      specialty: 'Gastroenterology',
      specialty_th: 'ระบบทางเดินอาหาร',
      message_th: 'อาการที่คุณมีอาจเกี่ยวข้องกับระบบทางเดินอาหาร แนะนำให้พบแพทย์ผู้เชี่ยวชาญด้านนี้เพื่อตรวจและรักษา',
      message_en: 'Your symptoms may be related to the digestive system. I recommend seeing a gastroenterologist for examination and treatment.',
    },
    'เจ็บหน้าอก|หายใจไม่สะดวก|หอบเหนื่อย|chest|heart': {
      specialty: 'Cardiology',
      specialty_th: 'โรคหัวใจ',
      message_th: 'อาการที่คุณมีควรได้รับการตรวจจากแพทย์โรคหัวใจโดยเร็ว เพื่อความปลอดภัยของคุณ',
      message_en: 'Your symptoms should be examined by a cardiologist as soon as possible for your safety.',
    },
    'ผื่น|คัน|แพ้|สิว|ผิวหนัง|skin|rash|acne': {
      specialty: 'Dermatology',
      specialty_th: 'ผิวหนัง',
      message_th: 'ปัญหาผิวหนังที่คุณมี ควรให้แพทย์ผู้เชี่ยวชาญด้านผิวหนังตรวจดูเพื่อวินิจฉัยและให้การรักษาที่เหมาะสม',
      message_en: 'Your skin condition should be examined by a dermatologist for proper diagnosis and treatment.',
    },
    'ไอ|เจ็บคอ|น้ำมูก|ไข้|หวัด|cough|fever|cold': {
      specialty: 'Internal Medicine',
      specialty_th: 'อายุรกรรม',
      message_th: 'อาการของคุณอาจเป็นการติดเชื้อระบบทางเดินหายใจ แนะนำให้พบแพทย์อายุรกรรมเพื่อรับการรักษา',
      message_en: 'Your symptoms may indicate a respiratory infection. I recommend seeing an internist for treatment.',
    },
  }

  // Find matching specialty
  let matchedInfo = null
  for (const [keywords, info] of Object.entries(specialtyMapping)) {
    const regex = new RegExp(keywords, 'i')
    if (regex.test(lastUserMessage)) {
      matchedInfo = info
      break
    }
  }

  if (!matchedInfo) {
    return NextResponse.json({
      message: isThai
        ? 'ขอบคุณที่บอกอาการค่ะ เพื่อให้คำแนะนำที่ถูกต้อง กรุณาอธิบายอาการของคุณให้ละเอียดมากขึ้น เช่น ปวดหัว ปวดท้อง หายใจลำบาก เป็นต้น'
        : 'Thank you for sharing. To provide better recommendations, please describe your symptoms in more detail, such as headache, stomach pain, breathing difficulty, etc.',
      recommendations: [],
    })
  }

  const recommendations = await findDoctorsBySpecialty(
    matchedInfo.specialty.toLowerCase(),
    language
  )

  return NextResponse.json({
    message: isThai ? matchedInfo.message_th : matchedInfo.message_en,
    recommendations,
  })
}
