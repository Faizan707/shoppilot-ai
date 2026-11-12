import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { toast } from 'react-toastify';
import { queryKeys } from '../hooks/queryKeys';
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
} from '../services/api';
import type { User } from '../types';
import { getErrorMessage } from '../utils/errors';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (payload: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      try {
        return await fetchCurrentUser();
      } catch {
        return null;
      }
    },
    retry: false,
  });

  const user = meQuery.data ?? null;

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (loggedIn) => {
      queryClient.setQueryData(queryKeys.auth.me, loggedIn);
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.root });
      toast.success('Welcome back!');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Login failed')),
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (registered) => {
      queryClient.setQueryData(queryKeys.auth.me, registered);
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.root });
      toast.success('Account created successfully');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Registration failed')),
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.me, null);
      queryClient.removeQueries({ queryKey: queryKeys.cart.root });
      queryClient.removeQueries({ queryKey: queryKeys.wishlist.root });
      toast.info('Logged out');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Logout failed')),
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.auth.me, updated);
      toast.success('Profile updated');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Update failed')),
  });

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    [loginMutation]
  );

  const register = useCallback(
    async (payload: { name: string; email: string; password: string; phone?: string }) => {
      await registerMutation.mutateAsync(payload);
    },
    [registerMutation]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
  }, [queryClient]);

  const updateProfile = useCallback(
    async (payload: Partial<User>) => {
      await updateProfileMutation.mutateAsync(payload);
    },
    [updateProfileMutation]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading: meQuery.isPending,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
    }),
    [user, meQuery.isPending, login, register, logout, refreshUser, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
