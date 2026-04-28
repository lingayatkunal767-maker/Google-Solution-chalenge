# 🤝 VolunteerMatch AI

> **Google Hackathon Project** — Smart volunteer-to-community-needs matching platform using AI scoring and real-time notifications.

![VolunteerMatch AI](https://img.shields.io/badge/status-production--ready-00c896?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase)

---

## 📋 Project Overview

VolunteerMatch AI connects NGOs, coordinators, and volunteers using an explainable AI scoring algorithm. The platform automatically ranks volunteers for each community need and delivers real-time push notifications.

**Core Formula:**
```
MATCH_SCORE = (SkillFit × 0.40) + (Availability × 0.30) + (Location × 0.20) + (Interest × 0.10)
```

---

## 🏗️ Architecture

```
volunteermatch-ai/
├── backend/                  # Node.js + Express API (Firebase Cloud Functions)
│   ├── config/
│   │   └── firebase.js       # Firebase Admin SDK initialization
│   ├── functions/
│   │   ├── index.js          # Main Express server + all API routes
│   │   ├── matchingEngine.js # AI scoring algorithm (pure JS, fully testable)
│   │   └── matchingEngine.test.js  # Unit tests (Jest)
│   ├── firestore.rules       # Firestore security rules
│   ├── firebase.json         # Firebase project config
│   ├── .env.example          # Environment variable template
│   └── package.json
│
├── coordinator-dashboard/    # React web admin panel
│   ├── src/
│   │   ├── App.js            # Router + Auth context
│   │   ├── components/
│   │   │   ├── Sidebar.js    # Navigation sidebar
│   │   │   └── MatchCard.js  # AI match result card
│   │   ├── pages/
│   │   │   ├── Dashboard.js  # Command center overview
│   │   │   ├── NeedsPage.js  # Create & manage needs
│   │   │   ├── VolunteersPage.js  # Volunteer database
│   │   │   ├── AnalyticsPage.js  # Charts & insights
│   │   │   ├── LeaderboardPage.js  # Top volunteers
│   │   │   └── LoginPage.js  # Coordinator login
│   │   ├── utils/
│   │   │   ├── api.js        # Axios API client
│   │   │   └── mockData.js   # Demo data
│   │   └── styles/
│   │       └── globals.css   # Complete design system
│   └── package.json
│
├── volunteer-app/            # React mobile app (phone shell UI)
│   ├── src/
│   │   ├── App.js            # App shell + bottom navigation
│   │   ├── screens/
│   │   │   ├── HomeScreen.js     # AI-matched opportunities
│   │   │   ├── TasksScreen.js    # Active & completed tasks
│   │   │   ├── NotificationsScreen.js
│   │   │   ├── ProfileScreen.js  # Skills & availability editor
│   │   │   └── LoginScreen.js    # Sign in / Sign up
│   │   └── styles/
│   │       └── app.css       # Mobile-first design system
│   └── package.json
│
└── README.md
```

---

## 🗄️ Database Schema (Firestore)

### `users/` — Authentication & roles
```json
{
  "email": "sarah@ngo.com",
  "role": "coordinator | volunteer | admin",
  "displayName": "Sarah Kumar",
  "isBlacklisted": false,
  "createdAt": "2026-04-21T10:00:00Z"
}
```

### `volunteers/` — Volunteer profiles
```json
{
  "userId": "vol_123",
  "name": "Ramesh Patel",
  "skills": ["medical", "first-aid"],
  "availability": { "weekdays": true, "weekends": true, "flexibleHours": [...] },
  "location": { "lat": 18.5204, "lng": 73.8567, "address": "Pune" },
  "rating": 4.7,
  "completedTasks": 15,
  "responseRate": 92.5,
  "fcmToken": "device_token_for_push_notifications"
}
```

### `needs/` — Community needs (tasks)
```json
{
  "title": "Emergency Medical Assistance",
  "requiredSkills": ["medical", "first-aid"],
  "urgency": "immediate | urgent | planned",
  "status": "open | assigned | completed",
  "location": { "lat": 19.07, "lng": 72.87, "address": "Mumbai" },
  "estimatedHours": 4,
  "createdBy": "coord_001"
}
```

### `matches/` — AI match records
```json
{
  "needId": "need_001",
  "volunteerId": "vol_123",
  "score": 87.5,
  "scoreBreakdown": { "skillFit": 100, "availability": 90, "location": 75, "interest": 85 },
  "explanation": "Score 87.5/100 — Strong skill alignment, fully available, nearby location.",
  "status": "suggested | assigned | accepted | completed | declined"
}
```

---

## 🤖 AI Matching Algorithm

**File:** `backend/functions/matchingEngine.js`

```javascript
// MATCH_SCORE = (SkillFit × 0.40) + (Availability × 0.30) + (Location × 0.20) + (Interest × 0.10)

function calculateSkillFit(volunteerSkills, requiredSkills) {
  // Ratio of matched required skills (0–100)
  const matched = requiredSkills.filter(s => volunteerSkills.includes(s)).length;
  return (matched / requiredSkills.length) * 100;
}

function calculateLocationScore(volunteerLoc, needLoc) {
  // Haversine distance: 0km = 100pts, 50km+ = 0pts
  const distKm = haversineDistance(volunteerLoc, needLoc);
  return distKm <= 5 ? 100 : distKm >= 50 ? 0 : 100 * (1 - (distKm - 5) / 45);
}
```

The algorithm is:
- **Pure JavaScript** — no external ML dependencies, runs in <2ms per volunteer
- **Explainable** — every score includes a human-readable breakdown
- **Testable** — 15+ unit tests covering all edge cases

---

## 📡 API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | Public | Health check |
| `POST` | `/api/auth/register` | Any | Create user profile |
| `PUT` | `/api/auth/fcm-token` | Volunteer | Update FCM push token |
| `GET` | `/api/volunteers` | Coordinator | List all volunteers |
| `GET` | `/api/volunteers/:id` | Owner/Coordinator | Get volunteer profile |
| `PUT` | `/api/volunteers/:id` | Owner | Update profile |
| `GET` | `/api/volunteers/:id/matches` | Owner | Get volunteer's matches |
| `POST` | `/api/needs` | Coordinator | Create community need |
| `GET` | `/api/needs` | Any | List needs (filterable) |
| `PUT` | `/api/needs/:id` | Coordinator | Update need |
| `POST` | `/api/match/:needId/trigger` | Coordinator | **Run AI matching** |
| `POST` | `/api/match/:matchId/assign` | Coordinator | Assign & notify volunteer |
| `POST` | `/api/match/:matchId/respond` | Volunteer | Accept or decline |
| `POST` | `/api/match/:matchId/complete` | Any | Mark task complete |
| `POST` | `/api/match/:matchId/feedback` | Any | Submit rating (1–5) |
| `GET` | `/api/analytics` | Coordinator | Dashboard analytics |
| `GET` | `/api/analytics/export` | Coordinator | Download CSV |
| `GET` | `/api/leaderboard` | Any | Top volunteers |
| `GET` | `/api/notifications` | Volunteer | My notifications |
| `PUT` | `/api/notifications/:id/read` | Volunteer | Mark as read |

---

## 🚀 Setup & Deployment

### Prerequisites
- Node.js 18+
- Firebase project with Firestore, Auth, FCM enabled
- Firebase CLI: `npm install -g firebase-tools`

### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy and fill environment variables
cp .env.example .env

# Start local development server
npm run dev

# Run tests
npm test

# Start Firebase emulators (local Firestore + Auth)
firebase emulators:start

# Deploy to Firebase Functions
npm run deploy
```

### 2. Coordinator Dashboard Setup
```bash
cd coordinator-dashboard

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:3001" > .env

# Start development server
npm start

# Build for production
npm run build
```

### 3. Volunteer App Setup
```bash
cd volunteer-app

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Firebase Configuration
```bash
# Login
firebase login

# Set project
firebase use --add YOUR_PROJECT_ID

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy hosting (coordinator dashboard)
firebase deploy --only hosting
```

### 5. Environment Variables (backend/.env)
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://your-dashboard.web.app
```

---

## 🔐 Security

- **Firebase Auth JWT** verification on all protected routes
- **Role-based access control** (volunteer / coordinator / admin)
- **Firestore Security Rules** preventing cross-user data access
- **Rate limiting** — 100 requests / 15 min per IP
- **Helmet.js** HTTP security headers
- **Blacklist** support for suspended accounts
- FCM tokens never exposed via API

---

## 📊 Features

### Coordinator Dashboard
- [x] Secure login
- [x] Create & manage community needs
- [x] One-click AI matching (shows top 5 volunteers with scores)
- [x] Assign volunteers with one click → instant push notification
- [x] Real-time response tracking
- [x] Analytics charts (trends, categories, skill demand)
- [x] Export data as CSV
- [x] Volunteer database with search & filter
- [x] Leaderboard with achievement badges
- [x] AI insights & recommendations
- [x] Dark / Light mode

### Volunteer App
- [x] Sign up / Login
- [x] View AI-matched opportunities with match score
- [x] Accept / Decline tasks
- [x] Task tracking (active & history)
- [x] Rate experience (1–5 stars)
- [x] Upload proof photos
- [x] Push notifications
- [x] Profile with skills & availability editor
- [x] Gamification (points, streaks, badges, leaderboard rank)

### Backend
- [x] RESTful API (Node.js + Express)
- [x] Firebase Auth + JWT verification
- [x] Firestore database with security rules
- [x] AI matching engine (<2ms per volunteer)
- [x] Firebase Cloud Messaging (push notifications)
- [x] Rate limiting + Helmet.js
- [x] Morgan logging
- [x] Error handling
- [x] CSV export
- [x] Unit tests (Jest)

---

## 🧪 Testing

```bash
cd backend
npm test

# Output:
# ✓ haversineDistance (2 tests)
# ✓ calculateSkillFit (5 tests)
# ✓ calculateAvailability (3 tests)
# ✓ calculateLocationScore (4 tests)
# ✓ calculateMatchScore (4 tests)
# ✓ rankVolunteersForNeed (4 tests)
# 
# Test Suites: 1 passed
# Tests: 22 passed
```

---

## 🎬 Demo Flow

1. **Coordinator logs in** → sees dashboard with open needs
2. **Coordinator clicks "⚡ Find Volunteers"** on an urgent need
3. **AI engine runs** → scores all volunteers in <2 seconds
4. **Top 5 ranked** with score breakdown (SkillFit, Availability, Location, Interest)
5. **Coordinator clicks "Assign"** → push notification sent to volunteer's phone
6. **Volunteer sees notification** → opens app → accepts task
7. **Coordinator dashboard updates in real-time** → status changes to "Accepted"
8. **Volunteer completes task** → uploads photo → rates experience
9. **Analytics update** → coordinator sees metrics improve

---

## 👥 Team Structure

| Role | Responsibility |
|------|---------------|
| **Member 1** | Volunteer Mobile App (React/Flutter) |
| **Member 2** | Coordinator Dashboard (React + Charts) |
| **Member 3** | Backend + Firebase + AI Engine ← *this repo* |
| **Member 4** | ML/Data + BigQuery + Vertex AI retraining |

---

## 🏆 Bonus Features Implemented
- [x] Leaderboard for volunteers
- [x] AI suggestions/insights for coordinators
- [x] Achievement badges (Power Volunteer, Elite Rated, etc.)
- [x] Gamification (points, streaks)
- [x] Volunteer analytics & retention metrics
- [x] Skill demand insights
- [x] CSV export
- [ ] Chat system (planned)
- [ ] Multi-language support (planned)
- [ ] Email notifications (planned via SendGrid)

---

## 📞 Support

Built for **Google Hackathon 2026** | VolunteerMatch AI Team

*"Connecting hearts, changing lives — powered by AI."*
