import { POST } from '@/app/api/payment/update-intent/route';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

jest.mock('stripe');
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
    async json() {
      return JSON.parse(await this.text());
    }
  },
  NextResponse: {
    json: jest.fn((data: any, init?: any) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}));

describe('POST /api/payment/update-intent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  });

  it('should update payment intent successfully', async () => {
    const mockPaymentIntent = {
      id: 'pi_test_123',
      metadata: { orderId: 'order123' },
    };

    const mockUpdate = jest.fn().mockResolvedValue(mockPaymentIntent);

    (Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => ({
      paymentIntents: {
        update: mockUpdate,
      },
    } as any));

    const requestBody = {
      paymentIntentId: 'pi_test_123',
      metadata: { orderId: 'order123' },
    };

    const request = new NextRequest('http://localhost/api/payment/update-intent', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.paymentIntentId).toBe('pi_test_123');
    expect(mockUpdate).toHaveBeenCalledWith('pi_test_123', {
      metadata: { orderId: 'order123' },
    });
  });

  it('should return 400 if paymentIntentId is missing', async () => {
    const requestBody = {
      metadata: { orderId: 'order123' },
    };

    const request = new NextRequest('http://localhost/api/payment/update-intent', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Payment intent ID is required');
  });

  it('should handle Stripe errors', async () => {
    const mockUpdate = jest.fn().mockRejectedValue(new Error('Stripe API error'));

    (Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => ({
      paymentIntents: {
        update: mockUpdate,
      },
    } as any));

    const requestBody = {
      paymentIntentId: 'pi_test_123',
      metadata: { orderId: 'order123' },
    };

    const request = new NextRequest('http://localhost/api/payment/update-intent', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Stripe API error');
  });
});
