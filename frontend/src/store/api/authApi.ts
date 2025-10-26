import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User } from '../slices/authSlice';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  success: boolean;
  message: string;
}

// Base query that points to nginx gateway
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8080/api/auth',
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
        // The auth service returns { success, message, user: { id, email, name }, token }
        return {
          success: response.success,
          message: response.message,
          user: {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            avatar: `https://i.pravatar.cc/150?u=${response.user.email}`, // Generate avatar
          },
          token: response.token,
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
