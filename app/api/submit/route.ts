import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { addSubmission } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    const name = formData.get('name')?.toString() || ''
    const email = formData.get('email')?.toString() || ''
    const phone = formData.get('phone')?.toString() || ''

    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public/uploads')
    try {
      await require('fs').promises.mkdir(uploadsDir, { recursive: true })
    } catch (err) {
      console.error('Error creating uploads directory:', err)
    }

    const saveFile = async (file: File) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`
      const filePath = path.join(uploadsDir, filename)
      await writeFile(filePath, buffer.toString())
      return filename
    }

    const documents = await Promise.all(
      (formData.getAll('documents') as File[]).map(saveFile)
    )
    const images = await Promise.all(
      (formData.getAll('images') as File[]).map(saveFile)
    )

    addSubmission({ name, email, phone, documents, images })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing form:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
