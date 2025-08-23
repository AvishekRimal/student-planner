/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/redux/hooks/useAuth";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { format } from "date-fns";
import { Task } from "./TaskTable";
import { toast } from "sonner"; // <-- Import toast

// (Import UI components)
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";


type FormInputs = {
  title: string;
  description: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  deadline?: Date;
};

interface EditTaskModalProps {
  task: Task;
  children: React.ReactNode;
}

export function EditTaskModal({ task, children }: EditTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  // We no longer need the 'apiError' state
  const router = useRouter();
  const { token } = useAuth();
  
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInputs>();

  // Use an effect to reset the form whenever the task prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        title: task.title,
        description: task.description || '',
        category: task.category,
        priority: task.priority,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
      });
    }
  }, [task, isOpen, reset]);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!token) {
      toast.error("Authentication error.");
      return;
    }

    try {
      const payload = {
        ...data,
        deadline: data.deadline ? data.deadline.toISOString() : undefined,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update task");
      }
      
      toast.success("Task updated successfully!");
      setIsOpen(false);
      router.refresh();

    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <span onClick={() => setIsOpen(true)}>{children}</span>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
             {/* Form fields are the same */}
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
                <option value="Medium">Medium</option><option value="High">High</option><option value="Low">Low</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">Deadline</Label>
              <Controller
                control={control} name="deadline"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className="col-span-3 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}