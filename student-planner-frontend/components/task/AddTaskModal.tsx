"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/redux/hooks/useAuth";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select
import { PlusCircle, CalendarIcon } from "lucide-react";

type FormInputs = {
  title: string;
  description: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low'; // Renamed for clarity to match the payload
  deadline?: Date;
};

export function AddTaskModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { token } = useAuth();

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInputs>({
    defaultValues: {
      priority: 'Medium',
      category: 'General',
      description: '',
    }
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!token) {
      toast.error("Authentication error. Please log in again.");
      return;
    }

    try {
      // The payload matches the form data structure directly now
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

      toast.success("Task created successfully!");
      reset();
      setIsOpen(false);
      router.refresh();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Task</Button>
      </DialogTrigger>
      {/* 1. Modal is a flex column with a max height */}
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add a New Task</DialogTitle>
        </DialogHeader>

        {/* 2. Form container takes up remaining space and handles scrolling */}
        <div className="flex-1 overflow-y-auto px-1">
          <form id="add-task-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
            
            {/* Title - now in a responsive vertical layout */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title*</Label>
              <Input id="title" {...register("title", { required: "Title is required" })} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} placeholder="Add more details about your task..." />
            </div>

            {/* Priority & Category (Side-by-side on desktop, stacked on mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Task Priority */}
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                   <Controller
                      control={control}
                      name="priority"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                </div>

                {/* Category */}
                <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" {...register("category")} />
                </div>
            </div>

            {/* Deadline */}
            <div className="grid gap-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Controller
                control={control}
                name="deadline"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className="w-full justify-start text-left font-normal">
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
          </form>
        </div>
        
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
          {/* 3. Button is linked to the form via ID */}
          <Button type="submit" form="add-task-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}