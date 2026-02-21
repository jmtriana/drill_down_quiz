<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c3700291-b7de-4db4-b7de-e6e45dabd9a2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Firebase RTDB setup

This project can optionally sync session state to a Firebase Realtime Database. Create a `.env.local` (Vite) file at the project root with the following variables:

- `VITE_FIREBASE_API_KEY` - your Firebase API key
- `VITE_FIREBASE_DATABASE_URL` - the RTDB URL, e.g. `https://<project>.firebaseio.com`
- `VITE_FIREBASE_PROJECT_ID` - (optional) project id
- `VITE_FIREBASE_AUTH_DOMAIN` - (optional) auth domain
- `VITE_FIREBASE_APP_ID` - (optional) app id

Then start the app with `npm run dev`. If the env vars are present the app will initialize Firebase and sync session state under `sessions/<sessionId>`.

Use a URL param `?session=your-session-id` to select the session (defaults to `demo-session`).
