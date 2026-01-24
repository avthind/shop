import { POST } from '@/app/api/contact/route';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

jest.mock('resend');
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

describe('POST /api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RESEND_API_KEY = 'test-key';
  });

  it('should send contact form email successfully', async () => {
    const mockSend = jest.fn().mockResolvedValue({
      data: { id: 'email123' },
      error: null,
    });

    (Resend as jest.MockedClass<typeof Resend>).mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    } as any));

    const requestBody = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'Test message',
    };

    const request = new NextRequest('http://localhost/api/contact', {
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
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['inxvinx@gmail.com'],
        replyTo: 'john@example.com',
        subject: 'Contact Form: Test Subject',
      })
    );
  });

  it('should return 400 if required fields are missing', async () => {
    const requestBody = {
      name: 'John Doe',
      email: 'john@example.com',
      // Missing subject and message
    };

    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('All fields are required');
  });

  it('should return 500 if email sending fails', async () => {
    const mockSend = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Email sending failed' },
    });

    (Resend as jest.MockedClass<typeof Resend>).mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    } as any));

    const requestBody = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'Test message',
    };

    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to send email');
  });

  it('should handle invalid JSON', async () => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
