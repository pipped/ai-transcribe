# AI Transcribe

AI Transcribe is a small full-stack MVP for uploading audio or video and returning a structured transcription response. The current backend uses mocked AI output so the product flow is ready before connecting a real speech-to-text provider.

## What It Does

- Uploads audio or video files to an Express backend
- Returns a transcript preview, summary, key points, and action items
- Includes drag-and-drop upload, a demo transcript path, copy actions, and text export
- Saves recent transcript previews locally for a more realistic product demo
- Shows friendly error states for missing, invalid, or oversized uploads
- Presents the flow in a polished React + Tailwind interface

## Stack

- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express, Multer, CORS

## Run Locally

Backend:

```bash
cd backend
npm install
npm start
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

App URL: `http://localhost:5173`

## API

`POST /transcribe`

- Form field: `file`
- Accepted types: audio or video
- Max file size: 50 MB

Example response:

```json
{
  "fileName": "meeting.mp3",
  "fileSize": 1234567,
  "transcription": "Mock transcription for \"meeting\"...",
  "summary": "This demo response shows how meeting would flow...",
  "keyPoints": ["..."],
  "actionItems": ["..."]
}
```

## Whisper Research

Before implementing anything, several transcription options were evaluated.

### Options considered

**Cloud API providers**

Services like AssemblyAI, Deepgram, and Rev AI offer transcription via API. You upload audio, they return text. The tradeoff is cost — all of them charge per minute of audio and require an API key. For a portfolio project with unknown traffic, a usage-based cost was a risk worth avoiding.

OpenAI's Whisper API (via api.openai.com) is the same model used locally but hosted by OpenAI. It's fast and accurate but still requires billing credentials and sends audio to an external server.

**Running Whisper locally**

OpenAI released Whisper as open-source in 2022. The model weights are public and free to use. The question was how to run it in a Node.js backend without Python.

Two JavaScript packages were found:

- `@xenova/transformers` — the original JavaScript port of Hugging Face Transformers, runs Whisper via ONNX Runtime in the browser or Node.js
- `@huggingface/transformers` — the v3 successor to `@xenova/transformers`, maintained by Hugging Face

`@xenova/transformers` was ruled out because installing it introduced critical vulnerabilities through its `onnxruntime-web` → `onnx-proto` → `protobufjs` dependency chain with no clean fix available.

`@huggingface/transformers` (v3) installed with 0 vulnerabilities and was chosen.

### Problem discovered during implementation

Running the pipeline in Node.js threw this error:

```
Unable to load audio from path/URL since AudioContext is not available in your environment.
```

`AudioContext` is a browser API — it doesn't exist in Node.js. The library expected the runtime to handle audio decoding, which works fine in a browser but fails on a server.

**The fix**: decode the audio outside the model using `ffmpeg-static`, a package that ships a bundled ffmpeg binary. ffmpeg converts any uploaded file to 16 kHz mono PCM float samples, which are then passed directly to the model as a `Float32Array`. This bypasses the `AudioContext` requirement entirely and adds support for every audio and video format ffmpeg handles.

### Model sizes and tradeoffs

Whisper comes in several sizes. All run locally with no API key.

| Model | Size | Speed | Accuracy |
|---|---|---|---|
| `whisper-tiny.en` | ~75 MB | Fastest | Lower |
| `whisper-base.en` | ~145 MB | Fast | Better |
| `whisper-small.en` | ~460 MB | Moderate | Good |
| `whisper-medium.en` | ~1.5 GB | Slow | High |

The `.en` suffix means English-only. Multi-language versions are also available without the suffix and are slightly larger.

`whisper-tiny.en` was chosen for the prototype — fast enough to verify the pipeline works, easy to swap out for a larger model later.

### What was confirmed working

The full pipeline was tested end-to-end:

1. Audio file uploaded via the React frontend
2. Saved temporarily to disk by Multer
3. Decoded to raw PCM samples by ffmpeg
4. Passed to `whisper-tiny.en` via `@huggingface/transformers`
5. Transcription returned as JSON
6. Temporary file deleted from disk

The implementation was then removed from the codebase and documented below so the repo stays lightweight. The mock backend is sufficient for demonstrating the product flow.

---

## Adding Real AI Transcription (Whisper — free, runs locally)

The backend is structured so the mock in `server.js` can be swapped for a real model with minimal changes. The following approach was prototyped and confirmed working end-to-end.

### How it works

[`@huggingface/transformers`](https://github.com/huggingface/transformers.js) runs OpenAI's Whisper model entirely on your machine via ONNX Runtime — no API key, no cloud, no cost. Audio is decoded to raw PCM samples using a bundled `ffmpeg` binary before being passed to the model, which handles the Node.js limitation of having no `AudioContext`.

### Install the dependencies

```bash
cd backend
npm install @huggingface/transformers ffmpeg-static
```

`ffmpeg-static` ships a platform-specific ffmpeg binary — nothing needs to be installed globally.

### Replace the mock in `server.js`

Add these imports at the top:

```js
const { spawn } = require('child_process')
const ffmpegPath = require('ffmpeg-static')
```

Add the audio decoder and model loader before the routes:

```js
const SAMPLE_RATE = 16000

function decodeAudio(filePath) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath, [
      '-i', filePath,
      '-ac', '1',
      '-ar', String(SAMPLE_RATE),
      '-f', 'f32le',
      '-acodec', 'pcm_f32le',
      'pipe:1'
    ])
    const chunks = []
    let stderr = ''
    ffmpeg.stdout.on('data', chunk => chunks.push(chunk))
    ffmpeg.stderr.on('data', chunk => { stderr += chunk.toString() })
    ffmpeg.on('error', reject)
    ffmpeg.on('close', code => {
      if (code !== 0) {
        reject(new Error('Could not decode audio. ' + stderr.split('\n').slice(-3).join(' ')))
        return
      }
      const buffer = Buffer.concat(chunks)
      if (buffer.length < 4) {
        reject(new Error('No audio track found in the uploaded file.'))
        return
      }
      const byteLength = buffer.length - (buffer.length % 4)
      const arrayBuffer = new ArrayBuffer(byteLength)
      new Uint8Array(arrayBuffer).set(buffer.subarray(0, byteLength))
      resolve(new Float32Array(arrayBuffer))
    })
  })
}

// Singleton — loads once on startup, reused across all requests
let transcriberPromise = null

function getTranscriber() {
  if (!transcriberPromise) {
    console.log('Loading Whisper model (first run downloads ~75 MB to local cache)...')
    transcriberPromise = import('@huggingface/transformers')
      .then(({ pipeline }) => pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en'))
      .then(t => { console.log('Whisper model ready.'); return t })
  }
  return transcriberPromise
}

getTranscriber().catch(err => console.error('Model preload error:', err.message))
```

Replace the mock `POST /transcribe` handler body with:

```js
app.post('/transcribe', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file was uploaded.' })
  }

  try {
    const transcriber = await getTranscriber()
    const audio = await decodeAudio(req.file.path)
    const output = await transcriber(audio)
    const transcription = output.text.trim()

    const sentences = transcription.match(/[^.!?]+[.!?]+/g) || [transcription]
    const summary = sentences.slice(0, 2).join(' ').trim() || transcription
    const keyPoints = sentences.slice(0, 4).map(s => s.trim()).filter(s => s.length > 5)

    res.json({
      fileName: req.file.originalname,
      fileSize: req.file.size,
      transcription,
      summary: summary || 'Transcription complete.',
      keyPoints: keyPoints.length ? keyPoints : ['Transcription complete — see the full text above.'],
      actionItems: [
        'Review the transcription above for accuracy.',
        'Edit any misrecognised words before sharing.',
        'Export the transcript using the download button.'
      ]
    })
  } catch (err) {
    console.error('Transcription error:', err.message)
    res.status(500).json({ error: 'Transcription failed: ' + err.message })
  } finally {
    if (req.file && req.file.path) fs.unlink(req.file.path, () => {})
  }
})
```

### Notes

- **First run**: the model (~75 MB) is downloaded once to `~/.cache/huggingface/` and cached for all future runs
- **Performance**: `whisper-tiny.en` runs on CPU — fast enough for short clips, slower on long recordings. Swap `Xenova/whisper-tiny.en` for `Xenova/whisper-base.en` or `Xenova/whisper-small.en` for better accuracy at the cost of speed
- **Format support**: the ffmpeg decode step handles any audio or video format that ffmpeg supports (mp3, m4a, ogg, flac, wav, mp4, mov, etc.)
- **Privacy**: audio never leaves your machine

## Portfolio Notes

- This project intentionally uses mocked transcription output
- The focus is product UX, upload flow, state handling, and full-stack structure
- Visitors can explore the app with either a real file upload or the built-in demo transcript

## Next Steps

- Replace mocked transcription with a real AI transcription provider (see above)
- Replace local transcript history with a real database
- Support timestamps, speaker labels, and exports
