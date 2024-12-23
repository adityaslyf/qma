import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'

// Explicitly set worker path
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

export const pdfjs = {
  getDocument
}
