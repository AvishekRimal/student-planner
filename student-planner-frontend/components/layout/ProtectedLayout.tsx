"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/redux/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { AppHeader } from './AppHeader'; // <-- Import our new header

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    // Render nothing while the auth check is happening to prevent flashing
    return null; 
  }

  // If the user is authenticated, render the full application layout
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      {/* A main wrapper for the content and header */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        
        {/* Our new, clean header component */}
        <AppHeader />
        
        {/* The main page content (Dashboard, Tasks, etc.) will be rendered here */}
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}