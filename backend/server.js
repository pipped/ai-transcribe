const express = require('express')
const multer = require('multer')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const port = 3000
const uploadDirectory = path.join(__dirname, 'uploads')
const maxFileSize = 50 * 1024 * 1024

fs.mkdirSync(uploadDirectory, { recursive: true })

app.use(cors())
app.use(express.json())

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory)
  },
  filename: (_req, file, callback) => {
    const timestamp = Date.now()
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-')
    callback(null, `${timestamp}-${safeName}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter: (_req, file, callback) => {
    const isMediaFile = file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')
    if (!isMediaFile) {
      callback(new Error('Please upload an audio or video file.'))
      return
    }

    callback(null, true)
  }
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/transcribe', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file was uploaded.' })
    return
  }

  const extension = path.extname(req.file.originalname).replace('.', '').toUpperCase() || 'MEDIA'
  const fileName = path.parse(req.file.originalname).name.replace(/[-_]+/g, ' ')

  const result = {
    fileName: req.file.originalname,
    fileSize: req.file.size,
    transcription: `Mock transcription for "${fileName}". This ${extension} upload was processed successfully and is ready to swap over to a real AI transcription provider.`,
    summary: `This demo response shows how ${fileName} would flow through upload, transcription, summarization, and action extraction in a production-ready transcription tool.`,
    keyPoints: [
      'The API accepts audio and video uploads up to 50 MB.',
      'Responses return structured transcript, summary, key points, and action items.',
      'The current transcription output is mocked so the UI can be built before AI integration.'
    ],
    actionItems: [
      'Connect a speech-to-text provider such as Whisper or another transcription API.',
      'Persist transcript history so users can revisit previous uploads.',
      'Add speaker labels, timestamps, and export options.'
    ]
  }

  res.json(result)
})

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: 'File is too large. Upload a file smaller than 50 MB.' })
    return
  }

  res.status(400).json({ error: error.message || 'Something went wrong while processing the upload.' })
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
