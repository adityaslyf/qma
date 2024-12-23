import { GlobalWorkerOptions, version } from 'pdfjs-dist'

// Set the worker source using the same version as the library
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`
