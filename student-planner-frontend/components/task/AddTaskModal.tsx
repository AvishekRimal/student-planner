/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/redux/hooks/useAuth";
import { useForm, SubmitHandler, Controller } from "react-hook-form"; // Import Controller
import { format } from "date-fns"; // Package for formatting dates

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle, CalendarIcon } from "lucide-react";

// --- 1. UPDATE THE FORM TYPE ---
// Add 'deadline' to our form data shape. It's optional.
type FormInputs = {
  title: string;
  description: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  deadline?: Date; // The form will handle this as a Date object
};

export function AddTaskModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const { token } = useAuth();
  
  // Update useForm to include the Controller
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInputs>({
    defaultValues: {
      priority: 'Medium',
      category: 'General',
    }
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setApiError(null);
    if (!token) {
      setApiError("Authentication error. Please log in again.");
      return;
    }

    try {
      // --- 2. UPDATE THE PAYLOAD ---
      // If a deadline exists in the form data, convert it to a proper ISO string for the backend.
      // Otherwise, don't include it in the payload.
      const payload = {
        ...data,
        deadline: data.deadline ? data.deadline.toISOString() : undefined,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create task");
      }

      reset();
      setIsOpen(false);
      router.refresh();

    } catch (err: any) {
      setApiError(err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Task</DialogTitle>
          <DialogDescription>
            Fill in the details for your new task below. Click save when you&#39;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Title, Description, Category, Priority fields are unchanged */}
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
            
            {/* --- 3. ADD THE NEW DEADLINE FIELD UI --- */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">Deadline</Label>
              {/*
                Controller is a wrapper from react-hook-form used for custom components
                that don't have a standard 'register'.
              */}
              <Controller
                control={control}
                name="deadline"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="col-span-3 justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {/* If a date is selected, format it. Otherwise, show placeholder text. */}
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange} // This updates the form's state
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

          </div>
          {apiError && <p className="text-sm text-destructive">{apiError}</p>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={() => reset()}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}