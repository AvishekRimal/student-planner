import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from "@/components/layout/Header";
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { Task } from '../tasks/page';


// --- Data Fetching Functions ---

async function getTasks(token: string): Promise<Task[]> {
  if (!token) return [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) { console.error("Failed to fetch tasks"); return []; }
    const data = await res.json();
    return data.tasks || [];
  } catch (error) { console.error(error); return []; }
}

async function getStats(token: string) {
  if (!token) return null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/stats`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) { console.error("Failed to fetch stats"); return null; }
    return res.json();
  } catch (error) { console.error(error); return null; }
}

// The main page component - a Server Component
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }

  // Fetch all necessary data in parallel for maximum efficiency
  const [tasks, stats] = await Promise.all([
    getTasks(token),
    getStats(token)
  ]);

  return (
    <div>
      <Header 
        title="Dashboard"
        subtitle="Your productivity and task overview all in one place."
      />
      
      {/* 
        Pass all the server-fetched data down to the Client Component.
        The Client Component will handle all the rendering and interactivity.
      */}
      <DashboardClient tasks={tasks} stats={stats} />
    </div>
  );
}