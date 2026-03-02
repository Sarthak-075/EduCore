import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Student, StudentSummary, Payment } from '../types';

export const studentsApi = createApi({
  reducerPath: 'studentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Students'],
  endpoints: (builder) => ({
    getStudents: builder.query<Student[], void>({
      query: () => '/students',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Students' as const, id })), { type: 'Students', id: 'LIST' }]
          : [{ type: 'Students', id: 'LIST' }],
    }),
    addStudent: builder.mutation<Student, Partial<Student>>({
      query: (body) => ({ url: '/students', method: 'POST', body }),
      invalidatesTags: [{ type: 'Students', id: 'LIST' }],
    }),
    updateStudent: builder.mutation<void, { id: string; changes: Partial<Student> }>({
      query: ({ id, changes }) => ({ url: `/students/${id}`, method: 'PUT', body: changes }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Students', id }],
    }),
    deleteStudent: builder.mutation<void, string>({
      query: (id) => ({ url: `/students/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Students', id: 'LIST' }],
    }),
    addPayment: builder.mutation<Payment, {id: string; month: number; year: number; amountPaid: number; dateReceived?: string}>({
      query: ({ id, month, year, amountPaid, dateReceived }) => ({
        url: `/students/${id}/payments`,
        method: 'POST',
        body: { month, year, amountPaid, dateReceived },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Students', id }],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useAddStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useAddPaymentMutation,
} = studentsApi;
