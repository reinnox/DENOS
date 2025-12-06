# Deploying DENOS to Vercel (automated via GitHub Actions)

This document explains how to provide the secrets required for GitHub Actions to deploy DENOS to Vercel automatically.

Required GitHub repository secrets
- VERCEL_TOKEN — a Vercel Personal Token
- VERCEL_ORG_ID — your Vercel organization ID
- VERCEL_PROJECT_ID — the Vercel project ID for this repository

How to get the values
1. VERCEL_TOKEN
   - Sign in to the Vercel dashboard.
   - Open Account Settings → Tokens → Create Token.
   - Copy the generated token and keep it safe.

2. VERCEL_ORG_ID and VERCEL_PROJECT_ID
   - In the Vercel dashboard open your Organization and Project.
   - On the Project settings page (General) you'll find the Project ID.
   - On the Organization settings page you'll find the Organization ID.
   - Copy those values.

Add secrets to GitHub
1. In GitHub, open the repository `reinnox/DENOS`.
2. Go to Settings → Secrets and variables → Actions → New repository secret.
3. Add each secret name above with its value.

Environment variables for build/runtime
- Add runtime secrets (OpenAI key, Firebase variables, Google credentials) in your Vercel project settings (Environment Variables) or as GitHub secrets and configure the workflow to pass them if needed.
- Typical env vars your app needs:
  - OPENAI_API_KEY
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - FIREBASE_CLIENT_ID
  - GOOGLE_APPLICATION_CREDENTIALS (for server; recommend adding service account in Vercel project environment as JSON string or using a secrets manager)
  - NEXT_PUBLIC_VAPID_KEY (if using push)

What happens after secrets are added
- When `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are present in the repo secrets, any push to `main` will trigger the `Deploy to Vercel` GitHub Action and deploy the app to production.

Notes
- Do not paste secret values into files or chat. Use GitHub Secrets and Vercel Environment Variables.
- If you want, I can give the exact text for the environment variables to add in the Vercel project UI.
