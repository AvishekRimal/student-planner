/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth } from "@/redux/hooks/useAuth";
import { Note } from "./NoteTable";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // <-- Import Textarea

// --- 1. UPDATE THE FORM TYPE ---
// Add 'content' to the form data shape
type FormInputs = {
  title: string;
  category: string;
  content: string; // The content of the note
};

interface EditNoteModalProps {
  note: Note;
  children: React.ReactNode;
  onNoteUpdated: () => void;
}

export function EditNoteModal({ note, children, onNoteUpdated }: EditNoteModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // --- 2. UPDATE useForm and defaultValues ---
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<FormInputs>({
    defaultValues: {
      title: note.title,
      category: note.category,
      content: note.content, // Pre-fill the content
    }
  });
  
  const { token } = useAuth();

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    try {
      // --- 3. UPDATE THE PAYLOAD ---
      // The payload now includes all fields
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notes/${note._id}`, {
        method: 'PUT',
        headers: { 'Content-type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update note");
      
      toast.success("Note updated successfully!");
      setIsOpen(false);
      onNoteUpdated();
      
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <span onClick={() => {
        reset({ // Reset the form to the note's current values every time it's opened
            title: note.title,
            category: note.category,
            content: note.content,
        });
        setIsOpen(true);
      }}>{children}</span>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>Make changes to your note below. Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
           <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title", { required: "Title is required" })} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            {/* --- 4. ADD THE CONTENT TEXTAREA --- */}
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                rows={10}
                {...register("content", { required: "Content is required" })}
              />
              {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" {...register("category")} />
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