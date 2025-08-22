"use client";

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getCookie } from 'cookies-next';
import { loginSuccess, logout } from '@/redux/slices/authSlice';
import { useAuth } from '@/redux/hooks/useAuth';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  // We use a local loading state to prevent showing a flicker of content
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs only once when the component mounts
    const initializeAuth = async () => {
      const rawToken = getCookie('token');
      const token = typeof rawToken === 'string' ? rawToken : '';

      if (token) {
        try {
          // If a token exists, call the /me endpoint to validate it
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (res.ok) {
            const user = await res.json();
            // If the token is valid, rehydrate the Redux store
            dispatch(loginSuccess({ user, token }));
          } else {
            // If the token is invalid (e.g., expired), log the user out
            dispatch(logout());
          }
        } catch (error) {
          // If the API call fails, log out
          console.error("Failed to initialize auth", error);
          dispatch(logout());
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [dispatch]);

  // While we are checking the token, don't render anything.
  // This prevents the redirect logic from running prematurely.
  if (isLoading) {
    return null; // Or you can return a full-page loading spinner here
  }

  return <>{children}</>;
}