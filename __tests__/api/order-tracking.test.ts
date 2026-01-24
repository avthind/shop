import { GET } from '@/app/api/order-tracking/route';
import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/firestore';

jest.mock('@/lib/firestore');
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

describe('GET /api/order-tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return order when found', async () => {
    const mockOrder = {
      id: 'order123',
      items: [],
      total: 100,
      date: '2024-01-01T00:00:00.000Z',
      status: 'pending',
    };

    (getOrderById as jest.Mock).mockResolvedValue(mockOrder);

    const request = new NextRequest('http://localhost/api/order-tracking?orderId=order123');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order).toEqual(mockOrder);
    expect(getOrderById).toHaveBeenCalledWith('order123');
  });

  it('should return 404 when order not found', async () => {
    (getOrderById as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/order-tracking?orderId=invalid');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Order not found');
  });

  it('should return 400 when orderId is missing', async () => {
    const request = new NextRequest('http://localhost/api/order-tracking');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Order ID is required');
  });

  it('should handle errors', async () => {
    (getOrderById as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost/api/order-tracking?orderId=order123');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
