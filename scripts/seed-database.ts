import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const serviceAccount = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'serviceAccountKey.json'), 'utf8'));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

const NGO_DATABASE = [
  { name:'Asha Foundation', cause:['Child welfare','Education'], dist:'3 km', role:'Children\'s clothing & essentials' },
  { name:'Bal Kalyan Trust', cause:['Child welfare'], dist:'7 km', role:'Children\'s clothing & nutrition' },
  { name:'Vidya Daan Foundation', cause:['Education'], dist:'4 km', role:'Books, stationery & clothes' },
  { name:'Shiksha Sewa Society', cause:['Education'], dist:'12 km', role:'Educational materials' },
  { name:'Swasthya Seva Trust', cause:['Healthcare'], dist:'5 km', role:'Medical supplies & equipment' },
  { name:'Mahila Shakti Kendra', cause:['Women'], dist:'6 km', role:'Women\'s clothing & materials' },
  { name:'Annapurna Foundation', cause:['Food'], dist:'2 km', role:'Food supplies & nutrition' },
];

const VOLUNTEER_NGOS = [
  { name:'Vidya Daan Foundation', score:94, role:'Teaching children · Sunday mornings · 4 km away', chips:['Education','Teaching','Sunday','4 km'], skills:['Teaching'], avail:['Sunday','Saturdays'], cause:['Education'] },
  { name:'Asha Shiksha Trust', score:87, role:'After-school tutoring · Weekends · 7 km away', chips:['Education','Tutoring','Weekend','7 km'], skills:['Teaching','Counselling'], avail:['Saturday','Sunday'], cause:['Education'] },
  { name:'Navjyoti Community Centre', score:74, role:'Adult literacy · Saturday afternoons · 9 km away', chips:['Literacy','Teaching','Saturday','9 km'], skills:['Teaching'], avail:['Saturdays'], cause:['Education'] },
  { name:'Swasthya Seva Camp', score:91, role:'Health check camps · Weekends · 5 km away', chips:['Healthcare','Medical','Weekend','5 km'], skills:['Medical'], avail:['Saturday','Sunday'], cause:['Healthcare'] },
  { name:'Samvedna Counselling', score:83, role:'Mental wellness sessions · Evenings · 3 km', chips:['Healthcare','Counselling','Evenings','3 km'], skills:['Counselling','Medical'], avail:['Evenings'], cause:['Healthcare'] },
  { name:'Mahila Tech Hub', score:78, role:'Digital literacy for women · Weekdays · 6 km', chips:['Women','Coding','Weekdays','6 km'], skills:['Coding','Design'], avail:['Weekdays'], cause:['Women'] },
  { name:'Green Kanpur Initiative', score:72, role:'Tree plantation drives · Sundays · 8 km', chips:['Environment','Sunday','8 km'], skills:['Teaching','Design'], avail:['Sundays'], cause:['Environment'] },
];

async function seed() {
  console.log('Seeding NGOs...');
  const ngosCollection = db.collection('ngos');
  for (const ngo of NGO_DATABASE) {
    await ngosCollection.add(ngo);
  }
  console.log('Seeding Volunteer Opportunities...');
  const volunteerCollection = db.collection('volunteer_opportunities');
  for (const opp of VOLUNTEER_NGOS) {
    await volunteerCollection.add(opp);
  }
  console.log('Database seeded successfully!');
}

seed().catch(console.error);
