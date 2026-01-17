// Test file to verify frontend-only authentication
// This file can be deleted after testing

import { useAuth } from '@/contexts/AuthContext';

export function TestAuth() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleTestLogin = async () => {
    const success = await login('farmer@demo.com', 'farmer123');
    console.log('Login success:', success);
  };

  const handleTestLogout = async () => {
    await logout();
    console.log('Logged out');
  };

  return (
    <div className="p-4">
      <h2>Auth Test</h2>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <p>User: {user ? user.name : 'None'}</p>
      <p>Role: {user ? user.role : 'None'}</p>
      <button onClick={handleTestLogin} className="mr-2 p-2 bg-blue-500 text-white rounded">
        Test Login
      </button>
      <button onClick={handleTestLogout} className="p-2 bg-red-500 text-white rounded">
        Test Logout
      </button>
    </div>
  );
}