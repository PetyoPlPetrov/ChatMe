import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { User } from '../slices/authSlice';

// Mock users data
const mockUsers: User[] = [
  { id: '1', email: 'john@example.com', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', email: 'jane@example.com', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', email: 'admin@example.com', name: 'Admin User', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: '4', email: 'alice@example.com', name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: '5', email: 'bob@example.com', name: 'Bob Wilson', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: '6', email: 'charlie@example.com', name: 'Charlie Brown', avatar: 'https://i.pravatar.cc/150?img=6' }
];

// Mock base query function
const mockBaseQuery: BaseQueryFn<string, User | User[], { status: number; data: { message: string } }> = async (args, { getState }) => {
  // Check if user is authenticated
  const state = getState() as any;
  const token = state.auth.token;
  if (!token) {
    return {
      error: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  if (args) {
    // Handle getUserById query
    const userId = args;
    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      return {
        error: {
          status: 404,
          data: { message: 'User not found' }
        }
      };
    }

    return { data: user };
  } else if (args === '') {
    // Handle getUsers query - return all users
    return { data: mockUsers };
  }

  return {
    error: {
      status: 404,
      data: { message: 'Endpoint not found' }
    }
  };
};

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: mockBaseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '',
      providesTags: ['User'],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => id,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
  }),
});

export const { useGetUsersQuery, useGetUserByIdQuery } = usersApi;