import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const userId = process.argv[2] || '';

if (!userId) {
  console.error('❌ Error: User ID is required');
  console.log('\nUsage:');
  console.log('  npm run set-admin <USER_ID>');
  console.log('\nTo get your User ID:');
  console.log('  1. Sign up at /signup (or use existing account)');
  console.log('  2. Go to Firebase Console → Authentication → find your user');
  console.log('  3. Copy the User ID (UID)');
  console.log('\nOr use Firebase Console (see ADMIN_SETUP.md for details)');
  process.exit(1);
}

async function setAdmin() {
  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error('Missing Firebase environment variables. Check .env.local');
    }

    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    const db = getFirestore(app);
    const profileRef = doc(db, 'profiles', userId);

    await setDoc(profileRef, {
      isAdmin: true,
    }, { merge: true });

    console.log('✅ Admin status set successfully!');
    console.log(`   User ID: ${userId}`);
    console.log('\nNext steps:');
    console.log('  1. Log out and log back in to refresh your session');
    console.log('  2. You should see an "admin" link in the header');
    console.log('  3. Visit /admin to access the admin dashboard');
  } catch (error) {
    console.error('❌ Error setting admin status:', error);
    console.log('\n💡 Alternative: Use Firebase Console (see ADMIN_SETUP.md)');
    process.exit(1);
  }
}

setAdmin();
