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

## Portfolio Notes

- This project intentionally uses mocked transcription output
- The focus is product UX, upload flow, state handling, and full-stack structure
- Visitors can explore the app with either a real file upload or the built-in demo transcript

## Next Steps

- Replace mocked transcription with a real AI transcription provider
- Replace local transcript history with a real database
- Support timestamps, speaker labels, and exports
