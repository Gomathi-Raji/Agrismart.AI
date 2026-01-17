import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'farmer' | 'buyer' | null;

interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  farmerProfile?: {
    farmName?: string;
    farmSize?: string;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
      coordinates?: { lat: number; lng: number };
    };
    crops?: string[];
    experience?: string;
    certifications?: string[];
    contactNumber?: string;
  };
  buyerProfile?: {
    businessName?: string;
    businessType?: 'individual' | 'retail' | 'wholesale' | 'restaurant' | 'cooperative';
    preferredProducts?: string[];
    deliveryAddress?: {
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
      coordinates?: { lat: number; lng: number };
    };
    gstNumber?: string;
  };
  avatar?: string;
  preferences?: {
    theme: string;
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      weather: boolean;
      market: boolean;
    };
  };
  lastLogin?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: any | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  demoLogin: (username: string, password: string, role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  isClerkUser: boolean;
  isLoading: boolean;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
}

type ProfileData = Partial<User['farmerProfile'] | User['buyerProfile']>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for frontend authentication
const DEMO_USERS = [
  {
    email: 'farmer@demo.com',
    password: 'farmer123',
    role: 'farmer' as UserRole,
    user: {
      _id: 'demo-farmer-1',
      name: 'Rajesh Kumar Sharma',
      email: 'farmer@demo.com',
      role: 'farmer' as UserRole,
      farmerProfile: {
        farmName: 'Sharma Family Farm',
        farmSize: '15 acres',
        location: {
          address: 'Village Rampur',
          city: 'Sangrur',
          state: 'Punjab',
          pincode: '148001',
          coordinates: { lat: 30.2413, lng: 75.8486 }
        },
        crops: ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize'],
        experience: '12 years',
        certifications: ['Organic Farming Certified', 'GAP Certified'],
        contactNumber: '+91 98765 43210'
      },
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          weather: true,
          market: true
        }
      },
      lastLogin: new Date().toISOString(),
      createdAt: '2023-03-15T00:00:00.000Z'
    }
  },
  {
    email: 'buyer@demo.com',
    password: 'buyer123',
    role: 'buyer' as UserRole,
    user: {
      _id: 'demo-buyer-1',
      name: 'Priya Singh',
      email: 'buyer@demo.com',
      role: 'buyer' as UserRole,
      buyerProfile: {
        businessName: 'Singh Retail Mart',
        businessType: 'retail' as const,
        preferredProducts: ['Rice', 'Wheat', 'Vegetables', 'Fruits'],
        deliveryAddress: {
          address: '123 Market Street',
          city: 'Ludhiana',
          state: 'Punjab',
          pincode: '141001',
          coordinates: { lat: 30.9000, lng: 75.8573 }
        },
        gstNumber: '22AAAAA0000A1Z5'
      },
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          weather: false,
          market: true
        }
      },
      lastLogin: new Date().toISOString(),
      createdAt: '2023-05-20T00:00:00.000Z'
    }
  },
  {
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin' as UserRole,
    user: {
      _id: 'demo-admin-1',
      name: 'Admin User',
      email: 'admin@demo.com',
      role: 'admin' as UserRole,
      preferences: {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          weather: false,
          market: false
        }
      },
      lastLogin: new Date().toISOString(),
      createdAt: '2023-01-01T00:00:00.000Z'
    }
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication on app load
    const checkStoredAuth = () => {
      try {
        const storedAuth = localStorage.getItem('frontendAuth');
        if (storedAuth) {
          const { user: storedUser, authenticated } = JSON.parse(storedAuth);
          if (authenticated && storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error parsing stored auth:', error);
        localStorage.removeItem('frontendAuth');
      }
      setIsLoading(false);
    };

    checkStoredAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find demo user
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);

      if (!demoUser) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      const updatedUser = {
        ...demoUser.user,
        lastLogin: new Date().toISOString()
      };

      // Store authentication
      localStorage.setItem('frontendAuth', JSON.stringify({
        user: updatedUser,
        authenticated: true
      }));

      setUser(updatedUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const demoLogin = async (username: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find demo user by role
      const demoUser = DEMO_USERS.find(u => u.role === role);

      if (!demoUser) {
        throw new Error('Demo user not found for this role');
      }

      // Update last login
      const updatedUser = {
        ...demoUser.user,
        lastLogin: new Date().toISOString()
      };

      // Store authentication
      localStorage.setItem('frontendAuth', JSON.stringify({
        user: updatedUser,
        authenticated: true
      }));

      setUser(updatedUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Demo login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'buyer'): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if user already exists
      const existingUser = DEMO_USERS.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Create new user
      const newUser: User = {
        _id: `user-${Date.now()}`,
        name,
        email,
        role,
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            weather: role === 'farmer',
            market: true
          }
        },
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // Add role-specific profile
      if (role === 'farmer') {
        newUser.farmerProfile = {
          farmName: `${name}'s Farm`,
          farmSize: '5 acres',
          location: {
            address: 'Demo Location',
            city: 'Demo City',
            state: 'Demo State',
            pincode: '123456',
            coordinates: { lat: 28.6139, lng: 77.2090 }
          },
          crops: ['Rice', 'Wheat'],
          experience: '2 years',
          certifications: [],
          contactNumber: '+91 98765 43210'
        };
      } else if (role === 'buyer') {
        newUser.buyerProfile = {
          businessName: `${name}'s Business`,
          businessType: 'individual' as const,
          preferredProducts: ['Rice', 'Wheat', 'Vegetables'],
          deliveryAddress: {
            address: 'Demo Address',
            city: 'Demo City',
            state: 'Demo State',
            pincode: '123456',
            coordinates: { lat: 28.6139, lng: 77.2090 }
          }
        };
      }

      // Store authentication
      localStorage.setItem('frontendAuth', JSON.stringify({
        user: newUser,
        authenticated: true
      }));

      setUser(newUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    // Frontend-only Google login simulation
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use demo farmer account for Google login
      const demoUser = DEMO_USERS.find(u => u.role === 'farmer');
      if (!demoUser) {
        throw new Error('Demo user not available');
      }

      const updatedUser = {
        ...demoUser.user,
        lastLogin: new Date().toISOString()
      };

      localStorage.setItem('frontendAuth', JSON.stringify({
        user: updatedUser,
        authenticated: true
      }));

      setUser(updatedUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear authentication data
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('frontendAuth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false;

      const updatedUser = { ...user, ...data };

      // Store updated user
      localStorage.setItem('frontendAuth', JSON.stringify({
        user: updatedUser,
        authenticated: true
      }));

      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    // Frontend-only - just return true since we don't use tokens
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      userRole: user?.role || null,
      isAuthenticated,
      login,
      demoLogin,
      register,
      loginWithGoogle,
      logout,
      isClerkUser: false,
      isLoading,
      updateProfile,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}