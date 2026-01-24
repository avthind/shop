import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/firestore';
import { validateEmail } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, orderId } = body;

    // Validate inputs
    if (!email || !orderId) {
      return NextResponse.json(
        { error: 'Email and order ID are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Fetch order
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify email matches (case-insensitive)
    if (order.customerEmail?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email does not match this order' },
        { status: 403 }
      );
    }

    // Return order details (excluding sensitive info if needed)
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error in order tracking API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
