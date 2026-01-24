import { POST } from '@/app/api/payment/create-intent/route';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

jest.mock('stripe');

describe('POST /api/payment/create-intent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  });

  it('should create payment intent successfully', async () => {
    const mockPaymentIntent = {
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret',
    };

    const mockCreate = jest.fn().mockResolvedValue(mockPaymentIntent);

    (Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => ({
      paymentIntents: {
        create: mockCreate,
      },
    } as any));

    const requestBody = {
      amount: 100.50,
      currency: 'usd',
      metadata: { orderId: 'order123' },
    };

    const request = new NextRequest('http://localhost/api/payment/create-intent', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('clientSecret', 'pi_test_123_secret');
    expect(data).toHaveProperty('paymentIntentId', 'pi_test_123');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 10050, // Converted to cents
        currency: 'usd',
        metadata: { orderId: 'order123' },
      })
    );
  });

  it('should use default currency if not provided', async () => {
    const mockPaymentIntent = {
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret',
    };

    const mockCreate = jest.fn().mockResolvedValue(mockPaymentIntent);

    (Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => ({
      paymentIntents: {
        create: mockCreate,
      },
    } as any));

    const requestBody = {
      amount: 50,
    };

    const request = new NextRequest('http://localhost/api/payment/create-intent', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('clientSecret');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        currency: 'usd',
      })
    );
  });

  it('should return 400 for invalid amount', async () => {
    const requestBody = {
      amount: -10,
    };

    const request = new NextRequest('http://localhost/api/payment/create-intent', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid amount');
  });

  it('should return 400 for zero amount', async () => {
    const requestBody = {
      amount: 0,
    };

    const request = new NextRequest('http://localhost/api/payment/create-intent', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid amount');
  });

  it('should return 400 for missing amount', async () => {
    const requestBody = {};

    const request = new NextRequest('http://localhost/api/payment/create-intent', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid amount');
  });

  it('should handle Stripe errors', async () => {
    const mockCreate = jest.fn().mockRejectedValue(new Error('Stripe API error'));

    (Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => ({
      paymentIntents: {
        create: mockCreate,
      },
    } as any));

    // Reset the mock to ensure fresh instance
    jest.clearAllMocks();

    const requestBody = {
      amount: 100,
    };

    const request = new NextRequest('http://localhost/api/payment/create-intent', {
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
