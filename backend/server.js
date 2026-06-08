'use strict'

// Load environment variables from .env before anything else.
// Copy .env.example to .env and fill in values before running.
require('dotenv').config()

const express = require('express')
const multer = require('multer')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process')
const rateLimit = require('express-rate-limit')

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const PORT = Number(process.env.PORT) || 3000
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const UPLOAD_DIR = path.join(__dirname, 'uploads')

// Whitelist of allowed extensions — matched against the uploaded filename.
// MIME types alone are attacker-controlled; we enforce both.
const ALLOWED_EXTENSIONS = new Set([
  '.mp3', '.wav', '.mp4', '.m4a', '.ogg',
  '.flac', '.webm', '.mov', '.aac', '.wma', '.opus'
])

// ---------------------------------------------------------------------------
// API key handling
// ---------------------------------------------------------------------------
// This app currently uses no external API keys — Whisper runs locally.
// When you need to add one (e.g. a cloud transcription service), follow this pattern:
//
//   1. Add it to .env:       MY_API_KEY=sk-...
//   2. Read it here:         const MY_API_KEY = process.env.MY_API_KEY
//   3. Validate at startup:  if (!MY_API_KEY) { console.error('...'); process.exit(1) }
//   4. Never log it or include it in error messages or HTTP responses.
//   5. .env is already in .gitignore — never commit it.
//   6. Pass keys via environment, not function arguments, so they never appear in call stacks.
//
// Example:
//   const MY_API_KEY = process.env.MY_API_KEY
//   if (!MY_API_KEY) {
//     console.error('MY_API_KEY is required. Copy .env.example to .env and set it.')
//     process.exit(1)
//   }

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
// All limiters are keyed by IP. standardHeaders sends the standard RateLimit-*
// response headers (RFC 6585) so clients can back off gracefully.

// Applied to every route — coarse protection against enumeration/floods.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
})

// Tighter budget for /transcribe — each request spawns a subprocess and can
// pin a CPU core for 30+ seconds, so we limit blast radius per IP.
const transcribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Transcription rate limit reached. Please wait before uploading again.' }
})

// ---------------------------------------------------------------------------
// Magic-byte validation
// ---------------------------------------------------------------------------
// Checks the first 12 bytes of the saved file against known audio/video signatures.
// This catches MIME-type spoofing: an attacker can set file.mimetype to "audio/mpeg"
// regardless of actual content, so we verify the file itself.
const MAGIC_SIGNATURES = [
  { bytes: [0xFF, 0xFB], label: 'mp3' },
  { bytes: [0xFF, 0xF3], label: 'mp3' },
  { bytes: [0xFF, 0xF2], label: 'mp3' },
  { bytes: [0x49, 0x44, 0x33], label: 'mp3 (ID3)' },
  { bytes: [0x52, 0x49, 0x46, 0x46], label: 'wav/riff' },
  { bytes: [0x66, 0x4C, 0x61, 0x43], label: 'flac' },
  { bytes: [0x4F, 0x67, 0x67, 0x53], label: 'ogg' },
  { bytes: [0x1A, 0x45, 0xDF, 0xA3], label: 'webm/mkv' },
]
// MP4 / MOV / M4A have a variable-length size field before "ftyp" at offset 4.
const MP4_FTYP = Buffer.from('ftyp')

function hasValidMagicBytes(filePath) {
  const fd = fs.openSync(filePath, 'r')
  const buf = Buffer.alloc(12)
  fs.readSync(fd, buf, 0, 12, 0)
  fs.closeSync(fd)

  for (const sig of MAGIC_SIGNATURES) {
    if (sig.bytes.every((b, i) => buf[i] === b)) return true
  }
  // MP4/MOV/M4A: bytes 4–7 == "ftyp"
  if (buf.slice(4, 8).equals(MP4_FTYP)) return true

  return false
}

// ---------------------------------------------------------------------------
// Multer — storage and upload filtering
// ---------------------------------------------------------------------------
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const timestamp = Date.now()
    // Strip everything except alphanumerics, dots, hyphens, and underscores.
    // Collapse consecutive dots to prevent path-traversal (e.g. "../../etc/passwd").
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/\.{2,}/g, '-')
    cb(null, `${timestamp}-${safeName}`)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,   // reject requests with multiple files
    fields: 0   // reject unexpected non-file fields
  },
  fileFilter: (_req, file, cb) => {
    // Check MIME type prefix
    const isMediaMime = file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')
    if (!isMediaMime) {
      cb(new Error('Please upload an audio or video file.'))
      return
    }

    // Check extension against whitelist
    const ext = path.extname(file.originalname).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error(`Unsupported file type "${ext}". Allowed: ${[...ALLOWED_EXTENSIONS].join(', ')}`))
      return
    }

    cb(null, true)
  }
})

// ---------------------------------------------------------------------------
// Whisper integration
// ---------------------------------------------------------------------------
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

// Derive summary, key points, and action items from the raw transcript
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

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const app = express()

// Uncomment the next line if the server runs behind a reverse proxy (nginx, Heroku, etc.).
// Without it, req.ip reflects the proxy's IP and rate limiting won't work correctly.
// With it incorrectly set on a non-proxied server, clients can spoof their IP.
// app.set('trust proxy', 1)

app.use(globalLimiter)
app.use(cors())
app.use(express.json({ limit: '16kb' })) // Tight cap — this API only accepts multipart

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/transcribe', transcribeLimiter, upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file was uploaded.' })
    return
  }

  const filePath = req.file.path

  // Magic-byte check runs after the file is on disk so we can read its actual bytes.
  if (!hasValidMagicBytes(filePath)) {
    fs.unlink(filePath, () => {})
    res.status(400).json({ error: 'File content does not match a supported audio or video format.' })
    return
  }

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
    // Intentionally vague to avoid leaking internal paths or system details
    res.status(500).json({ error: `Transcription failed: ${err.message}` })
  } finally {
    fs.unlink(filePath, () => {})
  }
})

// ---------------------------------------------------------------------------
// Error handler
// ---------------------------------------------------------------------------
app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: 'File is too large. Maximum size is 50 MB.' })
      return
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({ error: 'Only one file can be uploaded at a time.' })
      return
    }
    if (error.code === 'LIMIT_FIELD_COUNT') {
      res.status(400).json({ error: 'Unexpected fields in request.' })
      return
    }
  }
  res.status(400).json({ error: error.message || 'Something went wrong while processing the upload.' })
})

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
