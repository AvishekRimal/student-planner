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
import { Textarea } from "@/components/ui/textarea"; // <-- Make sure Textarea is imported
import { PlusCircle } from "lucide-react";

type FormInputs = {
  title: string;
  content: string; // Content is already in our type
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Note</DialogTitle>
          <DialogDescription>Fill in the details for your new note below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title*</Label>
              <Input id="title" {...register("title", { required: "Title is required" })} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            {/* --- THIS IS THE NEW PART --- */}
            <div className="grid gap-2">
              <Label htmlFor="content">Content*</Label>
              <Textarea
                id="content"
                placeholder="Start writing your note here..."
                rows={5}
                {...register("content")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" {...register("category")} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Note"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}