import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const NGO_DATABASE = [
  { name:'Asha Foundation', cause:['Child welfare','Education'], dist:'3 km', role:'Children\'s clothing & essentials' },
  { name:'Bal Kalyan Trust', cause:['Child welfare'], dist:'7 km', role:'Children\'s clothing & nutrition' },
  { name:'Vidya Daan Foundation', cause:['Education'], dist:'4 km', role:'Books, stationery & clothes' },
  { name:'Shiksha Sewa Society', cause:['Education'], dist:'12 km', role:'Educational materials' },
  { name:'Swasthya Seva Trust', cause:['Healthcare'], dist:'5 km', role:'Medical supplies & equipment' },
  { name:'Mahila Shakti Kendra', cause:['Women'], dist:'6 km', role:'Women\'s clothing & materials' },
  { name:'Annapurna Foundation', cause:['Food'], dist:'2 km', role:'Food supplies & nutrition' },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/firebase-config', (req, res) => {
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        res.json(config);
      } else {
        res.status(404).json({ error: 'Config not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to load config' });
    }
  });

  // Middleware to verify Firebase Auth token
  const authenticate = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  app.post('/api/donations', authenticate, async (req: any, res: any) => {
    try {
      const donationData = {
        ...req.body,
        userId: req.user.uid,
        createdAt: FieldValue.serverTimestamp(),
        status: 'Pending'
      };
      const docRef = await db.collection('donations').add(donationData);
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
      res.json({ success: true, id: docRef.id });
    } catch (error) {
      console.error('Error saving volunteer engagement:', error);
      res.status(500).json({ error: 'Failed to save volunteer' });
    }
  });

  app.post('/api/match-ngos', async (req, res) => {
    try {
      const { item, qty, loc, causes } = req.body;
      
      const prompt = `
        You are the Sahayog Smart Matching Engine. 
        A donor has offered the following resources:
        - Item: ${item}
        - Quantity: ${qty}
        - Location: ${loc}
        - Preferred Causes: ${causes.join(', ')}

        Here is the list of available NGOs in the database:
        ${JSON.stringify(NGO_DATABASE, null, 2)}

        Score each NGO on a scale of 0 to 100 based on how well they match the donor's resources.
        Criteria for scoring:
        - Resource compatibility (30%): Does the NGO need this item?
        - Location/Distance (20%): Closer is better.
        - Quantity Match (15%): Does it match their scale?
        - Cause/Interest (35%): Does it match the donor's preferred causes?

        Return the top 3 best matching NGOs as an array. Do not return more than 3.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                score: { type: Type.NUMBER, description: "Match score out of 100 (e.g. 94)" },
                role: { type: Type.STRING, description: "What the NGO needs/does (e.g. 'Children\\'s clothing & essentials')" },
                dist: { type: Type.STRING, description: "Distance (e.g. '3 km')" }
              },
              required: ["name", "score", "role", "dist"]
            }
          }
        }
      });

      const jsonStr = response.text || "[]";
      const matches = JSON.parse(jsonStr);
      res.json({ matches });
    } catch (error) {
      console.error('Error generating matches:', error);
      res.status(500).json({ error: 'Failed to generate matches' });
    }
  });

  app.post('/api/match-volunteers', async (req, res) => {
    try {
      const { skills, loc, avail, causes } = req.body;
      
      const VOLUNTEER_NGOS = [
        { name:'Vidya Daan Foundation', score:94, role:'Teaching children · Sunday mornings · 4 km away', chips:['Education','Teaching','Sunday','4 km'], skills:['Teaching'], avail:['Sunday','Saturdays'], cause:['Education'] },
        { name:'Asha Shiksha Trust', score:87, role:'After-school tutoring · Weekends · 7 km away', chips:['Education','Tutoring','Weekend','7 km'], skills:['Teaching','Counselling'], avail:['Saturday','Sunday'], cause:['Education'] },
        { name:'Navjyoti Community Centre', score:74, role:'Adult literacy · Saturday afternoons · 9 km away', chips:['Literacy','Teaching','Saturday','9 km'], skills:['Teaching'], avail:['Saturdays'], cause:['Education'] },
        { name:'Swasthya Seva Camp', score:91, role:'Health check camps · Weekends · 5 km away', chips:['Healthcare','Medical','Weekend','5 km'], skills:['Medical'], avail:['Saturday','Sunday'], cause:['Healthcare'] },
        { name:'Samvedna Counselling', score:83, role:'Mental wellness sessions · Evenings · 3 km', chips:['Healthcare','Counselling','Evenings','3 km'], skills:['Counselling','Medical'], avail:['Evenings'], cause:['Healthcare'] },
        { name:'Mahila Tech Hub', score:78, role:'Digital literacy for women · Weekdays · 6 km', chips:['Women','Coding','Weekdays','6 km'], skills:['Coding','Design'], avail:['Weekdays'], cause:['Women'] },
        { name:'Green Kanpur Initiative', score:72, role:'Tree plantation drives · Sundays · 8 km', chips:['Environment','Sunday','8 km'], skills:['Teaching','Design'], avail:['Sundays'], cause:['Environment'] },
      ];
      
      const prompt = `
        You are the Sahayog Smart Matching Engine for Volunteers. 
        A volunteer has offered:
        - Skills: ${skills.join(', ')}
        - Availability: ${avail.join(', ')}
        - Location: ${loc}
        - Preferred Causes: ${causes.join(', ')}

        Here is the list of available volunteer opportunities:
        ${JSON.stringify(VOLUNTEER_NGOS, null, 2)}

        Score each opportunity on a scale of 0 to 100 based on how well it matches the volunteer's profile.
        Criteria: Skills (40%), Availability (30%), Distance (20%), Cause (10%).

        Return the top 3 best matching NGOs as an array.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
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
              required: ["name", "score", "role", "chips"]
            }
          }
        }
      });

      const jsonStr = response.text || "[]";
      res.json({ matches: JSON.parse(jsonStr) });
    } catch (error) {
      console.error('Error generating volunteer matches:', error);
      res.status(500).json({ error: 'Failed to generate matches' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
