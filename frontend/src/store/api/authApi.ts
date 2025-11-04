import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User } from '../slices/authSlice';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  success: boolean;
  message: string;
}

// Base query that points to nginx gateway with v1 versioning
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8080/api/v1/auth',
  credentials: 'include', // Include cookies in requests
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: any) => {
        // The auth service returns { success, message, user: { id, email, name } }
        // Token is now set as httpOnly cookie and not returned in response
        return {
          success: response.success,
          message: response.message,
          user: {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            avatar: `https://i.pravatar.cc/150?u=${response.user.email}`, // Generate avatar
          },
        };
      },
    }),
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;
