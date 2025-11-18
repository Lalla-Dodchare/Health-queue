import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request) {
  console.log('🔵 Health chat API called')

  try {
    const { message, language = 'th', conversationHistory = [], currentMode = 'ai' } = await request.json()
    console.log('📩 Received message:', message, 'Language:', language)
    console.log('📜 Conversation history length:', conversationHistory.length)
    console.log('🎯 Current mode:', currentMode)

    if (!message || message.trim().length === 0) {
      console.log('❌ Empty message')
      return NextResponse.json(
        { error: language === 'th' ? 'กรุณาใส่ข้อความ' : 'Please enter a message' },
        { status: 400 }
      )
    }

    // ตรวจสอบ API key
    console.log('🔑 Checking API key:', process.env.OPENAI_API_KEY ? 'EXISTS' : 'MISSING')

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.log('❌ API key not configured')
      return NextResponse.json(
        {
          error: language === 'th'
            ? 'กรุณาตั้งค่า OPENAI_API_KEY ใน .env.local'
            : 'Please set OPENAI_API_KEY in .env.local',
          instructions: language === 'th'
            ? 'ไปที่ https://platform.openai.com/api-keys เพื่อสร้าง API key และเติมเงินขั้นต่ำ $5'
            : 'Go to https://platform.openai.com/api-keys to create an API key and add minimum $5 credit'
        },
        { status: 500 }
      )
    }

    console.log('🚀 Initializing OpenAI...')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    console.log('✅ OpenAI initialized')

    const systemPrompt = language === 'th'
      ? `คุณเป็นผู้ช่วยด้านสุขภาพอัจฉริยะสำหรับแอพพลิเคชั่น Health Queue (ระบบจองนัดหมายแพทย์ออนไลน์)

${currentMode === 'admin' ? '⚠️ สถานะปัจจุบัน: ผู้ใช้กำลังอยู่ในโหมดแอดมิน (คุยกับเจ้าหน้าที่) ถ้าผู้ใช้ต้องการกลับมาคุยกับ AI ให้เรียกฟังก์ชัน switch_to_ai' : ''}

บทบาทและความสามารถของคุณ:
- ให้ข้อมูลสุขภาพทั่วไปที่เชื่อถือได้และเป็นประโยชน์
- ตอบคำถามเกี่ยวกับอาการเบื้องต้น โภชนาการ การออกกำลังกาย และการดูแลสุขภาพ
- แนะนำแผนกแพทย์ที่เหมาะสมตามอาการ (เช่น อาการท้องเสีย → อายุรกรรม, ปวดฟัน → ทันตกรรม)
- ให้คำแนะนำเบื้องต้นในการดูแลตนเองก่อนพบแพทย์
- แนะนำให้จองนัดหมายแพทย์ผ่านระบบหากอาการไม่ดีขึ้น

ข้อจำกัดสำคัญ (ห้ามทำ):
- ห้ามวินิจฉัยโรคหรือระบุว่าเป็นโรคอะไรแน่ชัด
- ห้ามสั่งจ่ายยาหรือบอกชื่อยาเฉพาะเจาะจง
- ห้ามให้คำแนะนำทางการแพทย์ที่ซับซ้อนหรืออันตราย
- ห้ามทำตัวเป็นแพทย์จริง

กรณีที่ต้องแนะนำให้รีบพบแพทย์ทันที:
- อาการรุนแรง เช่น เจ็บหน้าอกรุนแรง หายใจลำบาก เลือดออกมาก
- อาการที่อาจเป็นอันตราย เช่น ปวดศีรษะรุนแรงกะทันหัน ชาครึ่งซีก
- อาการแพ้รุนแรง เช่น บวมหน้า ลิ้นบวม หายใจไม่ออก
- อาการที่ยืดเยื้อหรือแย่ลงเรื่อยๆ

รูปแบบการตอบ:
- ตอบเป็นภาษาไทยที่เข้าใจง่าย กระชับ ชัดเจน เป็นกันเอง
- แบ่งเป็นหัวข้อชัดเจน (ถ้าคำตอบยาว)
- ใช้ bullet points เพื่อให้อ่านง่าย
- ความยาว 4-6 ประโยคสำหรับคำถามธรรมดา, มากกว่านี้ได้ถ้าคำถามซับซ้อน
- ลงท้ายด้วยคำแนะนำที่เป็นประโยชน์ เช่น:
  * "หากอาการไม่ดีขึ้นภายใน 2-3 วัน แนะนำให้จองนัดหมายแพทย์ผ่านแอพของเรานะคะ"
  * "ถ้าอาการรุนแรงขึ้น ควรรีบพบแพทย์โดยเร็วที่สุด"
  * "สำหรับการตรวจสุขภาพประจำปี สามารถจองนัดหมายได้เลยค่ะ"

ตัวอย่างการตอบที่ดี:
ผู้ใช้: "ปวดหัวบ่อยๆ ควรทำอย่างไร"
ตอบ: "อาการปวดหัวบ่อยอาจมีสาเหตุหลากหลายค่ะ

ข้อแนะนำเบื้องต้น:
• พักผ่อนให้เพียงพอ 7-8 ชั่วโมงต่อวัน
• ดื่มน้ำให้เพียงพอ อย่างน้อยวันละ 8 แก้ว
• หลีกเลี่ยงการมองหน้าจอนานเกินไป พักสายตาทุก 20 นาที
• ลดความเครียดด้วยการออกกำลังกายเบาๆ

หากปวดหัวบ่อยมาก (เกินสัปดาห์ละ 2-3 ครั้ง) หรือปวดรุนแรงกว่าปกติ แนะนำให้จองนัดหมายพบแพทย์เพื่อหาสาเหตุที่แท้จริงนะคะ"`
      : `You are an intelligent health assistant for the Health Queue application (online doctor appointment system)

${currentMode === 'admin' ? '⚠️ Current Status: User is in ADMIN mode (talking to staff). If user wants to switch back to AI, call switch_to_ai function' : ''}

Your Role and Capabilities:
- Provide reliable, general health information
- Answer questions about basic symptoms, nutrition, exercise, and health care
- Recommend appropriate medical departments based on symptoms (e.g., diarrhea → Internal Medicine, toothache → Dentistry)
- Give preliminary self-care advice before seeing a doctor
- Suggest booking appointments through the app if symptoms persist

Important Limitations (DO NOT):
- Diagnose specific diseases or conditions
- Prescribe specific medications or dosages
- Give complex or dangerous medical advice
- Pretend to be a real doctor

Cases Requiring Immediate Medical Attention:
- Severe symptoms: chest pain, breathing difficulties, heavy bleeding
- Potentially dangerous symptoms: sudden severe headache, half-body numbness
- Severe allergic reactions: facial swelling, tongue swelling, breathing problems
- Persistent or worsening symptoms

Response Format:
- Answer in clear, friendly English
- Use bullet points for easy reading
- 4-6 sentences for simple questions, longer for complex ones
- End with helpful advice like:
  * "If symptoms don't improve within 2-3 days, book an appointment through our app"
  * "If symptoms worsen, seek medical attention immediately"
  * "For regular health checkups, you can book an appointment anytime"

Example Good Response:
User: "I have frequent headaches, what should I do?"
Answer: "Frequent headaches can have various causes.

Initial recommendations:
• Get adequate sleep (7-8 hours per night)
• Drink enough water (at least 8 glasses daily)
• Avoid prolonged screen time, rest your eyes every 20 minutes
• Reduce stress through light exercise

If headaches occur frequently (more than 2-3 times per week) or are more severe than usual, I recommend booking an appointment with a doctor to identify the underlying cause."`

    console.log('🤖 Calling OpenAI API...')

    // Build messages array with conversation history
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory, // Add conversation history (last 10 messages)
      {
        role: 'user',
        content: message
      }
    ]

    console.log('📨 Total messages to send:', messages.length)

    // Define function for detecting user intent
    const tools = [
      {
        type: 'function',
        function: {
          name: 'switch_to_admin',
          description: language === 'th'
            ? 'MUST CALL เฉพาะเมื่อผู้ใช้ขอเปลี่ยนไปคุยกับคนจริงๆ อย่างชัดเจน เช่น "ขอคุยกับคน", "ต้องการเจ้าหน้าที่", "ขอคุยกับแอดมิน" - ห้ามเรียกถ้าเป็นแค่คำถามสุขภาพทั่วไป'
            : 'MUST CALL only when user explicitly requests to talk to real person, like "talk to person", "need staff", "contact admin" - Do NOT call for general health questions',
          parameters: {
            type: 'object',
            properties: {
              reason: {
                type: 'string',
                description: language === 'th'
                  ? 'เหตุผลที่ผู้ใช้ต้องการคุยกับคน'
                  : 'Reason why user wants to talk to admin'
              }
            },
            required: ['reason']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'switch_to_ai',
          description: language === 'th'
            ? 'MUST CALL เฉพาะเมื่อผู้ใช้อยู่ในโหมด admin และขอกลับมาคุยกับ AI อย่างชัดเจน เช่น "กลับไปคุย AI", "ขอปรึกษา AI" - ห้ามเรียกถ้าอยู่ในโหมด AI อยู่แล้ว'
            : 'MUST CALL only when user is in admin mode and explicitly requests to switch back to AI, like "switch to AI", "talk to AI" - Do NOT call if already in AI mode',
          parameters: {
            type: 'object',
            properties: {
              reason: {
                type: 'string',
                description: language === 'th'
                  ? 'เหตุผลที่ผู้ใช้ต้องการคุยกับ AI'
                  : 'Reason why user wants to talk to AI'
              }
            },
            required: ['reason']
          }
        }
      }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      tools: tools, // Add function calling tools
      tool_choice: 'auto', // Let AI decide when to call functions
      temperature: 0.7,
      max_tokens: 800,
      presence_penalty: 0.3,
      frequency_penalty: 0.3,
      top_p: 0.9
    })

    const responseMessage = completion.choices[0].message

    console.log('🔍 AI Response type:', responseMessage.tool_calls ? 'FUNCTION_CALL' : 'TEXT')

    // Check if AI wants to call a function (switch mode)
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall = responseMessage.tool_calls[0]
      const functionName = toolCall.function.name
      const functionArgs = JSON.parse(toolCall.function.arguments)

      console.log('📞 Function called:', functionName, 'Reason:', functionArgs.reason)

      // Return intent to switch mode
      return NextResponse.json({
        success: true,
        intent: functionName === 'switch_to_admin' ? 'switch_to_admin' : 'switch_to_ai',
        reason: functionArgs.reason,
        timestamp: new Date().toISOString()
      })
    }

    // Normal text response
    const text = responseMessage.content

    console.log('✅ Response ready:', text.substring(0, 100))

    return NextResponse.json({
      success: true,
      reply: text,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('OpenAI API Error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      status: error.status,
      response: error.response
    })

    return NextResponse.json(
      {
        error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ AI',
        details: error.message,
        hint: 'ตรวจสอบ OPENAI_API_KEY ใน .env.local และยืนยันว่าเติมเงินขั้นต่ำ $5 แล้ว'
      },
      { status: 500 }
    )
  }
}
