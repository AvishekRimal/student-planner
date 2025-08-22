"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/redux/hooks/useAuth";
import { useForm, SubmitHandler } from "react-hook-form";
import { Task } from "./TaskTable"; // Import the Task type

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// The form data shape is the same
type FormInputs = {
  title: string;
  description: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
};



// --- DIFFERENCE: This component now accepts the task to be edited as a prop ---
interface EditTaskModalProps {
  task: Task;
  children: React.ReactNode; // The trigger component (e.g., the DropdownMenuItem)
}

export function EditTaskModal({ task, children }: EditTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const { token } = useAuth();
  
  // --- DIFFERENCE: We pre-fill the form with the task's data ---
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInputs>({
    defaultValues: {
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
    }
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setApiError(null);
    if (!token) {
      setApiError("Authentication error.");
      return;
    }

    try {
      // --- DIFFERENCE: The API endpoint and method are for updating ---
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks/${task._id}`, {
        method: 'PUT', // Use PUT for updating
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update task");
      }

      setIsOpen(false);
      router.refresh();

    } catch (err: any) {
      setApiError(err.message);
    }
  };

  return (
    // We remove DialogTrigger and wrap the component with a Dialog tag
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* The trigger is now passed in as a child prop */}
      <span onClick={() => setIsOpen(true)}>{children}</span>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* The form fields are identical to the AddTaskModal */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" {...register("title", { required: "Title is required" })} className="col-span-3" />
            </div>
            {errors.title && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.title.message}</p>}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" {...register("description")} className="col-span-3" />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Input id="category" {...register("category")} className="col-span-3" />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">Priority</Label>
              <select id="priority" {...register("priority")} className="col-span-3 border rounded p-2 bg-background">
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          {apiError && <p className="text-sm text-destructive">{apiError}</p>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={() => reset()}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}