# Payment Processing Setup Guide

This guide will help you set up Stripe payment processing for your e-commerce shop.

## Overview

Your shop uses **Stripe** for payment processing, which supports:
- Credit/Debit card payments
- Worldwide payments from 195+ countries
- 135+ currencies
- 40+ payment methods (cards, digital wallets, bank transfers, etc.)

Stripe provides excellent worldwide coverage. See the [Worldwide Payment Support](#worldwide-payment-support) section for details.

---

## Recommended Workflow

### Should You Deploy to Vercel First?

**Short Answer**: You can do either, but here's the recommended approach:

**Option 1: Local Development First (Recommended for Learning)**
1. ✅ Integrate Stripe API locally using **test mode**
2. ✅ Test payment flow locally (payment intents work without webhooks)
3. ✅ Use Stripe CLI for local webhook testing
4. ✅ Deploy to Vercel with test mode
5. ✅ Test on Vercel with test mode
6. ✅ Switch to live mode after thorough testing

**Option 2: Deploy First (Recommended for Production)**
1. ✅ Deploy basic app to Vercel first
2. ✅ Integrate Stripe API with test mode on Vercel
3. ✅ Configure webhooks on Vercel (needs public URL)
4. ✅ Test everything on Vercel with test mode
5. ✅ Switch to live mode

**Why Deploy Before Webhooks?**
- Webhooks require a **publicly accessible URL**
- Localhost won't work for webhooks (unless using Stripe CLI or ngrok)
- Vercel provides HTTPS automatically (required for webhooks)
- Easier to test the full flow end-to-end

**Best Practice**: 
1. **Develop locally** with Stripe test mode (payment intents work fine)
2. **Deploy to Vercel** when ready to test webhooks
3. **Test thoroughly** on Vercel with test mode
4. **Go live** only after everything works perfectly

---

## Stripe Setup

### Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Sign up" to create a new account
3. Complete the account setup process
4. Verify your email address

### Step 2: Get Your API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)
   - **Secret key** (starts with `sk_test_` for test mode or `sk_live_` for live mode)

### Step 3: Set Up Webhooks

**Important**: Webhooks require a publicly accessible HTTPS URL. You have two options:

#### Option A: Deploy to Vercel First (Recommended)

1. Deploy your app to Vercel (see deployment section below)
2. In Stripe Dashboard, go to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Enter your webhook URL:
   - **Vercel Preview/Production**: `https://your-app.vercel.app/api/payment/webhook`
5. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
6. Copy the **Signing secret** (starts with `whsec_`)

#### Option B: Test Locally with Stripe CLI

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe` (Mac) or see [Stripe CLI docs](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/payment/webhook`
4. Copy the webhook signing secret from the CLI output (starts with `whsec_`)
5. Use this secret in your `.env.local` for local testing

**Note**: Payment intents will work without webhooks, but order status updates require webhooks. You can test the payment flow locally, then set up webhooks after deploying to Vercel.

### Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Step 5: Test Stripe Integration

1. Use Stripe test cards:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - Use any future expiry date and any 3-digit CVC
2. Test the checkout flow end-to-end
3. Verify webhooks are received (check Stripe Dashboard → Webhooks → Events)

### Step 6: Go Live with Stripe

1. Complete Stripe's activation process:
   - Add business information
   - Verify your identity
   - Add bank account for payouts
2. Switch to live mode in Stripe Dashboard
3. Update your `.env.local` with live keys:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
   STRIPE_SECRET_KEY=sk_live_your_live_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
   ```
4. Update webhook URL to production URL
5. Test with a small real transaction

---

## Deployment to Vercel

### Step 1: Prepare for Deployment

1. Ensure all environment variables are documented in `.env.example`
2. Test your app locally first
3. Commit your code to Git

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (or your project root)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Step 3: Add Environment Variables in Vercel

1. In Vercel project settings, go to **Environment Variables**
2. Add all your environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test mode)
   - `STRIPE_SECRET_KEY` (test mode)
   - `STRIPE_WEBHOOK_SECRET` (from Vercel URL)
   - `RESEND_API_KEY` (if using email)

3. Set environment for each variable:
   - **Production**: Live/production values
   - **Preview**: Test/sandbox values
   - **Development**: Test/sandbox values

### Step 4: Configure Stripe Webhook on Vercel

1. After deployment, copy your Vercel URL: `https://your-app.vercel.app`
2. Go to Stripe Dashboard → **Webhooks**
3. Add endpoint: `https://your-app.vercel.app/api/payment/webhook`
4. Select events and copy the webhook secret
5. Add the webhook secret to Vercel environment variables
6. Redeploy if needed

### Step 5: Test on Vercel

1. Visit your deployed app
2. Test the checkout flow with Stripe test cards
3. Verify webhooks are received (check Stripe Dashboard)
4. Check Vercel function logs for any errors

---

## Testing Stripe Integration

### Local Development Testing

#### Stripe Local Testing

**Without Webhooks (Basic Testing)**:
1. Use Stripe test mode keys in `.env.local`
2. Test payment intents - they work without webhooks
3. Orders will be created, but status won't auto-update via webhooks
4. Good for initial development and UI testing

**With Webhooks (Full Testing)**:
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe` (Mac) or see [Stripe CLI docs](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/payment/webhook`
4. Copy the webhook signing secret from the CLI output
5. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`
6. Use test mode keys in your `.env.local`
7. Test full payment flow including order status updates

**Alternative**: Deploy to Vercel and test webhooks there (easier for full integration testing)

### Production Deployment Checklist

- [ ] Stripe live keys configured
- [ ] Stripe webhook URL updated to production domain
- [ ] Stripe webhook events configured
- [ ] Test payment flow in production
- [ ] Monitor webhook delivery in Stripe Dashboard
- [ ] Set up error alerts/monitoring

---

## Worldwide Payment Support

### Stripe Worldwide Support

**Supported Countries**: Stripe supports payments from **195+ countries and territories** across all major regions.

**Key Features**:
- Accept payments in **135+ currencies**
- Support for **40+ payment methods** (cards, digital wallets, bank transfers, etc.)
- Local payment methods available in many countries (e.g., Alipay, iDEAL, SEPA)
- Automatic currency conversion
- Multi-currency support
- Cross-border payouts available from US, UK, EEA, Canada, and Switzerland

**Regional Coverage**:
- **Africa**: Multiple countries supported with various payment methods
- **Asia Pacific**: Extensive coverage including cards, Alipay, WeChat Pay, GrabPay, PayNow
- **Europe & EU**: Full support including cards, SEPA Direct Debit, iDEAL, Sofort, Bancontact
- **North America**: Complete support (US, Canada) with cards, Apple Pay, Google Pay
- **Latin America & Caribbean**: Cards, OXXO, Boleto, and other local methods

**Payment Methods by Region**:
- **North America**: Credit/debit cards, Apple Pay, Google Pay, ACH Direct Debit
- **Europe**: Cards, SEPA Direct Debit, iDEAL, Sofort, Bancontact, Giropay
- **Asia Pacific**: Cards, Alipay, WeChat Pay, GrabPay, PayNow, FPX
- **Latin America**: Cards, OXXO, Boleto, PIX
- **Middle East & Africa**: Cards, Mada, Fawry, and other regional methods

**Limitations**:
- Payment method availability varies by country
- Some payment methods require additional setup and verification
- Currency conversion fees may apply
- Check Stripe's [payment method support](https://stripe.com/docs/payments/payment-methods) for specific country details

### Why Stripe Alone is Sufficient

**Stripe provides excellent worldwide coverage** for most e-commerce businesses:

1. **Comprehensive Coverage**: 195+ countries with 135+ currencies
2. **Multiple Payment Methods**: Cards, digital wallets, bank transfers, and local payment methods
3. **Global Reach**: Works in all major markets worldwide
4. **Local Payment Methods**: Supports region-specific methods (Alipay, iDEAL, SEPA, etc.)
5. **Reliable Service**: Industry-leading uptime and reliability

**When Stripe Alone Works Best**:
- Most e-commerce stores
- Digital and physical products
- Subscription services
- International businesses
- Businesses targeting card-friendly markets

**Note**: While some businesses add PayPal for additional coverage, Stripe alone is sufficient for the vast majority of use cases and provides excellent worldwide payment support.

---

## Troubleshooting

### Stripe Issues

**Webhook not receiving events**:
- Verify webhook URL is correct
- Check webhook signing secret matches
- Ensure endpoint is publicly accessible (not localhost in production)
- Check Stripe Dashboard → Webhooks → Events for delivery status

**Payment fails**:
- Verify API keys are correct (test vs live)
- Check card details are valid
- Review Stripe Dashboard → Payments for error details
- Check browser console for client-side errors

**Order not created after payment**:
- Check webhook is firing
- Verify Firestore permissions
- Check server logs for errors
- Ensure order creation logic is working

### General Issues

**Environment variables not loading**:
- Restart your development server after adding env vars
- Ensure `.env.local` is in project root
- Check variable names match exactly (case-sensitive)
- For production, set env vars in your hosting platform

**Payment form not loading**:
- Check browser console for errors
- Verify Stripe SDK is installed
- Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set correctly
- Check that payment intent is being created successfully

---

## Security Best Practices

1. **Never commit API keys to version control**
   - Use `.env.local` (already in `.gitignore`)
   - Use environment variables in production hosting

2. **Use HTTPS in production**
   - Required for payment processing
   - Stripe requires secure connections

3. **Validate webhook signatures**
   - The implementation verifies webhook signatures
   - Never skip signature verification

4. **Keep dependencies updated**
   - Regularly update Stripe SDKs
   - Check for security advisories

5. **Monitor for suspicious activity**
   - Set up alerts in Stripe Dashboard
   - Monitor failed payment attempts
   - Review transactions regularly

6. **Use test mode during development**
   - Never use live keys in development
   - Test thoroughly before going live

---

## Additional Resources

### Stripe Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Support](https://support.stripe.com)
- [Stripe Payment Methods](https://stripe.com/docs/payments/payment-methods)

### General Resources
- [PCI Compliance Guide](https://www.pcisecuritystandards.org)
- [Payment Security Best Practices](https://stripe.com/docs/security/guide)

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs and browser console
3. Check Stripe Dashboard for transaction details
4. Consult the official Stripe documentation
5. Contact Stripe support if needed
