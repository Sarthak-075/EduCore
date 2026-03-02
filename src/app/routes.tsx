import { createBrowserRouter, Navigate } from "react-router";
import { lazy, Suspense, ReactElement } from "react";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { useMeQuery } from "./api/auth";

// Lazy load authenticated screens for code-splitting
const LoginScreen = lazy(() => import("./screens/LoginScreen").then(m => ({ default: m.LoginScreen })))
const SignupScreen = lazy(() => import("./screens/SignupScreen").then(m => ({ default: m.SignupScreen })))
const DashboardScreen = lazy(() => import("./screens/DashboardScreen").then(m => ({ default: m.DashboardScreen })))
const StudentsScreen = lazy(() => import("./screens/StudentsScreen").then(m => ({ default: m.StudentsScreen })))
const AddEditStudentScreen = lazy(() => import("./screens/AddEditStudentScreen").then(m => ({ default: m.AddEditStudentScreen })))
const StudentProfileScreen = lazy(() => import("./screens/StudentProfileScreen").then(m => ({ default: m.StudentProfileScreen })))
const SummaryScreen = lazy(() => import("./screens/SummaryScreen").then(m => ({ default: m.SummaryScreen })))
const ProfileScreen = lazy(() => import("./screens/ProfileScreen").then(m => ({ default: m.ProfileScreen })))

const LoadingFallback = () => <div className="flex items-center justify-center min-h-screen"><div className="text-muted-foreground">Loading...</div></div>

function RequireAuth({ children }: { children: ReactElement }) {
  const { data, isLoading, isError } = useMeQuery();
  if (isLoading) return <LoadingFallback />;
  if (isError || !data) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: OnboardingScreen,
  },
  {
    path: "/signup",
    Component: () => <Suspense fallback={<LoadingFallback />}><SignupScreen /></Suspense>,
  },
  {
    path: "/login",
    Component: () => <Suspense fallback={<LoadingFallback />}><LoginScreen /></Suspense>,
  },
  {
    path: "/dashboard",
    Component: () => <RequireAuth><Suspense fallback={<LoadingFallback />}><DashboardScreen /></Suspense></RequireAuth>,
  },
  {
    path: "/students",
    Component: () => <RequireAuth><Suspense fallback={<LoadingFallback />}><StudentsScreen /></Suspense></RequireAuth>,
  },
  {
    path: "/students/add",
    Component: () => <RequireAuth><Suspense fallback={<LoadingFallback />}><AddEditStudentScreen /></Suspense></RequireAuth>,
  },
  {
    path: "/students/edit/:id",
    Component: () => <RequireAuth><Suspense fallback={<LoadingFallback />}><AddEditStudentScreen /></Suspense></RequireAuth>,
  },
  {
    path: "/students/:id",
    Component: () => <RequireAuth><Suspense fallback={<LoadingFallback />}><StudentProfileScreen /></Suspense></RequireAuth>,
  },
  {
    path: "/summary",
    Component: () => <RequireAuth><Suspense fallback={<LoadingFallback />}><SummaryScreen /></Suspense></RequireAuth>,
  },
  {
    path: "/profile",
    Component: () => <RequireAuth><Suspense fallback={<LoadingFallback />}><ProfileScreen /></Suspense></RequireAuth>,
  },
]);