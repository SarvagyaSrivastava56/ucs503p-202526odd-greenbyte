#!/usr/bin/env node

/**
 * Google OAuth Setup Script
 * This script helps you configure Google Calendar integration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Google Calendar OAuth Setup\n');

console.log('📋 Setup Steps:');
console.log('1. Go to https://console.cloud.google.com/');
console.log('2. Create a new project or select existing one');
console.log('3. Enable Google Calendar API');
console.log('4. Create OAuth 2.0 credentials');
console.log('5. Configure OAuth consent screen');
console.log('6. Add redirect URI: http://localhost:3000/api/auth/google/callback\n');

rl.question('Enter your Google Client ID: ', (clientId) => {
  rl.question('Enter your Google Client Secret: ', (clientSecret) => {
    
    const envContent = `# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=${clientId}
GOOGLE_CLIENT_SECRET=${clientSecret}

# Firebase Configuration (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCPACZkQcMW9PxX5mkXm-wsYBlukOMAPIk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-827010330-91b76.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-827010330-91b76
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-827010330-91b76.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=271282670485
NEXT_PUBLIC_FIREBASE_APP_ID=1:271282670485:web:49c4913d9655adfa55c49c
`;

    try {
      fs.writeFileSync('.env.local', envContent);
      console.log('\n✅ Environment variables saved to .env.local');
      console.log('🚀 Restart your development server to apply changes');
      console.log('\n📖 For detailed setup instructions, see GOOGLE_OAUTH_SETUP.md');
    } catch (error) {
      console.error('❌ Error saving environment variables:', error.message);
    }
    
    rl.close();
  });
});

rl.on('close', () => {
  console.log('\n🎉 Setup complete! Your Google Calendar integration is ready.');
});
