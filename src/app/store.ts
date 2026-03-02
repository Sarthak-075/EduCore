import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/auth';
import { studentsApi } from './api/students';
import { dashboardApi } from './api/dashboard';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [studentsApi.reducerPath]: studentsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(studentsApi.middleware)
      .concat(dashboardApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
