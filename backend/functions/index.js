// functions/index.js
// VolunteerMatch AI - Main Backend Server

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const { initFirebase } = require('../config/firebase');
const { rankVolunteersForNeed, calculateMatchScore } = require('./matchingEngine');

// Initialize Firebase
const { db, auth, messaging } = initFirebase();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── Auth Middleware ───────────────────────────────────────────────────────────
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;

    // Fetch role from Firestore
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) return res.status(403).json({ error: 'User not found' });
    const userData = userDoc.data();
    if (userData.isBlacklisted) return res.status(403).json({ error: 'Account suspended' });
    req.userRole = userData.role;
    req.userDoc = userData;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
}

// ─── Helper: Send FCM Notification ────────────────────────────────────────────
async function sendPushNotification(fcmToken, title, body, data = {}) {
  if (!fcmToken) return null;
  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: { ...data },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    };
    const response = await messaging.send(message);
    return response;
  } catch (err) {
    console.error('FCM Error:', err.message);
    return null;
  }
}

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'VolunteerMatch AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/auth/register - Create user profile after Firebase Auth signup
app.post('/api/auth/register', authenticate, async (req, res) => {
  try {
    const { role = 'volunteer', displayName, phoneNumber } = req.body;
    const { uid, email } = req.user;

    const userRef = db.collection('users').doc(uid);
    const existing = await userRef.get();
    if (existing.exists) {
      return res.status(409).json({ error: 'User already registered' });
    }

    const userData = {
      email,
      role,
      displayName: displayName || email.split('@')[0],
      phoneNumber: phoneNumber || null,
      isBlacklisted: false,
      createdAt: new Date().toISOString(),
    };

    await userRef.set(userData);

    // If volunteer, create volunteer profile skeleton
    if (role === 'volunteer') {
      await db.collection('volunteers').doc(uid).set({
        userId: uid,
        name: userData.displayName,
        phone: phoneNumber || '',
        location: { lat: 0, lng: 0, address: '' },
        skills: [],
        availability: { weekdays: false, weekends: false, flexibleHours: [] },
        pastTasks: [],
        rating: 0,
        responseRate: 100,
        completedTasks: 0,
        fcmToken: null,
        createdAt: new Date().toISOString(),
      });
    }

    res.status(201).json({ success: true, user: userData });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// PUT /api/auth/fcm-token - Update FCM device token
app.put('/api/auth/fcm-token', authenticate, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ error: 'fcmToken required' });

    await db.collection('volunteers').doc(req.user.uid).update({ fcmToken });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// VOLUNTEER ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/volunteers - List all volunteers (coordinator only)
app.get('/api/volunteers', authenticate, requireRole('coordinator', 'admin'), async (req, res) => {
  try {
    const snapshot = await db.collection('volunteers').orderBy('rating', 'desc').get();
    const volunteers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fcmToken: undefined, // never expose FCM tokens
    }));
    res.json({ volunteers, total: volunteers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/volunteers/:id - Get volunteer profile
app.get('/api/volunteers/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    // Volunteers can only see their own profile; coordinators can see all
    if (req.userRole === 'volunteer' && req.user.uid !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const doc = await db.collection('volunteers').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Volunteer not found' });

    const data = doc.data();
    delete data.fcmToken; // never expose
    res.json({ id: doc.id, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/volunteers/:id - Update volunteer profile
app.put('/api/volunteers/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.userRole === 'volunteer' && req.user.uid !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const allowed = ['name', 'phone', 'location', 'skills', 'availability'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    updates.updatedAt = new Date().toISOString();

    await db.collection('volunteers').doc(id).update(updates);
    res.json({ success: true, updated: updates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/volunteers/:id/matches - Get matches for a volunteer
app.get('/api/volunteers/:id/matches', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.userRole === 'volunteer' && req.user.uid !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const snapshot = await db
      .collection('matches')
      .where('volunteerId', '==', id)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const matches = [];
    for (const doc of snapshot.docs) {
      const match = { id: doc.id, ...doc.data() };
      // Enrich with need details
      if (match.needId) {
        const needDoc = await db.collection('needs').doc(match.needId).get();
        if (needDoc.exists) match.need = needDoc.data();
      }
      matches.push(match);
    }

    res.json({ matches, total: matches.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// NEEDS (COMMUNITY NEEDS) ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/needs - Create a new community need
app.post('/api/needs', authenticate, requireRole('coordinator', 'admin'), async (req, res) => {
  try {
    const {
      title, description, requiredSkills = [],
      location, urgency = 'planned', estimatedHours = 2,
      category = 'general',
    } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ error: 'title, description, and location are required' });
    }

    const needData = {
      title,
      description,
      requiredSkills,
      location,
      urgency,
      estimatedHours,
      category,
      status: 'open',
      createdBy: req.user.uid,
      createdAt: new Date().toISOString(),
      assignedTo: null,
      completedAt: null,
    };

    const docRef = await db.collection('needs').add(needData);
    res.status(201).json({ success: true, needId: docRef.id, need: needData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/needs - List all needs
app.get('/api/needs', authenticate, async (req, res) => {
  try {
    const { status, category, urgency, limit = 50 } = req.query;
    let query = db.collection('needs').orderBy('createdAt', 'desc');

    if (status) query = query.where('status', '==', status);
    if (category) query = query.where('category', '==', category);
    if (urgency) query = query.where('urgency', '==', urgency);

    const snapshot = await query.limit(Number(limit)).get();
    const needs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ needs, total: needs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/needs/:id - Get single need
app.get('/api/needs/:id', authenticate, async (req, res) => {
  try {
    const doc = await db.collection('needs').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Need not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/needs/:id - Update a need
app.put('/api/needs/:id', authenticate, requireRole('coordinator', 'admin'), async (req, res) => {
  try {
    const allowed = ['title', 'description', 'requiredSkills', 'location', 'urgency', 'estimatedHours', 'category', 'status'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    updates.updatedAt = new Date().toISOString();

    await db.collection('needs').doc(req.params.id).update(updates);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// MATCHING ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/match/:needId/trigger - Run AI matching for a need
app.post('/api/match/:needId/trigger', authenticate, requireRole('coordinator', 'admin'), async (req, res) => {
  try {
    const { needId } = req.params;
    const startTime = Date.now();

    // Fetch the need
    const needDoc = await db.collection('needs').doc(needId).get();
    if (!needDoc.exists) return res.status(404).json({ error: 'Need not found' });
    const need = { id: needDoc.id, ...needDoc.data() };

    if (need.status !== 'open') {
      return res.status(400).json({ error: `Need is ${need.status}, not open` });
    }

    // Fetch all active volunteers
    const volunteerSnapshot = await db.collection('volunteers').get();
    const volunteers = volunteerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch completed needs for interest calculation
    const completedNeedsSnap = await db
      .collection('needs')
      .where('status', '==', 'completed')
      .limit(200)
      .get();
    const allCompletedNeeds = completedNeedsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Run AI ranking
    const topMatches = await rankVolunteersForNeed(need, volunteers, allCompletedNeeds, 5);

    // Store matches in Firestore
    const batch = db.batch();
    const matchRecords = [];

    for (const match of topMatches) {
      const matchId = uuidv4();
      const matchData = {
        needId,
        volunteerId: match.volunteerId,
        coordinatorId: req.user.uid,
        score: match.score,
        scoreBreakdown: match.scoreBreakdown,
        explanation: match.explanation,
        status: 'suggested',
        volunteerName: match.volunteerName,
        volunteerLocation: match.volunteerLocation,
        volunteerSkills: match.volunteerSkills,
        volunteerRating: match.volunteerRating,
        completedTasks: match.completedTasks,
        responseRate: match.responseRate,
        createdAt: new Date().toISOString(),
      };

      // Upsert (overwrite if already suggested for this need/volunteer)
      const existingSnap = await db
        .collection('matches')
        .where('needId', '==', needId)
        .where('volunteerId', '==', match.volunteerId)
        .where('status', '==', 'suggested')
        .limit(1)
        .get();

      if (!existingSnap.empty) {
        batch.update(existingSnap.docs[0].ref, { score: match.score, scoreBreakdown: match.scoreBreakdown });
        matchRecords.push({ id: existingSnap.docs[0].id, ...matchData });
      } else {
        const ref = db.collection('matches').doc(matchId);
        batch.set(ref, matchData);
        matchRecords.push({ id: matchId, ...matchData });
      }
    }

    await batch.commit();

    const elapsed = Date.now() - startTime;
    console.log(`Matching completed in ${elapsed}ms for need ${needId}`);

    res.json({
      success: true,
      needId,
      topMatches: matchRecords,
      totalVolunteersEvaluated: volunteers.length,
      computeTimeMs: elapsed,
    });
  } catch (err) {
    console.error('Matching error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/match/:matchId/assign - Assign a volunteer and send notification
app.post('/api/match/:matchId/assign', authenticate, requireRole('coordinator', 'admin'), async (req, res) => {
  try {
    const { matchId } = req.params;

    const matchDoc = await db.collection('matches').doc(matchId).get();
    if (!matchDoc.exists) return res.status(404).json({ error: 'Match not found' });
    const match = matchDoc.data();

    // Update match status
    await db.collection('matches').doc(matchId).update({
      status: 'assigned',
      assignedAt: new Date().toISOString(),
    });

    // Update need status
    await db.collection('needs').doc(match.needId).update({
      status: 'assigned',
      assignedTo: match.volunteerId,
      assignedAt: new Date().toISOString(),
    });

    // Get need details for notification
    const needDoc = await db.collection('needs').doc(match.needId).get();
    const need = needDoc.data();

    // Get volunteer's FCM token
    const volunteerDoc = await db.collection('volunteers').doc(match.volunteerId).get();
    const volunteer = volunteerDoc.data();

    // Send push notification
    const notifTitle = '🤝 New Volunteer Match!';
    const notifBody = `You've been matched with "${need.title}" in ${need.location?.address || 'your area'}. Can you help?`;

    await sendPushNotification(volunteer.fcmToken, notifTitle, notifBody, {
      matchId,
      needId: match.needId,
      type: 'match_alert',
    });

    // Store notification record
    const notifData = {
      volunteerId: match.volunteerId,
      matchId,
      title: notifTitle,
      body: notifBody,
      type: 'match_alert',
      isRead: false,
      channel: 'push',
      status: volunteer.fcmToken ? 'sent' : 'pending',
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    await db.collection('notifications').add(notifData);

    res.json({ success: true, matchId, volunteerId: match.volunteerId });
  } catch (err) {
    console.error('Assign error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/match/:matchId/respond - Volunteer accepts or declines
app.post('/api/match/:matchId/respond', authenticate, requireRole('volunteer'), async (req, res) => {
  try {
    const { matchId } = req.params;
    const { accepted } = req.body;

    if (typeof accepted !== 'boolean') {
      return res.status(400).json({ error: '"accepted" (boolean) is required' });
    }

    const matchDoc = await db.collection('matches').doc(matchId).get();
    if (!matchDoc.exists) return res.status(404).json({ error: 'Match not found' });
    const match = matchDoc.data();

    // Ensure this volunteer owns this match
    if (match.volunteerId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (accepted) {
      await db.collection('matches').doc(matchId).update({
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
      });
      res.json({ success: true, status: 'accepted' });
    } else {
      await db.collection('matches').doc(matchId).update({
        status: 'declined',
        declinedAt: new Date().toISOString(),
      });

      // Re-open the need if no other accepted matches
      const otherAccepted = await db
        .collection('matches')
        .where('needId', '==', match.needId)
        .where('status', '==', 'accepted')
        .limit(1)
        .get();

      if (otherAccepted.empty) {
        await db.collection('needs').doc(match.needId).update({
          status: 'open',
          assignedTo: null,
        });
      }

      res.json({ success: true, status: 'declined' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/match/:matchId/complete - Mark task as completed
app.post('/api/match/:matchId/complete', authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { proofPhotoUrl } = req.body;

    const matchDoc = await db.collection('matches').doc(matchId).get();
    if (!matchDoc.exists) return res.status(404).json({ error: 'Match not found' });
    const match = matchDoc.data();

    const completedAt = new Date().toISOString();

    await db.collection('matches').doc(matchId).update({
      status: 'completed',
      completedAt,
      proofPhotoUrl: proofPhotoUrl || null,
    });

    await db.collection('needs').doc(match.needId).update({
      status: 'completed',
      completedAt,
    });

    // Update volunteer stats
    const volRef = db.collection('volunteers').doc(match.volunteerId);
    const volDoc = await volRef.get();
    const volData = volDoc.data();

    await volRef.update({
      completedTasks: (volData.completedTasks || 0) + 1,
      pastTasks: [...(volData.pastTasks || []), match.needId],
    });

    // Send feedback request notification
    await sendPushNotification(
      volData.fcmToken,
      '⭐ How did it go?',
      'Please rate your recent volunteer experience.',
      { matchId, type: 'feedback_request' }
    );

    res.json({ success: true, matchId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/match/:matchId/feedback - Submit rating and feedback
app.post('/api/match/:matchId/feedback', authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { rating, feedback, isVolunteer } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be 1–5' });
    }

    const matchRef = db.collection('matches').doc(matchId);
    const updates = {};

    if (isVolunteer) {
      updates.volunteerRating = rating;
      updates.volunteerFeedback = feedback || '';
      updates.volunteerFeedbackAt = new Date().toISOString();
    } else {
      updates.coordinatorRating = rating;
      updates.coordinatorFeedback = feedback || '';
      updates.coordinatorFeedbackAt = new Date().toISOString();
    }

    await matchRef.update(updates);

    // Check if both rated
    const matchDoc = await matchRef.get();
    const matchData = matchDoc.data();

    if (matchData.volunteerRating && matchData.coordinatorRating) {
      const avg = (matchData.volunteerRating + matchData.coordinatorRating) / 2;
      await matchRef.update({
        status: avg >= 4 ? 'successful' : 'unsuccessful',
        finalAvgRating: avg,
      });

      // Update volunteer's average rating
      const volRef = db.collection('volunteers').doc(matchData.volunteerId);
      const volDoc = await volRef.get();
      const volData = volDoc.data();

      // Recalculate rolling average rating
      const completedTasks = volData.completedTasks || 1;
      const currentRating = volData.rating || 0;
      const newRating = ((currentRating * (completedTasks - 1)) + matchData.coordinatorRating) / completedTasks;

      await volRef.update({ rating: Math.round(newRating * 10) / 10 });
    }

    res.json({ success: true, message: 'Feedback recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/notifications - Get notifications for current volunteer
app.get('/api/notifications', authenticate, requireRole('volunteer'), async (req, res) => {
  try {
    const snapshot = await db
      .collection('notifications')
      .where('volunteerId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();

    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
app.put('/api/notifications/:id/read', authenticate, async (req, res) => {
  try {
    await db.collection('notifications').doc(req.params.id).update({
      isRead: true,
      readAt: new Date().toISOString(),
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/analytics - Dashboard analytics
app.get('/api/analytics', authenticate, requireRole('coordinator', 'admin'), async (req, res) => {
  try {
    const [needsSnap, matchesSnap, volunteersSnap] = await Promise.all([
      db.collection('needs').get(),
      db.collection('matches').get(),
      db.collection('volunteers').get(),
    ]);

    const needs = needsSnap.docs.map(d => d.data());
    const matches = matchesSnap.docs.map(d => d.data());
    const volunteers = volunteersSnap.docs.map(d => d.data());

    // Aggregate stats
    const totalNeeds = needs.length;
    const openNeeds = needs.filter(n => n.status === 'open').length;
    const completedNeeds = needs.filter(n => n.status === 'completed').length;

    const totalMatches = matches.length;
    const successfulMatches = matches.filter(m => m.status === 'successful').length;
    const avgScore = matches.length
      ? matches.reduce((a, m) => a + (m.score || 0), 0) / matches.length
      : 0;

    // Category distribution
    const categoryDist = {};
    needs.forEach(n => {
      categoryDist[n.category || 'general'] = (categoryDist[n.category || 'general'] || 0) + 1;
    });

    // Top volunteers by completed tasks
    const topVolunteers = volunteers
      .sort((a, b) => (b.completedTasks || 0) - (a.completedTasks || 0))
      .slice(0, 10)
      .map(v => ({
        name: v.name,
        completedTasks: v.completedTasks || 0,
        rating: v.rating || 0,
        responseRate: v.responseRate || 0,
      }));

    // Monthly trend (last 6 months)
    const now = new Date();
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (5 - i));
      const monthStr = d.toISOString().slice(0, 7);
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        needs: needs.filter(n => n.createdAt?.startsWith(monthStr)).length,
        completions: needs.filter(n => n.completedAt?.startsWith(monthStr)).length,
      };
    });

    res.json({
      overview: {
        totalNeeds,
        openNeeds,
        completedNeeds,
        completionRate: totalNeeds ? Math.round((completedNeeds / totalNeeds) * 100) : 0,
        totalVolunteers: volunteers.length,
        totalMatches,
        successfulMatches,
        successRate: totalMatches ? Math.round((successfulMatches / totalMatches) * 100) : 0,
        avgMatchScore: Math.round(avgScore * 10) / 10,
      },
      categoryDistribution: categoryDist,
      topVolunteers,
      monthlyTrend,
      skillDemand: getSkillDemand(needs),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getSkillDemand(needs) {
  const skillCount = {};
  needs.forEach(n => {
    (n.requiredSkills || []).forEach(s => {
      skillCount[s] = (skillCount[s] || 0) + 1;
    });
  });
  return Object.entries(skillCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));
}

// GET /api/analytics/export - Export data as CSV
app.get('/api/analytics/export', authenticate, requireRole('coordinator', 'admin'), async (req, res) => {
  try {
    const matchesSnap = await db.collection('matches').get();
    const matches = matchesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const headers = ['matchId', 'needId', 'volunteerId', 'score', 'skillFit', 'availability', 'location', 'interest', 'status', 'createdAt', 'completedAt'];
    const rows = matches.map(m => [
      m.id, m.needId, m.volunteerId, m.score,
      m.scoreBreakdown?.skillFit, m.scoreBreakdown?.availability,
      m.scoreBreakdown?.location, m.scoreBreakdown?.interest,
      m.status, m.createdAt, m.completedAt || '',
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=volunteermatch-export.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/leaderboard - Top volunteers
app.get('/api/leaderboard', authenticate, async (req, res) => {
  try {
    const snapshot = await db
      .collection('volunteers')
      .orderBy('completedTasks', 'desc')
      .limit(20)
      .get();

    const leaderboard = snapshot.docs.map((doc, idx) => {
      const d = doc.data();
      return {
        rank: idx + 1,
        volunteerId: doc.id,
        name: d.name,
        completedTasks: d.completedTasks || 0,
        rating: d.rating || 0,
        responseRate: d.responseRate || 0,
        skills: d.skills || [],
        badge: idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '⭐',
      };
    });

    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   VolunteerMatch AI Backend               ║
  ║   Server running on port ${PORT}             ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}            ║
  ╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;
