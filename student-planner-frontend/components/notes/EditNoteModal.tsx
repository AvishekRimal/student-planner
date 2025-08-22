"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/redux/hooks/useAuth";
import { useForm, SubmitHandler } from "react-hook-form";
import { Note } from "./NoteTable";
// (Import UI components)
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormInputs = {
  title: string;
  content: string;
  category: string;
};

interface EditNoteModalProps {
  note: Note;
  children: React.ReactNode;
}

export function EditNoteModal({ note, children }: EditNoteModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormInputs>({
    defaultValues: {
      title: note.title,
      content: note.content,
      category: note.category,
    }
  });
  const router = useRouter();
  const { token } = useAuth();

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notes/${note._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update note");
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <span onClick={() => setIsOpen(true)}>{children}</span>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
           <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title", { required: "Title is required" })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" {...register("content", { required: "Content is required" })} rows={10} />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" {...register("category")} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary" onClick={() => reset()}>Cancel</Button></DialogClose>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}