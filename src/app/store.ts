import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/auth';
import { studentsApi } from './api/students';
import { dashboardApi } from './api/dashboard';
import { batchApi } from './api/batches';
import { attendanceApi } from './api/attendance';
import batchSlice from './store/batchSlice';
import attendanceSlice from './store/attendanceSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [studentsApi.reducerPath]: studentsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [batchApi.reducerPath]: batchApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    batch: batchSlice,
    attendance: attendanceSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(studentsApi.middleware)
      .concat(dashboardApi.middleware)
      .concat(batchApi.middleware)
      .concat(attendanceApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
