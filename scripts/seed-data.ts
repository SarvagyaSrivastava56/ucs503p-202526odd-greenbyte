/**
 * Seed script to populate Firestore with test data
 * Run with: npx tsx scripts/seed-data.ts
 * 
 * Requires:
 * npm install -D tsx
 */

import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize Firebase Admin
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require('../service-account.json'); // Or path to your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Seed data
const societies = [
  {
    id: 'society-1',
    name: 'Music Society',
    description: 'Campus music and concert organization promoting live performances and music appreciation.',
    logoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    admins: [],
  },
  {
    id: 'society-2',
    name: 'Tech Innovators',
    description: 'Technology and innovation society fostering hackathons, workshops, and tech talks.',
    logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop',
    admins: [],
  },
  {
    id: 'society-3',
    name: 'Art Collective',
    description: 'Creative arts society showcasing student artwork and organizing exhibitions.',
    logoUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop',
    admins: [],
  },
  {
    id: 'society-4',
    name: 'Athletics Department',
    description: 'Organizing sports events, intramural competitions, and fitness activities.',
    logoUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop',
    admins: [],
  },
  {
    id: 'society-5',
    name: 'Career Services',
    description: 'Connecting students with career opportunities, internships, and professional development.',
    logoUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop',
    admins: [],
  },
];

const events = [
  {
    id: 'event-1',
    title: 'Starlight Concert Series',
    description: 'Join us for an evening of live music under the stars. Featuring local bands and artists from our campus. Bring your friends and a blanket for a memorable night of tunes and good vibes. Food trucks will be available on site.',
    bannerUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200&h=800&fit=crop',
    societyId: 'society-1',
    category: 'Music',
    tags: ['music', 'outdoor', 'social'],
    venue: 'Main Quad',
    isOnline: false,
    capacity: 200,
    isPaid: false,
    status: 'published',
    startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin',
    counters: { rsvpCount: 128, views: 450, checkIns: 0 },
  },
  // Add 19 more events...
  {
    id: 'event-2',
    title: 'Codefest 2024 Hackathon',
    description: 'A 24-hour hackathon to build innovative projects. Prizes, food, and fun guaranteed. All skill levels welcome. Mentors from top tech companies will be present to guide you.',
    bannerUrl: 'https://images.unsplash.com/photo-1542744095-291d1f67b221?w=1200&h=800&fit=crop',
    societyId: 'society-2',
    category: 'Tech',
    tags: ['hackathon', 'coding', 'tech'],
    venue: 'Engineering Building, Room 301',
    isOnline: false,
    capacity: 100,
    isPaid: false,
    status: 'published',
    startAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'admin',
    counters: { rsvpCount: 76, views: 320, checkIns: 0 },
  },
  // ... Add more events (total 20)
];

async function seedData() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed societies
    console.log('📚 Seeding societies...');
    for (const society of societies) {
      await db.collection('societies').doc(society.id).set({
        ...society,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`  ✅ Created society: ${society.name}`);
    }

    // Seed events
    console.log('\n🎉 Seeding events...');
    for (const event of events) {
      await db.collection('events').doc(event.id).set({
        ...event,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`  ✅ Created event: ${event.title}`);
    }

    console.log('\n✨ Seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`  - ${societies.length} societies created`);
    console.log(`  - ${events.length} events created`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedData();

