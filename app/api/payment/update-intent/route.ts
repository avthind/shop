import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, metadata } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Update the payment intent with metadata
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      metadata,
    });

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error updating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update payment intent' },
      { status: 500 }
    );
  }
}
