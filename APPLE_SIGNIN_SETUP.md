# Apple Sign-In Setup Guide

This guide will help you enable Sign in with Apple in your Firebase project.

## Prerequisites

1. **Apple Developer Account** (required)
   - You need a paid Apple Developer account ($99/year)
   - Sign up at: https://developer.apple.com/programs/

2. **Firebase Project** (already set up)
   - Project: `shop-c1558`

## Step 1: Enable Apple Sign-In in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `shop-c1558`
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Apple** provider
5. Click **Enable**
6. **Note**: You'll need to complete Apple Developer setup first (see Step 2)

## Step 2: Configure Apple Developer Account

### 2.1 Create App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** (Add)
4. Select **App IDs** → **Continue**
5. Select **App** → **Continue**
6. Fill in:
   - **Description**: Shop App (or your app name)
   - **Bundle ID**: `com.inxvinx.shop` (or your preferred bundle ID)
7. Enable **Sign In with Apple** capability
8. Click **Continue** → **Register**

### 2.2 Create Service ID

1. In Apple Developer Portal, go to **Identifiers**
2. Click **+** → Select **Services IDs** → **Continue**
3. Fill in:
   - **Description**: Shop Web Service
   - **Identifier**: `com.inxvinx.shop.web` (or your preferred service ID)
4. Click **Continue** → **Register**
5. Click on the newly created Service ID
6. Check **Sign In with Apple**
7. Click **Configure**
8. Add your domain:
   - **Primary App ID**: Select the App ID you created
   - **Website URLs**:
     - **Domains and Subdomains**: `yourdomain.com` (or `localhost` for development)
     - **Return URLs**: 
       - Development: `http://localhost:3000`
       - Production: `https://yourdomain.com`
9. Click **Save** → **Continue** → **Save**

### 2.3 Create Key

1. In Apple Developer Portal, go to **Keys**
2. Click **+** (Create a key)
3. Fill in:
   - **Key Name**: Shop Sign In Key
4. Enable **Sign In with Apple**
5. Click **Configure** → Select your Primary App ID → **Save**
6. Click **Continue** → **Register**
7. **IMPORTANT**: Download the key file (`.p8` file) - you can only download it once!
8. Note the **Key ID** shown on the page

## Step 3: Complete Firebase Configuration

1. Go back to Firebase Console → **Authentication** → **Sign-in method** → **Apple**
2. Fill in:
   - **Services ID**: The Service ID you created (e.g., `com.inxvinx.shop.web`)
   - **Apple Team ID**: Found in Apple Developer Portal (top right corner)
   - **Key ID**: The Key ID from Step 2.3
   - **Private Key**: Upload the `.p8` key file you downloaded
3. Click **Save**

## Step 4: Test Apple Sign-In

1. Make sure your app is running: `npm run dev`
2. Go to http://localhost:3000/login
3. Click "continue with apple"
4. You should see the Apple Sign-In popup

## Troubleshooting

### Issue: "Sign in with Apple is not available"
- **Solution**: Make sure you have a paid Apple Developer account

### Issue: "Invalid client" error
- **Solution**: Verify your Service ID and Return URLs match exactly in Apple Developer Portal

### Issue: Works on localhost but not production
- **Solution**: Add your production domain to the Service ID configuration in Apple Developer Portal

### Issue: Key file missing
- **Solution**: You need to create a new key if you lost the `.p8` file (old key must be revoked first)

## Important Notes

⚠️ **Apple Sign-In Requirements:**
- Requires paid Apple Developer account ($99/year)
- Must configure domains in Apple Developer Portal
- Production domains must be verified
- Works on Safari, Chrome, and other browsers
- Users need an Apple ID to sign in

✅ **Once configured:**
- Apple Sign-In will work automatically in your app
- No code changes needed (already implemented)
- Users can sign in with their Apple ID

## Additional Resources

- [Firebase Apple Sign-In Docs](https://firebase.google.com/docs/auth/web/apple)
- [Apple Sign In with Apple Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Apple Developer Portal](https://developer.apple.com/account/)
