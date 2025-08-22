"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/redux/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function QuickAddTaskForm() {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const { token } = useAuth(); // Get token from Redux for client-side API calls
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!title || !token) {
      setError('Title is required and you must be logged in.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add task");
      }

      setTitle(''); // Clear the input
      router.refresh(); // Re-fetch the server component data to show the new task
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Add Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-title">Title</Label>
            <Input 
              id="quick-title" 
              placeholder="e.g., Read chapter 4" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Add Task</Button>
        </form>
      </CardContent>
    </Card>
  );
}