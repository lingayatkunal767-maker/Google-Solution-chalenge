# VolunteerMatch AI — Deployment Guide

## Option A: Firebase (Recommended — Free Tier Available)

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add project" → name it `volunteermatch-ai`
3. Enable Google Analytics (optional)
4. In the Firebase console:
   - **Authentication** → Enable Email/Password sign-in
   - **Firestore Database** → Create database (Start in production mode)
   - **Storage** → Enable (for proof photos)
   - **Cloud Messaging** → Note your Server Key + VAPID key

### Step 2: Get Service Account
1. Project Settings → Service accounts
2. Click "Generate new private key"
3. Save as `backend/serviceAccountKey.json` (NEVER commit this!)
4. Set env var: `FIREBASE_SERVICE_ACCOUNT=$(cat serviceAccountKey.json)`

### Step 3: Deploy Backend (Cloud Functions)
```bash
cd backend

# Login to Firebase
firebase login

# Set your project
firebase use --add volunteermatch-ai

# Install Firebase Tools
npm install -g firebase-tools

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Firestore rules + indexes
firebase deploy --only firestore
```

### Step 4: Deploy Coordinator Dashboard (Firebase Hosting)
```bash
cd coordinator-dashboard

# Create .env.production
cat > .env.production << EOF
REACT_APP_API_URL=https://us-central1-volunteermatch-ai.cloudfunctions.net
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=volunteermatch-ai.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=volunteermatch-ai
REACT_APP_FIREBASE_STORAGE_BUCKET=volunteermatch-ai.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
EOF

# Build
npm run build

# Deploy
firebase deploy --only hosting
```

### Step 5: Deploy Volunteer App (Firebase Hosting — Separate site)
```bash
cd volunteer-app
npm run build
# Configure second hosting site in firebase.json, then:
firebase deploy --only hosting:volunteer-app
```

---

## Option B: Vercel + Railway (Fast Deployment)

### Backend → Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway new

# Set environment variables in Railway dashboard:
# FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT, PORT=3001

# Deploy
railway up
```

### Coordinator Dashboard → Vercel
```bash
npm install -g vercel
cd coordinator-dashboard
vercel --prod
# Set REACT_APP_API_URL to your Railway backend URL
```

### Volunteer App → Vercel
```bash
cd volunteer-app
vercel --prod
```

---

## Option C: Google Cloud Run (Production Scale)

### Build & Push Container
```bash
cd backend

# Build Docker image
docker build -t gcr.io/volunteermatch-ai/backend:latest .

# Push to Google Container Registry
docker push gcr.io/volunteermatch-ai/backend:latest

# Deploy to Cloud Run
gcloud run deploy volunteermatch-backend \
  --image gcr.io/volunteermatch-ai/backend:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,FIREBASE_PROJECT_ID=volunteermatch-ai
```

---

## Environment Variables Reference

### Backend (backend/.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `FIREBASE_PROJECT_ID` | Firebase project ID | `volunteermatch-ai` |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `volunteermatch-ai.appspot.com` |
| `FIREBASE_SERVICE_ACCOUNT` | JSON service account (single line) | `{"type":"service_account"...}` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `production` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://dashboard.web.app` |

### Frontend (.env.production)
| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API base URL |
| `REACT_APP_FIREBASE_API_KEY` | Firebase Web API Key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | FCM Sender ID |
| `REACT_APP_FIREBASE_APP_ID` | Firebase App ID |

---

## Post-Deployment Checklist

- [ ] Firestore rules deployed and tested
- [ ] First coordinator account created manually in Firebase Auth console
- [ ] CORS origins updated to production domain
- [ ] Rate limiting configured for production traffic
- [ ] FCM VAPID key set for push notifications
- [ ] Google Maps API key added (if using map features)
- [ ] Monitoring set up (Firebase Crashlytics / Cloud Monitoring)
- [ ] Backup strategy configured for Firestore

---

## Estimated Costs (Firebase Free Tier)

| Service | Free Tier | Expected Usage |
|---------|-----------|----------------|
| Firestore reads | 50,000/day | ~500/day |
| Firestore writes | 20,000/day | ~100/day |
| Cloud Functions | 2M invocations/month | ~5,000/month |
| Hosting | 10 GB/month | <1 GB/month |
| FCM | Unlimited | Free |

**Estimated cost for hackathon/demo: $0** (well within free tier)
