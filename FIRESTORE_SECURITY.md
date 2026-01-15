# Firestore Security Rules

This document describes the Firestore security rules implemented for the shop application.

## Security Rules Overview

The security rules ensure that:
1. **All operations require authentication** - Users must be signed in to access any data
2. **Users can only access their own data** - Data isolation per user
3. **Orders are immutable** - Once created, orders cannot be modified or deleted

## Collections and Rules

### Carts (`/carts/{userId}`)
- **Read/Write**: Users can only access their own cart (document ID must match their user ID)
- **Purpose**: Store user shopping cart items

### Wishlists (`/wishlists/{userId}`)
- **Read/Write**: Users can only access their own wishlist (document ID must match their user ID)
- **Purpose**: Store user's favorited products

### Orders (`/orders/{orderId}`)
- **Create**: Users can create orders, but the `userId` field must match their authenticated user ID
- **Read**: Users can only read orders where `userId` matches their authenticated user ID
- **Update/Delete**: Not allowed (orders are immutable after creation)
- **Purpose**: Store completed orders

### Profiles (`/profiles/{userId}`)
- **Read/Write**: Users can only access their own profile (document ID must match their user ID)
- **Purpose**: Store user profile information

## Deployment

### Prerequisites
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init firestore
   ```

### Deploy Rules

Deploy the security rules to Firebase:

```bash
# Deploy rules only
npm run firebase:deploy-rules

# Or using Firebase CLI directly
firebase deploy --only firestore:rules
```

### Verify Deployment

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `shop-c1558`
3. Navigate to **Firestore Database** → **Rules**
4. Verify the rules are deployed correctly

## Testing Rules

You can test the rules in the Firebase Console:
1. Go to **Firestore Database** → **Rules**
2. Click **Rules Playground**
3. Test different scenarios:
   - Authenticated user accessing their own data (should succeed)
   - Authenticated user accessing another user's data (should fail)
   - Unauthenticated user accessing any data (should fail)

## Security Best Practices

✅ **Implemented:**
- Authentication required for all operations
- User data isolation (users can only access their own data)
- Orders are immutable after creation
- Document ID validation (userId must match authenticated user)

⚠️ **Additional Recommendations:**
- Monitor Firestore usage in Firebase Console
- Set up alerts for unusual access patterns
- Regularly review and update rules as your app evolves
- Consider adding rate limiting for production use

## Rule Structure

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() { ... }
    function isOwner(userId) { ... }
    
    // Collection rules
    match /carts/{userId} { ... }
    match /wishlists/{userId} { ... }
    match /orders/{orderId} { ... }
    match /profiles/{userId} { ... }
  }
}
```

## Troubleshooting

**Issue**: Rules deployment fails
- **Solution**: Ensure you're logged in (`firebase login`) and have proper permissions

**Issue**: Users can't access their data
- **Solution**: Verify the document ID matches the user's `uid` from Firebase Auth

**Issue**: Rules not taking effect
- **Solution**: Wait a few seconds after deployment, rules can take up to 1 minute to propagate
