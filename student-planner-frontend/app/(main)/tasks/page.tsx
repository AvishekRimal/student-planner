import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from "@/components/layout/Header";
import { AddTaskModal } from '@/components/task/AddTaskModal';
import { Task, TaskTable } from '@/components/task/TaskTable';


// Define the Task type for our fetch function and components
// export interface Task {
//   _id: string;
//   title: string;
//   priority: 'High' | 'Medium' | 'Low';
//   category: string;
//   deadline?: string;
//   completed: boolean;
// }

// A server-side function to fetch all tasks for the logged-in user
async function getTasks(token: string): Promise<Task[]> {
  if (!token) return [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store', // Always fetch the latest data for the tasks page
    });
    if (!res.ok) {
      console.error("Failed to fetch tasks, status:", res.status);
      return [];
    }
    const data = await res.json();
    return data.tasks || [];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

// The main page component, running on the server
export default async function TasksPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const tasks = await getTasks(token);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Header 
          title="Tasks"
          subtitle="Manage all your tasks in one place."
        />
        {/* The AddTaskModal component contains the button and the dialog logic */}
        <AddTaskModal />
      </div>

      {/* We pass the server-fetched tasks down to the client component as a prop */}
      <TaskTable tasks={tasks} />
    </div>
  );
}