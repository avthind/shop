# Test Suite Documentation

This directory contains comprehensive unit, function, and integration tests for the e-commerce application.

## Test Structure

```
__tests__/
├── api/                    # API route tests
│   ├── contact.test.ts
│   ├── order-tracking.test.ts
│   ├── payment-create-intent.test.ts
│   ├── payment-update-intent.test.ts
│   └── payment-webhook.test.ts
├── components/             # Component unit tests
│   ├── Button.test.tsx
│   ├── CartItem.test.tsx
│   ├── ProductCard.test.tsx
│   ├── ProtectedRoute.test.tsx
│   └── WishlistItem.test.tsx
├── context/                # Context provider tests
│   ├── CartContext.test.tsx
│   └── WishlistContext.test.tsx
├── integration/            # Integration tests
│   ├── cart-flow.test.tsx
│   ├── checkout-flow.test.tsx
│   └── wishlist-flow.test.tsx
├── lib/                    # Utility function tests
│   ├── firestore.test.ts
│   └── validation.test.ts
└── utils/                  # Test utilities
    └── test-utils.tsx
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests in CI mode
```bash
npm run test:ci
```

### Run specific test file
```bash
npm test -- Button.test.tsx
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="Cart"
```

## Test Categories

### Unit Tests
- **Components**: Test individual React components in isolation
- **Context Providers**: Test state management and context logic
- **Utilities**: Test pure functions and utility modules

### Function Tests
- **API Routes**: Test Next.js API route handlers
- **Validation**: Test input validation and sanitization

### Integration Tests
- **User Flows**: Test complete user workflows (cart, checkout, wishlist)
- **Component Integration**: Test component interactions with contexts

## Test Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Writing New Tests

### Component Test Example
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### API Route Test Example
```tsx
import { POST } from '@/app/api/my-route/route';
import { NextRequest } from 'next/server';

describe('POST /api/my-route', () => {
  it('should handle request correctly', async () => {
    const request = new NextRequest('http://localhost/api/my-route', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

## Mocking

### Firebase
Firebase is automatically mocked in `jest.setup.js`. All Firebase functions return mock implementations.

### Next.js
- `next/navigation` is mocked to provide router functions
- `next/image` is mocked to render as regular `<img>` tags
- `next/link` is mocked to render as regular `<a>` tags

### External APIs
- Stripe is mocked in API route tests
- Resend (email service) is mocked in contact form tests

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Use `beforeEach` and `afterEach` to reset state
3. **Descriptive Names**: Test names should clearly describe what they test
4. **AAA Pattern**: Arrange, Act, Assert
5. **Mock External Dependencies**: Don't make real API calls in tests
6. **Test User Behavior**: Focus on what users see and do, not implementation details

## Troubleshooting

### Tests failing with "Cannot find module"
- Ensure all dependencies are installed: `npm install`
- Check that module paths match your `tsconfig.json` paths

### Firebase errors in tests
- Firebase is mocked globally in `jest.setup.js`
- If you see Firebase errors, check that mocks are properly set up

### localStorage issues
- localStorage is automatically cleared between tests
- Use `localStorage.setItem()` in tests if you need specific state

## Continuous Integration

Tests are configured to run in CI mode with:
- Coverage reports
- Parallel execution (max 2 workers)
- Fail on coverage threshold violations
