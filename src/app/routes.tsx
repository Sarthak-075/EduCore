import { createBrowserRouter, Navigate } from "react-router";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { SignupScreen } from "./screens/SignupScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { StudentsScreen } from "./screens/StudentsScreen";
import { AddEditStudentScreen } from "./screens/AddEditStudentScreen";
import { StudentProfileScreen } from "./screens/StudentProfileScreen";
import { SummaryScreen } from "./screens/SummaryScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { useMeQuery } from "./api/auth";
import { ReactElement } from "react";

function RequireAuth({ children }: { children: ReactElement }) {
  const { data, isLoading, isError } = useMeQuery();
  if (isLoading) return <div>Loading...</div>;
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
    Component: SignupScreen,
  },
  {
    path: "/login",
    Component: LoginScreen,
  },
  {
    path: "/dashboard",
    Component: () => <RequireAuth><DashboardScreen /></RequireAuth>,
  },
  {
    path: "/students",
    Component: () => <RequireAuth><StudentsScreen /></RequireAuth>,
  },
  {
    path: "/students/add",
    Component: () => <RequireAuth><AddEditStudentScreen /></RequireAuth>,
  },
  {
    path: "/students/edit/:id",
    Component: () => <RequireAuth><AddEditStudentScreen /></RequireAuth>,
  },
  {
    path: "/students/:id",
    Component: () => <RequireAuth><StudentProfileScreen /></RequireAuth>,
  },
  {
    path: "/summary",
    Component: () => <RequireAuth><SummaryScreen /></RequireAuth>,
  },
  {
    path: "/profile",
    Component: () => <RequireAuth><ProfileScreen /></RequireAuth>,
  },
]);