import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from "@/components/layout/Header";
import { ProgressCharts } from '@/components/progress/ProgressCharts'; // <-- Import our new wrapper

// The server-side fetch function remains the same
async function getStats(token: string) {
  if (!token) return null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/stats`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function ProgressPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }

  // Fetch the data on the server
  const stats = await getStats(token);

  return (
    <div>
      <Header 
        title="Your Progress"
        subtitle="Analyze your productivity and task distribution."
      />
      
      {/* 
        Pass the server-fetched data down to the Client Component.
        This component will handle rendering the charts on the client-side.
      */}
      <ProgressCharts stats={stats} />
    </div>
  );
}