# AI Transcribe

A full-stack portfolio app that transcribes audio and video files locally using OpenAI Whisper — no API key, no cloud, no cost. Upload a file or record with your mic and get back a full transcript, summary, key points, and action items.

## What It Does

- Drag-and-drop or mic-record audio/video → structured transcript in seconds
- Animated landing page with WebGL shader background
- App view with upload zone, voice input, transcript, summary, key concepts, and action items
- Recent transcript history saved to localStorage
- Copy, export as `.txt`, and demo transcript path
- Friendly error states for invalid, unsupported, or oversized uploads

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Three.js, Axios |
| Backend | Node.js, Express, Multer, dotenv, express-rate-limit |
| Transcription | Python — `mlx-whisper` (Apple Silicon) or `faster-whisper` (Windows/Linux) |

## Run Locally

**Backend:**

```bash
cd backend
cp .env.example .env   # edit PORT if needed
npm install
npm start
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173` — Backend: `http://localhost:3000`

> **Python requirement:** the transcription script requires Python 3 and pip. The required Whisper library installs automatically on the first transcription — nothing needs to be installed upfront.

## Transcription — Hardware Auto-Detection

The backend detects the machine at runtime and picks the fastest available Whisper backend:

| Hardware | Backend | Notes |
|---|---|---|
| Apple Silicon Mac | `mlx-whisper` | Uses Apple MLX framework, very fast |
| Windows / Linux + NVIDIA GPU | `faster-whisper` | CUDA with float16 |
| Windows / Linux CPU | `faster-whisper` | CPU with int8 quantisation |
| Intel Mac | `faster-whisper` | CPU with int8 quantisation |

On first transcription, pip installs the relevant library and the Whisper `small` model weights (~500 MB) are downloaded once and cached locally. Audio never leaves your machine.

The model size can be changed in `backend/transcribe.py` by swapping `"small"` for `"tiny"`, `"base"`, `"medium"`, or `"large"`.

## API

### `GET /health`

Returns `{ "status": "ok" }`. Rate limited to 100 requests per 15 minutes per IP.

### `POST /transcribe`

Accepts `multipart/form-data` with a single `file` field.

- **Accepted types:** audio or video (MP3, WAV, MP4, M4A, OGG, FLAC, WebM, MOV, AAC, WMA, OPUS)
- **Max file size:** 50 MB
- **Rate limit:** 10 requests per 15 minutes per IP

Example response:

```json
{
  "fileName": "meeting.mp3",
  "fileSize": 1234567,
  "transcription": "Thanks everyone for joining...",
  "summary": "A project status update covering...",
  "keyPoints": ["The onboarding flow was completed.", "..."],
  "actionItems": ["Finish transcript export support.", "..."]
}
```

Error responses use `{ "error": "..." }` with an appropriate HTTP status code. Rate limit responses include standard `RateLimit-*` headers.

## Security

- **Rate limiting** — global (100 req/15 min) and per-endpoint limits via `express-rate-limit` with standard RFC 6585 headers
- **MIME + extension validation** — both the MIME type prefix and file extension are checked against a whitelist
- **Magic-byte validation** — the first 12 bytes of every uploaded file are compared against known audio/video signatures to catch MIME spoofing
- **Filename sanitisation** — non-alphanumeric characters stripped, double dots collapsed to prevent path traversal
- **Field limits** — multer rejects requests with more than one file or any unexpected non-file fields
- **Environment variables** — all secrets loaded from `.env` (gitignored); `.env.example` documents the pattern

## Environment Variables

Copy `backend/.env.example` to `backend/.env` before running:

```bash
PORT=3000   # default
```

When adding a future API key, follow the pattern documented in `backend/server.js`: read from `process.env`, validate at startup, never log or return it in responses.

## Whisper Research

Before implementing, several transcription options were evaluated.

### Options considered

| Option | Problem |
|---|---|
| AssemblyAI / Deepgram / Rev AI | Paid per-minute, requires API key — usage-based cost for a portfolio project with unknown traffic |
| OpenAI Whisper API | Same model, hosted by OpenAI — requires billing credentials and sends audio off-machine |
| `@xenova/transformers` | Critical vulnerabilities via `onnxruntime-web` → `onnx-proto` → `protobufjs` with no clean fix |
| `@huggingface/transformers` v3 | Runs Whisper via ONNX in Node.js — confirmed working but requires ffmpeg for audio decoding and is significantly slower than native bindings |
| **`mlx-whisper` / `faster-whisper`** | **Chosen** — native bindings, hardware-accelerated, zero vulnerabilities, no API key |

### Node.js AudioContext issue

During the `@huggingface/transformers` prototype, running the pipeline in Node.js threw:

```
Unable to load audio from path/URL since AudioContext is not available in your environment.
```

`AudioContext` is a browser API. The fix was to decode audio outside the model using `ffmpeg-static`, which ships a bundled ffmpeg binary. This worked but added ~150 MB to the install and was slower than native bindings. Moving transcription to a Python subprocess (`transcribe.py`) solved both problems.

## Portfolio Notes

- Focus is product UX, upload flow, state management, and full-stack architecture
- Transcription runs entirely on-device — no external dependencies or costs at runtime
- Visitors can explore with a real file upload, mic recording, or the built-in demo transcript
