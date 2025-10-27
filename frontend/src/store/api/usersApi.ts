import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User } from '../slices/authSlice';

// Base query with authentication via nginx gateway
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8080/api',
  credentials: 'include', // Include cookies for authentication
  prepareHeaders: (headers) => {
    // Authentication is now handled automatically via httpOnly cookies
    // No need to manually set Authorization headers
    return headers;
  },
});

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
  }),
});

export const { useGetUsersQuery, useGetUserByIdQuery } = usersApi;
