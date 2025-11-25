import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const appointmentId = formData.get('appointmentId')

    if (!file || !appointmentId) {
      return NextResponse.json({ error: 'Missing file or appointmentId' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase Storage (use existing bucket)
    const fileName = `treatment_${appointmentId}_${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage
      .from('medical-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('medical-documents')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      fileUrl: publicUrl,
      fileName: fileName
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
