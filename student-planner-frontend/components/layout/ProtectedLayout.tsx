"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/redux/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { UserNav } from './UserNav'; // <-- Import the new UserNav component

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

  // Render nothing until the auth state is confirmed to prevent content flashing
  if (!isAuthenticated) {
    return null; 
  }

  // If authenticated, render the full application layout
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      {/* Create a main wrapper that will contain the header and the content */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        
        {/* --- NEW HEADER --- */}
        <header className="flex h-16 items-center justify-end border-b px-4 md:px-8">
          <UserNav />
        </header>
        
        {/* The main page content will be rendered here */}
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}