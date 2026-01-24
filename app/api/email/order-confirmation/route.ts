import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Order } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order, customerEmail, customerName } = body as {
      order: Order;
      customerEmail: string;
      customerName: string;
    };

    if (!order || !customerEmail) {
      return NextResponse.json(
        { error: 'Order and customer email are required' },
        { status: 400 }
      );
    }

    // Format order items
    const itemsHtml = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
          ${item.product.name} × ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">
          $${(item.product.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
      )
      .join('');

    // Send order confirmation email
    const { data, error } = await resend.emails.send({
      from: 'Shop Orders <onboarding@resend.dev>', // Change this to your verified domain
      to: [customerEmail],
      subject: `Order Confirmation #${order.id.slice(0, 8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #000000;">
          <h2 style="color: #000000; border-bottom: 2px solid #A7D8FF; padding-bottom: 10px;">
            Order Confirmation
          </h2>
          <p>Hi ${customerName || 'there'},</p>
          <p>Thank you for your order! We've received it and will process it shortly.</p>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #F5F5F5; border-radius: 8px;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> #${order.id.slice(0, 8)}</p>
            <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
          </div>

          <div style="margin-top: 20px;">
            <h3>Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
              <tr>
                <td style="padding: 15px 10px; border-top: 2px solid #000000; font-weight: 600;">
                  Total
                </td>
                <td style="padding: 15px 10px; border-top: 2px solid #000000; text-align: right; font-weight: 600;">
                  $${order.total.toFixed(2)}
                </td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px;">
            <p>We'll send you another email when your order ships.</p>
            <p>If you have any questions, please contact us at inxvinx@gmail.com</p>
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
    console.error('Order confirmation email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
