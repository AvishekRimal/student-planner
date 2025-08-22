import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickAddTaskForm } from "@/components/dashboard/QuickAddTaskForm";
import { CheckSquare, CalendarClock } from "lucide-react";

// Define a type for our task objects for better type safety
interface Task {
  _id: string;
  title: string;
  deadline?: string; // Deadline is optional
  // Add other task properties if needed, e.g., priority, category
  priority: 'High' | 'Medium' | 'Low';
}

/**
 * A server-side function to fetch all tasks for the logged-in user.
 * It reads the token from the cookies.
 */
async function getTasks(token: string): Promise<Task[]> {
  if (!token) {
    console.log("No token found, skipping fetch.");
    return [];
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store', // Ensures data is always fresh on this dynamic page
    });

    if (!res.ok) {
      console.error("Failed to fetch tasks, status:", res.status);
      // In a production app, you might want to log this error to a service
      return [];
    }

    const data = await res.json();
    return data.tasks || []; // API returns an object like { count, tasks }
  } catch (error) {
    console.error("An error occurred while fetching tasks:", error);
    return [];
  }
}

// The page itself is now an async Server Component
export default async function DashboardPage() {
  const cookieStore = await cookies(); // Correctly awaiting the promise
  const token = cookieStore.get('token')?.value;

  // Server-side protection: If no token, redirect to login immediately.
  if (!token) {
    redirect('/login');
  }
  
  const allTasks: Task[] = await getTasks(token);

  // --- Filter and process the fetched data on the server ---
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  const todaysTasks = allTasks.filter((task) => {
    if (!task.deadline) return false;
    const deadline = new Date(task.deadline);
    return deadline >= todayStart && deadline <= todayEnd;
  });

  const upcomingDeadlines = allTasks.filter((task) => {
    if (!task.deadline) return false;
    const deadline = new Date(task.deadline);
    return deadline > todayEnd && deadline <= sevenDaysLater;
  });

  return (
    <div>
      <Header 
        title="Dashboard"
        subtitle="Here is a summary of your tasks and upcoming deadlines."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" /> Today's Agenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaysTasks.length > 0 ? (
                <ul className="space-y-2">
                  {todaysTasks.map((task) => (
                    <li key={task._id} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted">
                      <span>{task.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No tasks due today. Enjoy your day!</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5" /> Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
               {upcomingDeadlines.length > 0 ? (
                <ul className="space-y-2">
                  {upcomingDeadlines.map((task) => (
                    <li key={task._id} className="flex items-center justify-between p-2">
                      <span>{task.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(task.deadline!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                 <p className="text-muted-foreground">No upcoming deadlines in the next 7 days.</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar column */}
        <div className="lg:col-span-1">
          {/* The form is a client component, but it works perfectly inside a server component */}
          <QuickAddTaskForm />
        </div>
      </div>
    </div>
  );
}