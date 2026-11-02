import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  // Production (Railway): pass service account JSON as env var
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    // Local dev: read from file
    const serviceAccount = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'serviceAccountKey.json'), 'utf8')
    );
    initializeApp({ credential: cert(serviceAccount) });
  }
}

const db = getFirestore();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

// ─── Helper: write an in-app notification for an NGO user ──────────────────
async function notifyNGO(ngoUserId: string, title: string, body: string, meta: Record<string, any> = {}) {
  await db.collection('notifications').add({
    ngoUserId,
    title,
    body,
    meta,
    read: false,
    createdAt: FieldValue.serverTimestamp()
  });
}

// ─── Helper: find NGO user by orgName ─────────────────────────────────────
async function findNGOUserByOrgName(orgName: string): Promise<string | null> {
  const snap = await db.collection('users')
    .where('role', '==', 'ngo')
    .where('orgName', '==', orgName)
    .limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].id;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  app.use(express.json());

  // ─── CORS — allow the Vercel frontend ────────────────────────────────────
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ];
  app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    } else {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // ─── Public: Firebase config ──────────────────────────────────────────────
  app.get('/api/firebase-config', (req, res) => {
    try {
      // Production: use env var
      if (process.env.FIREBASE_CLIENT_CONFIG_JSON) {
        return res.json(JSON.parse(process.env.FIREBASE_CLIENT_CONFIG_JSON));
      }
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        res.json(JSON.parse(fs.readFileSync(configPath, 'utf8')));
      } else {
        res.status(404).json({ error: 'Config not found' });
      }
    } catch {
      res.status(500).json({ error: 'Failed to load config' });
    }
  });

  // ─── Public: Razorpay key_id ──────────────────────────────────────────────
  app.get('/api/config', (_req, res) => {
    res.json({ razorpayKeyId: process.env.RAZORPAY_KEY_ID || '' });
  });

  // ─── Middleware: verify Firebase Auth token ────────────────────────────────
  const authenticate = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      req.user = await getAuth().verifyIdToken(authHeader.split('Bearer ')[1]);
      next();
    } catch {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  // ─── Middleware: require admin ─────────────────────────────────────────────
  const requireAdmin = async (req: any, res: any, next: any) => {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden — admin only' });
    }
    next();
  };

  // ════════════════════════════════════════════════════════════════════════════
  // DONATIONS
  // ════════════════════════════════════════════════════════════════════════════

  app.post('/api/donations', authenticate, async (req: any, res: any) => {
    try {
      const donationData = {
        ...req.body,
        userId: req.user.uid,
        createdAt: FieldValue.serverTimestamp(),
        status: 'Pending'
      };
      const docRef = await db.collection('donations').add(donationData);

      // Notify NGO if name is provided
      if (req.body.ngoName) {
        const ngoUserId = await findNGOUserByOrgName(req.body.ngoName);
        if (ngoUserId) {
          await notifyNGO(
            ngoUserId,
            '📦 New Physical Donation Offer',
            `A donor offered ${req.body.qty} × ${req.body.item}. Check incoming offers to accept or decline.`,
            { donationId: docRef.id, type: 'physical', item: req.body.item, qty: req.body.qty }
          );
        }
      }

      res.json({ success: true, id: docRef.id });
    } catch (error) {
      console.error('Error saving donation:', error);
      res.status(500).json({ error: 'Failed to save donation' });
    }
  });

  app.post('/api/volunteers', authenticate, async (req: any, res: any) => {
    try {
      const volunteerData = {
        ...req.body,
        userId: req.user.uid,
        createdAt: FieldValue.serverTimestamp(),
        status: 'Matched'
      };
      const docRef = await db.collection('volunteer_engagements').add(volunteerData);

      // Notify NGO
      if (req.body.ngoName) {
        const ngoUserId = await findNGOUserByOrgName(req.body.ngoName);
        if (ngoUserId) {
          await notifyNGO(
            ngoUserId,
            '🙋 New Volunteer Interest',
            `Someone wants to volunteer for "${req.body.role}". Check your dashboard.`,
            { engagementId: docRef.id, role: req.body.role }
          );
        }
      }

      res.json({ success: true, id: docRef.id });
    } catch (error) {
      console.error('Error saving volunteer engagement:', error);
      res.status(500).json({ error: 'Failed to save volunteer' });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // RAZORPAY
  // ════════════════════════════════════════════════════════════════════════════

  app.post('/api/create-order', authenticate, async (req: any, res: any) => {
    try {
      const { amount, cause } = req.body;
      if (!amount || amount < 1) return res.status(400).json({ error: 'Invalid amount' });
      const order = await razorpay.orders.create({
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: { cause }
      });
      res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (error) {
      console.error('Razorpay create order error:', error);
      res.status(500).json({ error: 'Failed to create payment order' });
    }
  });

  app.post('/api/verify-payment', authenticate, async (req: any, res: any) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, cause } = req.body;
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSig = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(body)
        .digest('hex');
      if (expectedSig !== razorpay_signature) {
        return res.status(400).json({ error: 'Payment verification failed' });
      }
      await db.collection('donations').add({
        type: 'monetary',
        userId: req.user.uid,
        amount: Number(amount) / 100,
        cause,
        razorpay_order_id,
        razorpay_payment_id,
        status: 'Paid',
        createdAt: FieldValue.serverTimestamp()
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ error: 'Payment verification failed' });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // PROFILE — DONOR STATS & ACTIVITY
  // ════════════════════════════════════════════════════════════════════════════

  app.get('/api/profile/stats', authenticate, async (req: any, res: any) => {
    try {
      const uid = req.user.uid;
      const donationsSnap = await db.collection('donations').where('userId', '==', uid).get();
      const volunteersSnap = await db.collection('volunteer_engagements').where('userId', '==', uid).get();

      const donations = donationsSnap.docs.map(d => d.data());
      const totalDonated = donations
        .filter(d => d.type === 'monetary' && d.status === 'Paid')
        .reduce((sum, d) => sum + (d.amount || 0), 0);
      const ngosSet = new Set(donations.map(d => d.ngoName || d.cause).filter(Boolean));
      const volunteerCount = volunteersSnap.size;

      res.json({
        totalDonated,
        ngosSupported: ngosSet.size,
        volunteerEngagements: volunteerCount,
      });
    } catch (error) {
      console.error('Error fetching profile stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  app.get('/api/profile/activity', authenticate, async (req: any, res: any) => {
    try {
      const uid = req.user.uid;
      const donationsSnap = await db.collection('donations')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(10).get();
      const volunteersSnap = await db.collection('volunteer_engagements')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(5).get();

      const items: any[] = [];

      donationsSnap.docs.forEach(d => {
        const data = d.data();
        if (data.type === 'monetary') {
          items.push({
            id: d.id,
            title: `₹${Number(data.amount || 0).toLocaleString('en-IN')} Donated`,
            desc: `${data.cause || 'General'} campaign`,
            status: data.status || 'Paid',
            type: 'monetary',
            date: data.createdAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) || 'Recently',
            paymentId: data.razorpay_payment_id,
          });
        } else if (data.type === 'physical') {
          items.push({
            id: d.id,
            title: `${data.qty} ${data.item}`,
            desc: `Donated to ${data.ngoName || 'NGO'}`,
            status: data.status || 'Pending',
            type: 'physical',
            date: data.createdAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) || 'Recently',
          });
        }
      });

      volunteersSnap.docs.forEach(d => {
        const data = d.data();
        items.push({
          id: d.id,
          title: `Volunteered: ${data.role || 'General support'}`,
          desc: `${data.ngoName || 'NGO'}`,
          status: data.status || 'Matched',
          type: 'volunteer',
          date: data.createdAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) || 'Recently',
        });
      });

      // Sort by most recent (approximate, since we already ordered by createdAt)
      res.json({ activity: items });
    } catch (error) {
      console.error('Error fetching activity:', error);
      res.status(500).json({ error: 'Failed to fetch activity' });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // NGO DASHBOARD
  // ════════════════════════════════════════════════════════════════════════════

  app.get('/api/ngo/dashboard', authenticate, async (req: any, res: any) => {
    try {
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const userData = userDoc.data();
      const orgName = userData?.orgName || userData?.name || '';

      // Funds received (monetary donations mentioning this NGO's cause match)
      const donationsSnap = await db.collection('donations')
        .where('ngoName', '==', orgName).get();
      const allDonations = donationsSnap.docs.map(d => d.data());

      const fundsReceived = allDonations
        .filter(d => d.type === 'monetary' && d.status === 'Paid')
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      const physicalOffers = allDonations.filter(d => d.type === 'physical');
      const pendingOffers = physicalOffers.filter(d => d.status === 'Pending');

      // Volunteer engagements
      const volSnap = await db.collection('volunteer_engagements')
        .where('ngoName', '==', orgName).get();

      // Active needs
      const needsSnap = await db.collection('ngo_needs')
        .where('ngoUserId', '==', req.user.uid).get();

      res.json({
        fundsReceived,
        pendingOfferCount: pendingOffers.length,
        resourcesMatched: physicalOffers.length,
        volunteersEngaged: volSnap.size,
        activeCampaigns: needsSnap.size,
      });
    } catch (error) {
      console.error('Error fetching NGO dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
  });

  app.get('/api/ngo/incoming', authenticate, async (req: any, res: any) => {
    try {
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const orgName = userDoc.data()?.orgName || userDoc.data()?.name || '';

      const snap = await db.collection('donations')
        .where('ngoName', '==', orgName)
        .where('status', '==', 'Pending')
        .orderBy('createdAt', 'desc').get();

      const offers = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toLocaleDateString('en-IN') || 'Recently'
      }));

      res.json({ offers });
    } catch (error) {
      console.error('Error fetching incoming donations:', error);
      res.status(500).json({ error: 'Failed to fetch incoming donations' });
    }
  });

  app.patch('/api/ngo/incoming/:id/accept', authenticate, async (req: any, res: any) => {
    try {
      await db.collection('donations').doc(req.params.id).update({ status: 'Accepted' });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to accept offer' });
    }
  });

  app.patch('/api/ngo/incoming/:id/decline', authenticate, async (req: any, res: any) => {
    try {
      await db.collection('donations').doc(req.params.id).update({ status: 'Declined' });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to decline offer' });
    }
  });

  // POST /api/ngo/needs — NGO posts a resource need
  app.post('/api/ngo/needs', authenticate, async (req: any, res: any) => {
    try {
      const { item, qty, urgency, description } = req.body;
      if (!item || !qty) return res.status(400).json({ error: 'Item and quantity required' });

      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const userData = userDoc.data();

      await db.collection('ngo_needs').add({
        ngoUserId: req.user.uid,
        orgName: userData?.orgName || userData?.name || '',
        item,
        qty: Number(qty),
        urgency: urgency || 'Medium',
        description: description || '',
        status: 'Open',
        createdAt: FieldValue.serverTimestamp()
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Error posting need:', error);
      res.status(500).json({ error: 'Failed to post need' });
    }
  });

  // POST /api/ngo/volunteer-request — NGO posts a volunteer opportunity
  app.post('/api/ngo/volunteer-request', authenticate, async (req: any, res: any) => {
    try {
      const { role, skills, schedule, description } = req.body;
      if (!role) return res.status(400).json({ error: 'Role is required' });

      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const userData = userDoc.data();

      await db.collection('volunteer_opportunities').add({
        ngoUserId: req.user.uid,
        name: userData?.orgName || userData?.name || '',
        role,
        skills: skills || [],
        schedule: schedule || '',
        description: description || '',
        chips: [role, ...(skills || [])].slice(0, 4),
        score: 80, // default score, AI will adjust in matching
        avail: [],
        cause: userData?.cause || [],
        createdAt: FieldValue.serverTimestamp()
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Error posting volunteer request:', error);
      res.status(500).json({ error: 'Failed to post volunteer request' });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ════════════════════════════════════════════════════════════════════════════

  app.get('/api/notifications', authenticate, async (req: any, res: any) => {
    try {
      const snap = await db.collection('notifications')
        .where('ngoUserId', '==', req.user.uid)
        .orderBy('createdAt', 'desc')
        .limit(20).get();

      const notifs = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toLocaleDateString('en-IN') || 'Recently'
      }));
      res.json({ notifications: notifs, unreadCount: notifs.filter((n: any) => !n.read).length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  app.post('/api/notifications/mark-read', authenticate, async (req: any, res: any) => {
    try {
      const { ids } = req.body; // array of notification IDs
      const batch = db.batch();
      (ids || []).forEach((id: string) => {
        batch.update(db.collection('notifications').doc(id), { read: true });
      });
      await batch.commit();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark as read' });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // BENEFICIARY REQUESTS
  // ════════════════════════════════════════════════════════════════════════════

  app.post('/api/beneficiary/request', authenticate, async (req: any, res: any) => {
    try {
      const { needDescription, category, urgency, preferredNGO, location } = req.body;
      if (!needDescription) return res.status(400).json({ error: 'Need description is required' });

      await db.collection('beneficiary_requests').add({
        userId: req.user.uid,
        needDescription,
        category: category || 'General',
        urgency: urgency || 'Medium',
        preferredNGO: preferredNGO || '',
        location: location || '',
        status: 'Submitted',
        createdAt: FieldValue.serverTimestamp()
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving beneficiary request:', error);
      res.status(500).json({ error: 'Failed to submit request' });
    }
  });

  app.get('/api/beneficiary/requests', authenticate, async (req: any, res: any) => {
    try {
      const snap = await db.collection('beneficiary_requests')
        .where('userId', '==', req.user.uid)
        .orderBy('createdAt', 'desc').get();

      const requests = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) || 'Recently'
      }));
      res.json({ requests });
    } catch (error) {
      console.error('Error fetching beneficiary requests:', error);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // ADMIN
  // ════════════════════════════════════════════════════════════════════════════

  // Get all NGOs pending verification
  app.get('/api/admin/pending-ngos', authenticate, requireAdmin, async (req: any, res: any) => {
    try {
      const snap = await db.collection('users')
        .where('role', '==', 'ngo').get();
      const ngos = snap.docs.map(d => ({
        uid: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toLocaleDateString('en-IN') || 'Unknown'
      }));
      res.json({ ngos });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch NGOs' });
    }
  });

  // Approve or reject an NGO
  app.post('/api/admin/verify-ngo', authenticate, requireAdmin, async (req: any, res: any) => {
    try {
      const { uid, action, reason } = req.body; // action: 'approve' | 'reject'
      if (!uid || !action) return res.status(400).json({ error: 'uid and action required' });

      if (action === 'approve') {
        await db.collection('users').doc(uid).update({
          isVerified: true,
          verificationStatus: 'approved',
        });
      } else if (action === 'reject') {
        await db.collection('users').doc(uid).update({
          isVerified: false,
          verificationStatus: 'rejected',
          verificationRejectedReason: reason || 'Did not meet requirements',
        });
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error verifying NGO:', error);
      res.status(500).json({ error: 'Failed to verify NGO' });
    }
  });

  // Bootstrap: promote yourself to admin (can only be called by an authenticated user)
  // To bootstrap: first call this with a secret header matching ADMIN_BOOTSTRAP_SECRET in .env
  app.post('/api/admin/bootstrap', authenticate, async (req: any, res: any) => {
    const secret = req.headers['x-admin-secret'];
    if (!secret || secret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
      return res.status(403).json({ error: 'Invalid admin secret' });
    }
    try {
      await db.collection('users').doc(req.user.uid).update({ isAdmin: true });
      res.json({ success: true, message: 'You are now an admin.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to set admin' });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // AI MATCHING
  // ════════════════════════════════════════════════════════════════════════════

  app.post('/api/match-ngos', async (req, res) => {
    try {
      const { item, qty, loc, causes } = req.body;

      const ngosSnapshot = await db.collection('ngos').get();
      const ngosData = ngosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Guard against empty DB — prevent hallucination
      if (ngosData.length === 0) {
        return res.json({ matches: [], message: 'No NGOs in database. Please seed the database.' });
      }

      const prompt = `
        You are the Sewa Sankalp Bharat Smart Matching Engine. 
        A donor has offered the following resources:
        - Item: ${item}
        - Quantity: ${qty}
        - Location: ${loc}
        - Preferred Causes: ${causes.join(', ')}

        Here is the list of available NGOs in the database:
        ${JSON.stringify(ngosData, null, 2)}

        Score each NGO on a scale of 0 to 100 based on how well they match the donor's resources.
        Criteria for scoring:
        - Resource compatibility (30%): Does the NGO need this item?
        - Location/Distance (20%): Closer is better.
        - Quantity Match (15%): Does it match their scale?
        - Cause/Interest (35%): Does it match the donor's preferred causes?

        IMPORTANT: Only return NGOs from the provided list above. Do NOT invent or hallucinate NGO names.
        Return the top 3 best matching NGOs as an array.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                score: { type: Type.NUMBER, description: 'Match score out of 100 (e.g. 94)' },
                role: { type: Type.STRING, description: "What the NGO needs/does (e.g. 'Children\\'s clothing & essentials')" },
                dist: { type: Type.STRING, description: "Distance (e.g. '3 km')" }
              },
              required: ['name', 'score', 'role', 'dist']
            }
          }
        }
      });

      const matches = JSON.parse(response.text || '[]');
      res.json({ matches });
    } catch (error) {
      console.error('Error generating matches:', error);
      res.status(500).json({ error: 'Failed to generate matches' });
    }
  });

  app.post('/api/match-volunteers', async (req, res) => {
    try {
      const { skills, loc, avail, causes } = req.body;

      const volunteerSnapshot = await db.collection('volunteer_opportunities').get();
      const volunteerData = volunteerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Guard against empty DB — prevent hallucination
      if (volunteerData.length === 0) {
        return res.json({ matches: [], message: 'No volunteer opportunities in database. Please seed the database.' });
      }

      const prompt = `
        You are the Sewa Sankalp Bharat Smart Matching Engine for Volunteers. 
        A volunteer has offered:
        - Skills: ${skills.join(', ')}
        - Availability: ${avail.join(', ')}
        - Location: ${loc}
        - Preferred Causes: ${causes.join(', ')}

        Here is the list of available volunteer opportunities:
        ${JSON.stringify(volunteerData, null, 2)}

        Score each opportunity on a scale of 0 to 100 based on how well it matches the volunteer's profile.
        Criteria: Skills (40%), Availability (30%), Distance (20%), Cause (10%).

        IMPORTANT: Only return opportunities from the provided list above. Do NOT invent or hallucinate NGO names.
        Return the top 3 best matching opportunities as an array.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                score: { type: Type.NUMBER },
                role: { type: Type.STRING },
                chips: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['name', 'score', 'role', 'chips']
            }
          }
        }
      });

      res.json({ matches: JSON.parse(response.text || '[]') });
    } catch (error) {
      console.error('Error generating volunteer matches:', error);
      res.status(500).json({ error: 'Failed to generate matches' });
    }
  });

  // ─── Vite dev server / static production ──────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
