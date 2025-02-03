import { pdfjs } from './pdf-config'
import mammoth from 'mammoth'
import { MistralService } from './mistral-service'
import { Profile } from '@/types/profile'

export async function parseResume(file: File): Promise<Partial<Profile>> {
  try {
    // Extract text from file
    const text = await extractText(file)
    
    // Parse with Mistral AI
    const parsedData = await MistralService.parseResume(text)
    return parsedData
  } catch (error) {
    console.error('Resume parsing error:', error)
    throw error
  }
}

async function extractText(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return await extractPdfText(file)
  } else if (file.type.includes('word')) {
    return await extractDocxText(file)
  }
  throw new Error('Unsupported file type')
}

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument(arrayBuffer).promise
  let text = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item: any) => item.str).join(' ')
  }

  return text
}

async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}
