import { NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import { writeFile } from 'fs/promises'
import { join } from 'path'

const db = new Database('form-submissions.db')

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    documents TEXT,
    images TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    // Process text fields
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string

    // Process files
    const documentFiles = formData.getAll('documents') as File[]
    const imageFiles = formData.getAll('images') as File[]

    // Save files and get their paths
    const uploadsDir = join(process.cwd(), 'public/uploads')
    const documentPaths = await Promise.all(
      documentFiles.map(async (file, i) => {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const path = join(uploadsDir, `doc_${Date.now()}_${i}_${file.name}`)
        await writeFile(path, buffer.toString())
        return `/uploads/${path.split('/uploads/')[1]}`
      })
    )

    const imagePaths = await Promise.all(
      imageFiles.map(async (file, i) => {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const path = join(uploadsDir, `img_${Date.now()}_${i}_${file.name}`)
        await writeFile(path, buffer.toString())
        return `/uploads/${path.split('/uploads/')[1]}`
      })
    )

    // Save to database
    const stmt = db.prepare(`
      INSERT INTO submissions (name, email, phone, documents, images)
      VALUES (?, ?, ?, ?, ?)
    `)

    stmt.run(
      name,
      email,
      phone,
      documentPaths.join(','),
      imagePaths.join(',')
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing form:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process form' },
      { status: 500 }
    )
  }
}
