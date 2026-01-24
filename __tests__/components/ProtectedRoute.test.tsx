import React from 'react';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider, AuthContext } from '@/context/AuthContext';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: null,
  db: {},
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null); // No user
    return jest.fn(); // Return unsubscribe function
  }),
}));

// Create a test component that uses AuthContext directly
const TestAuthProvider = ({ user, children }: { user: any; children: React.ReactNode }) => {
  return (
    <AuthContext.Provider value={{
      currentUser: user,
      loading: false,
      signup: jest.fn(),
      login: jest.fn(),
      loginWithGoogle: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      deleteAccount: jest.fn(),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

describe('ProtectedRoute Component', () => {
  it('should render children when user is authenticated', () => {
    const mockUser = { uid: 'user123', email: 'test@example.com' } as any;

    render(
      <TestAuthProvider user={mockUser}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestAuthProvider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect when user is not authenticated', () => {
    const mockPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    });

    render(
      <TestAuthProvider user={null}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestAuthProvider>
    );

    // Should redirect to login
    expect(mockPush).toHaveBeenCalledWith('/login');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
