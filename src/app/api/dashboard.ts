import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface DashboardData {
  month: number;
  year: number;
  totalExpected: number;
  totalCollected: number;
  totalPending: number;
  countByStatus: {
    paid: number;
    partial: number;
    pending: number;
  };
  percentage: number;
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardData, { month?: number; year?: number }>({
      query: ({ month, year } = {}) => {
        const params = new URLSearchParams();
        if (month) params.set('month', String(month));
        if (year) params.set('year', String(year));
        return `/dashboard?${params}`;
      },
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
