import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from "@/components/layout/Header";

import { TaskCalendar } from '@/components/calendar/TaskCalendar';
import { Task } from '../tasks/page';

// The server-side fetch function (same as on other pages)
async function getTasks(token: string): Promise<Task[]> {
  if (!token) return [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.tasks || [];
  } catch (error) {
    return [];
  }
}

// The main page is a Server Component
export default async function CalendarPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const tasks = await getTasks(token);

  return (
    <div>
      <Header 
        title="Calendar"
        subtitle="View and manage your tasks with deadlines in a calendar view."
      />
      
      {/* We pass the server-fetched tasks down to the client component */}
      <TaskCalendar tasks={tasks} />
    </div>
  );
}