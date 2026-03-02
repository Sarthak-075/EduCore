import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Teacher } from '../types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/auth',
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    signup: builder.mutation<Teacher, {name:string;email:string;password:string;phone?:string}>({
      query: (data) => ({ url: '/signup', method: 'POST', body: data }),
    }),
    login: builder.mutation<Teacher, {email:string;password:string}>({
      query: (data) => ({ url: '/login', method: 'POST', body: data }),
    }),
    me: builder.query<Teacher, void>({
      query: () => '/me',
    }),
    logout: builder.mutation<{success:boolean}, void>({
      query: () => ({ url: '/logout', method: 'POST' }),
    }),
    updateProfile: builder.mutation<Teacher, {name:string; phone?:string}>({
      query: (patch) => ({ url: '/me', method: 'PUT', body: patch }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // optimistic update of cached me query
        const patchResult = dispatch(
          authApi.util.updateQueryData('me', undefined, (draft: any) => {
            if (draft) {
              draft.name = arg.name;
              if (arg.phone !== undefined) draft.phone = arg.phone;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const { useSignupMutation, useLoginMutation, useMeQuery, useLogoutMutation, useUpdateProfileMutation } = authApi;
