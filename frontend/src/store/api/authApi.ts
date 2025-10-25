import { createApi } from '@reduxjs/toolkit/query/react';
import { User } from '../slices/authSlice';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Mock user data
const mockUsers: Record<string, { user: User; password: string }> = {
  'john@example.com': {
    user: { id: '1', email: 'john@example.com', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
    password: 'password'
  },
  'jane@example.com': {
    user: { id: '2', email: 'jane@example.com', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
    password: 'password'
  },
  'admin@example.com': {
    user: { id: '3', email: 'admin@example.com', name: 'Admin User', avatar: 'https://i.pravatar.cc/150?img=3' },
    password: 'admin'
  },
  'alice@example.com': {
    user: { id: '4', email: 'alice@example.com', name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?img=4' },
    password: 'password'
  },
  'bob@example.com': {
    user: { id: '5', email: 'bob@example.com', name: 'Bob Wilson', avatar: 'https://i.pravatar.cc/150?img=5' },
    password: 'password'
  },
  'charlie@example.com': {
    user: { id: '6', email: 'charlie@example.com', name: 'Charlie Brown', avatar: 'https://i.pravatar.cc/150?img=6' },
    password: 'password'
  }
};

// Mock base query function
const mockBaseQuery = async (args: any): Promise<any> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  if (args.url === 'login' && args.method === 'POST') {
    const { email, password } = args.body;
    const mockUser = mockUsers[email];

    if (!mockUser || mockUser.password !== password) {
      return {
        error: {
          status: 401,
          data: { message: 'Invalid credentials' }
        }
      };
    }

    // Generate mock JWT token
    const token = `mock-jwt-token-${mockUser.user.id}-${Date.now()}`;

    return {
      data: {
        user: mockUser.user,
        token
      }
    };
  }

  return {
    error: {
      status: 404,
      data: { message: 'Endpoint not found' }
    }
  };
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: mockBaseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;