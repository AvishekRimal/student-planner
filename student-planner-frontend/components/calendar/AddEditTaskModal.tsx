"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/redux/hooks/useAuth';
import { useForm, SubmitHandler } from "react-hook-form";


import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Task } from '../task/TaskTable';

type FormInputs = {
  title: string;
  description: string;
  deadline: string;
};

interface AddEditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  selectedDate?: Date | null;
}

export function AddEditTaskModal({ isOpen, onClose, task, selectedDate }: AddEditTaskModalProps) {
  const router = useRouter();
  const { token } = useAuth();
  
  // A helper function to format date to YYYY-MM-DD for the input field
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormInputs>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      deadline: task?.deadline ? formatDateForInput(new Date(task.deadline)) : (selectedDate ? formatDateForInput(selectedDate) : ''),
    }
  });
  
  // This effect ensures the form resets when the modal is reopened with different data
  useEffect(() => {
    reset({
      title: task?.title || '',
      description: task?.description || '',
      deadline: task?.deadline ? formatDateForInput(new Date(task.deadline)) : (selectedDate ? formatDateForInput(selectedDate) : ''),
    });
  }, [task, selectedDate, reset]);
  

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!token) return;

    // Determine if we are editing (task exists) or creating (task is null)
    const isEditing = !!task;
    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks/${task._id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...data, deadline: new Date(data.deadline).toISOString() }),
      });

      if (!res.ok) throw new Error(isEditing ? "Failed to update task" : "Failed to create task");

      onClose(); // Close the modal on success
      router.refresh(); // Re-fetch all page data

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title", { required: "Title is required" })} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea id="description" {...register("description")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" {...register("deadline", { required: "Deadline is required" })} />
              {errors.deadline && <p className="text-sm text-destructive">{errors.deadline.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}