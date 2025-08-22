"use client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface ChartData {
  week: number;
  created: number;
  completed: number;
}

export function TasksByWeekChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="week" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Week ${value}`} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="created" fill="#adfa1d" name="Tasks Created" radius={[4, 4, 0, 0]} />
        <Bar dataKey="completed" fill="#2d22d4" name="Tasks Completed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}