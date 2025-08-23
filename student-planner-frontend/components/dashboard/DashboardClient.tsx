/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickAddTaskForm } from "@/components/dashboard/QuickAddTaskForm";
import { Task } from '../task/TaskTable';


// --- Dynamically import chart components to prevent SSR errors ---
// This tells Next.js to only load these components in the browser.
const TasksByWeekChart = dynamic(
  () => import('@/components/progress/TasksByWeekChart').then(mod => mod.TasksByWeekChart),
  { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center">Loading Chart...</div> }
);
const TasksByCategoryChart = dynamic(
  () => import('@/components/progress/TasksByCategoryChart').then(mod => mod.TasksByCategoryChart),
  { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center">Loading Chart...</div> }
);
const ProductivityTrendChart = dynamic(
  () => import('@/components/progress/ProductivityTrendChart').then(mod => mod.ProductivityTrendChart),
  { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center">Loading Chart...</div> }
);

interface DashboardClientProps {
  tasks: Task[];
  stats: any; // You can define a more specific type for your stats object if you wish
}

export function DashboardClient({ tasks, stats }: DashboardClientProps) {
  // --- Filter the tasks inside the client component ---
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));
  const sevenDaysLater = new Date(new Date().setDate(new Date().getDate() + 7));
  const todaysTasks = tasks.filter(task => task.deadline && new Date(task.deadline) >= todayStart && new Date(task.deadline) <= todayEnd);
  const upcomingDeadlines = tasks.filter(task => task.deadline && new Date(task.deadline) > todayEnd && new Date(task.deadline) <= sevenDaysLater);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Row 1: Large Productivity Trend Chart */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Productivity Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? <ProductivityTrendChart data={stats.productivityTrend} /> : <p>No data to display.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Today's Agenda and Quick Add Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Agenda</CardTitle>
          </CardHeader>
          <CardContent>
            {todaysTasks.length > 0 ? (
              <ul className="space-y-2">
                {todaysTasks.map(task => <li key={task._id}>{task.title}</li>)}
              </ul>
            ) : (
              <p className="text-muted-foreground">No tasks due today. Enjoy!</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-1 row-span-2">
        <QuickAddTaskForm />
      </div>

      {/* Row 3: Upcoming Deadlines */}
      <div className="lg:col-span-2">
         <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines (Next 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <ul className="space-y-2">
                {upcomingDeadlines.map(task => <li key={task._id}>{task.title}</li>)}
              </ul>
            ) : (
              <p className="text-muted-foreground">No deadlines in the coming week.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Final Two Charts */}
       <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? <TasksByCategoryChart data={stats.tasksByCategory} /> : <p>No data.</p>}
          </CardContent>
        </Card>
      </div>
       <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Summary (Created vs. Completed)</CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? <TasksByWeekChart data={stats.tasksByWeek} /> : <p>No data.</p>}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}