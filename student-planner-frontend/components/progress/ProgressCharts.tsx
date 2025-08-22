"use client"; // <-- This is the most important part

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- Dynamically import the charts inside the Client Component ---
const TasksByWeekChart = dynamic(
  () => import('./TasksByWeekChart').then(mod => mod.TasksByWeekChart),
  { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center">Loading Chart...</div> }
);
const TasksByCategoryChart = dynamic(
  () => import('./TasksByCategoryChart').then(mod => mod.TasksByCategoryChart),
  { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center">Loading Chart...</div> }
);
const ProductivityTrendChart = dynamic(
  () => import('./ProductivityTrendChart').then(mod => mod.ProductivityTrendChart),
  { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center">Loading Chart...</div> }
);

// This component receives the server-fetched data as props
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProgressCharts({ stats }: { stats: any }) {
  if (!stats) {
    return <p className="text-muted-foreground">Could not load statistics.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Productivity Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductivityTrendChart data={stats.productivityTrend} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tasks by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <TasksByCategoryChart data={stats.tasksByCategory} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <TasksByWeekChart data={stats.tasksByWeek} />
        </CardContent>
      </Card>
    </div>
  );
}