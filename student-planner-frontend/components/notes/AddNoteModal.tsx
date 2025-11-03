/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth } from "@/redux/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";

type FormInputs = {
  title: string;
  content: string;
  category: string;
};

interface AddNoteModalProps {
  onNoteAdded: () => void;
}

export function AddNoteModal({ onNoteAdded }: AddNoteModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInputs>({
    defaultValues: { category: 'General', content: '' }
  });
  const { token } = useAuth();
  
  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!token) { toast.error("Not authenticated"); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create note");
      toast.success("Note created successfully!");
      reset();
      setIsOpen(false);
      onNoteAdded();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Note</Button>
      </DialogTrigger>
      {/* 1. Modal is a flex column with a max height */}
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add a New Note</DialogTitle>
          <DialogDescription>Fill in the details for your new note below.</DialogDescription>
        </DialogHeader>
        
        {/* 2. Form takes up the remaining space and is also a flex column */}
        <form 
          id="add-note-form" 
          onSubmit={handleSubmit(onSubmit)} 
          className="flex-1 flex flex-col gap-4 overflow-y-hidden py-4"
        >
          <div className="grid gap-2 shrink-0">
            <Label htmlFor="title">Title*</Label>
            <Input id="title" {...register("title", { required: "Title is required" })} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* 3. This container is the only one that grows and shrinks */}
          <div className="grid gap-2 flex-1 min-h-0">
            <Label htmlFor="content">Content*</Label>
            {/* 4. Textarea fills its container and scrolls internally */}
            <Textarea
              id="content"
              placeholder="Start writing your note here..."
              className="h-full resize-none" // <-- Important: Fill height and disable manual resize
              {...register("content")}
            />
          </div>

          <div className="grid gap-2 shrink-0">
            <Label htmlFor="category">Category</Label>
            <Input id="category" {...register("category")} />
          </div>
        </form>

        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
          <Button type="submit" form="add-note-form" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}