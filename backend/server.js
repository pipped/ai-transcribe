const express = require('express')
const multer = require('multer')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process')

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

function runWhisper(filePath) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'transcribe.py')
    execFile('python3', [scriptPath, filePath], { timeout: 5 * 60 * 1000 }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr || err.message))
        return
      }
      try {
        const data = JSON.parse(stdout.trim())
        if (data.error) reject(new Error(data.error))
        else resolve(data.transcription)
      } catch {
        reject(new Error('Failed to parse transcription output'))
      }
    })
  })
}

// Derive summary, key points and action items from the raw transcript
function parseTranscript(transcription) {
  const sentences = transcription
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20)

  const summary = sentences.slice(0, 3).join(' ') || transcription.slice(0, 300)

  const keyPoints = sentences
    .filter((_, i) => i % Math.max(1, Math.floor(sentences.length / 4)) === 0)
    .slice(0, 4)
    .map(s => s.replace(/^[-•*]\s*/, ''))

  const actionItems = sentences
    .filter(s => /\b(need|should|must|will|action|follow|complete|review|send|schedule|update|check)\b/i.test(s))
    .slice(0, 3)

  return {
    summary: summary || 'No summary available.',
    keyPoints: keyPoints.length ? keyPoints : ['Transcription complete — review the full text above.'],
    actionItems: actionItems.length ? actionItems : ['Review the transcript and identify next steps.']
  }
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/transcribe', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file was uploaded.' })
    return
  }

  const filePath = req.file.path

  try {
    const transcription = await runWhisper(filePath)
    const { summary, keyPoints, actionItems } = parseTranscript(transcription)

    res.json({
      fileName: req.file.originalname,
      fileSize: req.file.size,
      transcription,
      summary,
      keyPoints,
      actionItems
    })
  } catch (err) {
    res.status(500).json({ error: `Transcription failed: ${err.message}` })
  } finally {
    fs.unlink(filePath, () => {})
  }
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
