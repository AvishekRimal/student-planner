"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/redux/hooks/useAuth';
import { Task } from './TaskTable'; // Import our main Task interface

interface UpdateTaskStatusProps {
  task: Task;
}

export function UpdateTaskStatus({ task }: UpdateTaskStatusProps) {
  // useTransition is a React hook that allows us to show a pending state
  // without blocking the UI, making the app feel faster.
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { token } = useAuth();

  const handleStatusChange = async () => {
    if (!token) {
      console.error("No auth token found.");
      return;
    }

    startTransition(async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks/${task._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          // We send the OPPOSITE of the current completed status
          body: JSON.stringify({ completed: !task.completed }),
        });

        // Refresh the page to show the updated data
        router.refresh();
      } catch (error) {
        console.error("Failed to update task status:", error);
      }
    });
  };

  return (
    <input
      type="checkbox"
      checked={task.completed}
      onChange={handleStatusChange}
      disabled={isPending} // Disable the checkbox while the API call is in progress
      className={`h-4 w-4 ${isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    />
  );
}