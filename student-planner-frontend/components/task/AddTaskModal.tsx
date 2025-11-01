// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/redux/hooks/useAuth";
// import { useForm, SubmitHandler, Controller } from "react-hook-form";
// import { format } from "date-fns";
// import { toast } from "sonner"; // <-- 1. Import the toast function

// // (Import UI components)
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { PlusCircle, CalendarIcon } from "lucide-react";

// type FormInputs = {
//   title: string;
//   description: string;
//   category: string;
//   priority: 'High' | 'Medium' | 'Low';
//   deadline?: Date;
// };

// export function AddTaskModal() {
//   const [isOpen, setIsOpen] = useState(false);
//   // We no longer need the 'apiError' state, toasts will handle it.
//   const router = useRouter();
//   const { token } = useAuth();
  
//   const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInputs>({
//     defaultValues: {
//       priority: 'Medium',
//       category: 'General',
//     }
//   });

//   const onSubmit: SubmitHandler<FormInputs> = async (data) => {
//     if (!token) {
//       toast.error("Authentication error. Please log in again.");
//       return;
//     }

//     try {
//       const payload = {
//         ...data,
//         deadline: data.deadline ? data.deadline.toISOString() : undefined,
//       };

//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks`, {
//         method: 'POST',
//         headers: { 
//           'Accept': 'application/json',
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to create task");
//       }

//       // --- 2. Show SUCCESS toast ---
//       toast.success("Task created successfully!");

//       reset();
//       setIsOpen(false);
//       router.refresh();

//     } catch (err: any) {
//       // --- 3. Show ERROR toast ---
//       toast.error(err.message);
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Task</Button>
//       </DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Add a New Task</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <div className="grid gap-4 py-4">
//             {/* (All form fields remain the same) */}
//             {/* ... title, description, category, priority, deadline ... */}
//              <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="title" className="text-right">Title</Label>
//               <Input id="title" {...register("title", { required: "Title is required" })} className="col-span-3" />
//             </div>
//             {errors.title && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.title.message}</p>}
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="description" className="text-right">Description</Label>
//               <Textarea id="description" {...register("description")} className="col-span-3" />
//             </div>
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="category" className="text-right">Category</Label>
//               <Input id="category" {...register("category")} className="col-span-3" />
//             </div>
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="priority" className="text-right">Priority</Label>
//               <select id="priority" {...register("priority")} className="col-span-3 border rounded p-2 bg-background">
//                 <option value="Medium">Medium</option>
//                 <option value="High">High</option>
//                 <option value="Low">Low</option>
//               </select>
//             </div>
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="deadline" className="text-right">Deadline</Label>
//               <Controller
//                 control={control}
//                 name="deadline"
//                 render={({ field }) => (
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <Button variant={"outline"} className="col-span-3 justify-start text-left font-normal">
//                         <CalendarIcon className="mr-2 h-4 w-4" />
//                         {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
//                       </Button>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0">
//                       <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
//                     </PopoverContent>
//                   </Popover>
//                 )}
//               />
//             </div>
//           </div>
//           {/* We can remove the old apiError text */}
//           <DialogFooter>
//             <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
//             <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Task"}</Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

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
import { PlusCircle, CalendarIcon } from "lucide-react";

type FormInputs = {
  title: string;
  description: string;
  category: string;
  taskPriority: 'High' | 'Medium' | 'Low';
  deadline?: Date;
};

export function AddTaskModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { token } = useAuth();

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInputs>({
    defaultValues: {
      taskPriority: 'Medium',
      category: 'General',
    }
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!token) {
      toast.error("Authentication error. Please log in again.");
      return;
    }

    try {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" {...register("title", { required: "Title is required" })} className="col-span-3" />
            </div>
            {errors.title && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.title.message}</p>}

            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" {...register("description")} className="col-span-3" />
            </div>

            {/* Category */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Input id="category" {...register("category")} className="col-span-3" />
            </div>

            {/* Task Priority */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taskPriority" className="text-right">Priority</Label>
              <select id="taskPriority" {...register("taskPriority")} className="col-span-3 border rounded p-2 bg-background">
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Deadline */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">Deadline</Label>
              <Controller
                control={control}
                name="deadline"
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
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
