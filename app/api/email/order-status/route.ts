import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Order } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order, customerEmail, customerName, oldStatus } = body as {
      order: Order;
      customerEmail: string;
      customerName: string;
      oldStatus?: string;
    };

    if (!order || !customerEmail) {
      return NextResponse.json(
        { error: 'Order and customer email are required' },
        { status: 400 }
      );
    }

    const statusMessages: Record<string, { subject: string; message: string }> = {
      processing: {
        subject: 'Your Order is Being Processed',
        message: 'We\'ve received your order and are preparing it for shipment.',
      },
      shipped: {
        subject: 'Your Order Has Shipped!',
        message: 'Great news! Your order has been shipped and is on its way to you.',
      },
      completed: {
        subject: 'Your Order Has Been Delivered',
        message: 'Your order has been completed. Thank you for your purchase!',
      },
      cancelled: {
        subject: 'Order Cancellation',
        message: 'Your order has been cancelled. If you have any questions, please contact us.',
      },
    };

    const statusInfo = statusMessages[order.status] || {
      subject: 'Order Status Update',
      message: `Your order status has been updated to ${order.status}.`,
    };

    // Send status update email
    const { data, error } = await resend.emails.send({
      from: 'Shop Orders <onboarding@resend.dev>', // Change this to your verified domain
      to: [customerEmail],
      subject: `${statusInfo.subject} - Order #${order.id.slice(0, 8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #000000;">
          <h2 style="color: #000000; border-bottom: 2px solid #A7D8FF; padding-bottom: 10px;">
            Order Status Update
          </h2>
          <p>Hi ${customerName || 'there'},</p>
          <p>${statusInfo.message}</p>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #F5F5F5; border-radius: 8px;">
            <h3 style="margin-top: 0;">Order Information</h3>
            <p><strong>Order Number:</strong> #${order.id.slice(0, 8)}</p>
            <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
            <p><strong>Order Total:</strong> $${order.total.toFixed(2)}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px;">
            <p>If you have any questions about your order, please contact us at inxvinx@gmail.com</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Order status email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
