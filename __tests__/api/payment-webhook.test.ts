import { POST } from '@/app/api/payment/webhook/route';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { updateOrderStatus } from '@/lib/firestore';

jest.mock('stripe');
jest.mock('@/lib/firestore');

// Mock NextRequest
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(public url: string, public init?: any) {}
    headers = {
      get: jest.fn((name: string) => this.init?.headers?.[name] || null),
    };
    async text() {
      return typeof this.init?.body === 'string' 
        ? this.init.body 
        : JSON.stringify(this.init?.body || {});
    }
  },
  NextResponse: {
    json: jest.fn((data: any, init?: any) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}));

describe('POST /api/payment/webhook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
  });

  it('should handle payment_intent.succeeded event', async () => {
    const mockEvent = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          metadata: { orderId: 'order123' },
        },
      },
    } as any;

    const mockConstructEvent = jest.fn().mockReturnValue(mockEvent);

    (Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => ({
      webhooks: {
        constructEvent: mockConstructEvent,
      },
    } as any));

    (updateOrderStatus as jest.Mock).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify(mockEvent),
      headers: {
        'stripe-signature': 'test-signature',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(updateOrderStatus).toHaveBeenCalledWith('order123', 'processing');
  });

  it('should handle payment_intent.payment_failed event', async () => {
    const mockEvent = {
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_test_123',
          metadata: { orderId: 'order123' },
        },
      },
    } as any;

    const mockConstructEvent = jest.fn().mockReturnValue(mockEvent);

    (Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => ({
      webhooks: {
        constructEvent: mockConstructEvent,
      },
    } as any));

    (updateOrderStatus as jest.Mock).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify(mockEvent),
      headers: {
        'stripe-signature': 'test-signature',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(updateOrderStatus).toHaveBeenCalledWith('order123', 'cancelled');
  });

  it('should handle payment_intent.canceled event', async () => {
    const mockEvent = {
      type: 'payment_intent.canceled',
      data: {
        object: {
          id: 'pi_test_123',
          metadata: { orderId: 'order123' },
        },
      },
    } as any;

    const mockConstructEvent = jest.fn().mockReturnValue(mockEvent);

    (Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => ({
      webhooks: {
        constructEvent: mockConstructEvent,
      },
    } as any));

    (updateOrderStatus as jest.Mock).mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify(mockEvent),
      headers: {
        'stripe-signature': 'test-signature',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(updateOrderStatus).toHaveBeenCalledWith('order123', 'cancelled');
  });

  it('should return 400 if signature is missing', async () => {
    const request = new NextRequest('http://localhost/api/payment/webhook', {
      method: 'POST',
      body: 'test body',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('No signature provided');
  });

  it('should return 400 if signature verification fails', async () => {
    const mockConstructEvent = jest.fn().mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    (Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => ({
      webhooks: {
        constructEvent: mockConstructEvent,
      },
    } as any));

    const request = new NextRequest('http://localhost/api/payment/webhook', {
      method: 'POST',
      body: 'test body',
      headers: {
        'stripe-signature': 'invalid-signature',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Webhook Error');
  });

  it('should handle unhandled event types', async () => {
    const mockEvent = {
      type: 'unknown.event',
      data: {
        object: {},
      },
    } as any;

    const mockConstructEvent = jest.fn().mockReturnValue(mockEvent);

    (Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => ({
      webhooks: {
        constructEvent: mockConstructEvent,
      },
    } as any));

    const request = new NextRequest('http://localhost/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify(mockEvent),
      headers: {
        'stripe-signature': 'test-signature',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(updateOrderStatus).not.toHaveBeenCalled();
  });
});
