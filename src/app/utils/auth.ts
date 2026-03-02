import { useMeQuery, useLogoutMutation } from "../api/auth";

export function useAuth() {
  const { data: user, isLoading, isError, refetch } = useMeQuery();
  const [logout] = useLogoutMutation();

  const signOut = async () => {
    await logout().unwrap();
    // after logout, we could optionally reset the store or refetch
    window.location.href = '/login';
  };

  return { user, loading: isLoading, error: isError, signOut, refetch };
}
