/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/redux/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner"; // <-- Import toast

interface DeleteTaskAlertProps {
  taskId: string;
  children: React.ReactNode;
}

export function DeleteTaskAlert({ taskId, children }: DeleteTaskAlertProps) {
  // We no longer need the 'error' state
  const router = useRouter();
  const { token } = useAuth();

  const handleDelete = async () => {
    if (!token) {
      toast.error("You are not authenticated.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to delete the task.');
      }
      
      toast.success("Task deleted successfully!");
      router.refresh();

    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this task.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {/* We bind the onClick directly here */}
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}