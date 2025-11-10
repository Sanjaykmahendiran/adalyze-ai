#!/usr/bin/env node

/**
 * Quick setup script to create .env.local file
 * Run with: node setup-env.js
 */

const fs = require('fs');
const path = require('path');

const envContent = `# Backend API Configuration
# This URL is only used server-side and won't be exposed to the browser
BACKEND_API_URL=https://adalyzeai.xyz/App/api.php
ANALYZE_API_URL=https://adalyzeai.xyz/App/analyze.php
AB_ANALYZE_API_URL=https://adalyzeai.xyz/App/abanalyze.php
UPLOAD_API_URL=https://adalyzeai.xyz/App/adupl.php
VIDEO_UPLOAD_API_URL=https://adalyzeai.xyz/App/vidadupl.php

# Note: These environment variables are kept secret and only used on the server
# Never use NEXT_PUBLIC_ prefix for sensitive URLs or API keys
`;

const envPath = path.join(process.cwd(), '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('\n⚠️  .env.local already exists!');
  console.log('   If you want to recreate it, delete the existing file first.');
  console.log('   Location:', envPath);
  process.exit(0);
}

// Create .env.local
try {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('\n✅ Successfully created .env.local');
  console.log('   Location:', envPath);
  console.log('\n📝 Contents:');
  console.log('   BACKEND_API_URL=https://adalyzeai.xyz/App/api.php');
  console.log('   ANALYZE_API_URL=https://adalyzeai.xyz/App/analyze.php');
  console.log('\n🚀 Next steps:');
  console.log('   1. Restart your dev server: npm run dev');
  console.log('   2. Test login functionality');
  console.log('   3. Check Network tab to verify it\'s working');
  console.log('\n📚 For more info, read: SETUP_INSTRUCTIONS.md');
} catch (error) {
  console.error('\n❌ Error creating .env.local:', error.message);
  console.log('\n   You can create it manually:');
  console.log('   1. Create a file named ".env.local" in your project root');
  console.log('   2. Add the following lines:');
  console.log('      BACKEND_API_URL=https://adalyzeai.xyz/App/api.php');
  console.log('      ANALYZE_API_URL=https://adalyzeai.xyz/App/analyze.php');
  process.exit(1);
}

