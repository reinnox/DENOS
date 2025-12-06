# StudyBuddy (DENOS) — Starter

This repository contains a minimal Next.js PWA scaffold that demonstrates:
- Google Sign-In using Firebase Auth
- An API endpoint that accepts an image (base64) or text and returns generated flashcards (uses Google Cloud Vision + OpenAI)
- A simple front-end Flashcard editor with save/edit/delete hooks to Firestore

Environment variables (create a .env.local in the project root):
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_ID=...
GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-creds.json
OPENAI_API_KEY=...

Run locally:
1. npm install
2. npm run dev

Notes:
- The API expects GOOGLE_APPLICATION_CREDENTIALS set for Vision API or you can skip OCR and POST plainText to /api/ocr-to-flashcards
- Replace OpenAI model names with ones available for your account

License: MIT
