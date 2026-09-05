# PromptVault AI ⚡

**PromptVault AI** is a production-grade AI prompt engineering and management platform. It allows developers, creators, and teams to discover, test, optimize, version, and orchestrate high-performance prompts with Gemini AI.

---

## Features

- **Prompt Library & Categorization**: Curated and user-authored prompts across Engineering, Marketing, Design, Product, Academic, and Operations.
- **AI Prompt Optimizer**: Transforms raw prompts into structured prompts using Google Gemini (`gemini-3.5-flash` or High-Thinking `gemini-3.1-pro-preview`).
- **Deep Architectural & Security Audit**: Audits prompt vulnerability against injection, tests variable resilience, and evaluates structure.
- **Interactive Prompt Builder**: Live variable substitution and real-time LLM test runs.
- **Collections & Organization**: Custom private collections and tag filtering.
- **Firebase Authentication & Firestore Sync**: Real-time cloud sync with fallback local caching.
- **Admin CMS & User Management**: Role-based access control with prompt moderation and community publishing.
- **Complete Export & Backups**: One-click JSON data export and automated Firestore backup scripts.

---

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env` (refer to `.env.example`).

3. Start local development server (Express + Vite):
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the app.

4. Run type check and lint:
   ```bash
   npm run lint
   ```

---

## Deploying to Vercel

PromptVault AI is ready for zero-configuration deployment on **Vercel** (including the Free/Hobby tier) using Vercel Serverless Functions under `/api`:

### 1. Import Repository
1. Push your code to your GitHub / GitLab / Bitbucket repository.
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
3. Select and import your `promptvault-ai` repository.

### 2. Configure Build & Framework Settings
Vercel automatically detects the `vercel.json` configuration:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3. Set Environment Variables
In the Vercel project setup (under **Settings → Environment Variables**), add the following variables for **Production** and **Preview**:

| Variable Name | Description | Example / Note |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API Key | Secret key used by `/api/*` serverless routes |
| `ALLOWED_ORIGIN` | Allowed CORS origins | `https://your-vercel-domain.vercel.app` |
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | Client-side Firebase Authentication & Firestore |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID | `1234567890` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:1234567890:web:abcdef` |
| `VITE_FIREBASE_DATABASE_ID` | Firestore Database ID | `(default)` |
| `VITE_ADMIN_EMAIL` | Superadmin Bootstrap Email | *(Optional)* Initial admin email |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics Measurement ID | *(Optional)* `G-XXXXXXXXXX` |

### 4. Deploy
Click **Deploy**. Vercel will build the frontend into `dist/` and deploy the serverless functions in `/api` automatically.

---

## Available Scripts

- `npm run dev`: Runs local Express server with Vite middleware on port 3000.
- `npm run build`: Builds the production Vite bundle and compiles server scripts.
- `npm run start`: Runs the compiled production Node.js server.
- `npm run lint`: Runs TypeScript compiler (`tsc --noEmit`) to verify type safety.
- `npm run backup:firestore`: Runs the standalone Firestore backup utility to `backups/`.
