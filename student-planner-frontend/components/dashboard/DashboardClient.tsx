/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickAddTaskForm } from "@/components/dashboard/QuickAddTaskForm";
import { Task } from '../task/TaskTable';


// --- Dynamically import chart components ---
// This prevents Server-Side Rendering errors by only loading these components in the browser.
const TasksByWeekChart = dynamic(
  () => import('@/components/progress/TasksByWeekChart').then(mod => mod.TasksByWeekChart),
  { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><p>Loading Chart...</p></div> }
);
const TasksByCategoryChart = dynamic(
  () => import('@/components/progress/TasksByCategoryChart').then(mod => mod.TasksByCategoryChart),
  { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><p>Loading Chart...</p></div> }
);
const ProductivityTrendChart = dynamic(
  () => import('@/components/progress/ProductivityTrendChart').then(mod => mod.ProductivityTrendChart),
  { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center"><p>Loading Chart...</p></div> }
);

interface DashboardClientProps {
  tasks: Task[];
  stats: any;
}

export function DashboardClient({ tasks, stats }: DashboardClientProps) {
  // Filter the tasks to get the different lists for the dashboard cards
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));
  const sevenDaysLater = new Date(new Date().setDate(new Date().getDate() + 7));
  
  const todaysTasks = tasks.filter(task => task.deadline && new Date(task.deadline) >= todayStart && new Date(task.deadline) <= todayEnd);
  const upcomingDeadlines = tasks.filter(task => task.deadline && new Date(task.deadline) > todayEnd && new Date(task.deadline) <= sevenDaysLater);

  return (
    // This is the main grid container. On large screens (lg), it's a 3-column grid.
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* --- WIDER LEFT COLUMN --- */}
      {/* This div spans 2 out of 3 columns on large screens. */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader><CardTitle>Productivity Trend (Last 30 Days)</CardTitle></CardHeader>
          <CardContent>
            {stats && stats.productivityTrend?.length > 0 ? <ProductivityTrendChart data={stats.productivityTrend} /> : <p className="text-muted-foreground">Complete tasks to see your trend.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Weekly Summary (Created vs. Completed)</CardTitle></CardHeader>
          <CardContent>
            {stats && stats.tasksByWeek?.length > 0 ? <TasksByWeekChart data={stats.tasksByWeek} /> : <p className="text-muted-foreground">No recent task activity.</p>}
          </CardContent>
        </Card>
        
         <Card>
          <CardHeader><CardTitle>Upcoming Deadlines (Next 7 Days)</CardTitle></CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <ul className="space-y-1">
                {upcomingDeadlines.map(task => (
                  <li key={task._id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                    <span>{task.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(task.deadline!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (<p className="text-muted-foreground">No deadlines in the coming week.</p>)}
          </CardContent>
        </Card>
      </div>

      {/* --- NARROWER RIGHT COLUMN --- */}
      {/* This div spans 1 out of 3 columns on large screens. */}
      <div className="lg:col-span-1 space-y-6">
         <Card>
          <CardHeader><CardTitle>Today&#39;s Agenda</CardTitle></CardHeader>
          <CardContent>
            {todaysTasks.length > 0 ? (
              <ul className="space-y-2">
                {todaysTasks.map(task => <li key={task._id} className="p-2">{task.title}</li>)}
              </ul>
            ) : (<p className="text-muted-foreground">No tasks due today. Enjoy!</p>)}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Tasks by Category</CardTitle></CardHeader>
          <CardContent>
            {stats && stats.tasksByCategory?.length > 0 ? <TasksByCategoryChart data={stats.tasksByCategory} /> : <p className="text-muted-foreground">Create tasks to see a breakdown.</p>}
          </CardContent>
        </Card>
        
        <QuickAddTaskForm />
      </div>

    </div>
  );
}