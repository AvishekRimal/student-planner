"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/redux/hooks/useAuth';
// --- THIS IS THE LINE TO FIX ---
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, // <-- ADD THIS TO THE IMPORT LIST
} from "@/components/ui/alert-dialog";

interface DeleteNoteAlertProps {
  noteId: string;
  children: React.ReactNode;
}

export function DeleteNoteAlert({ noteId, children }: DeleteNoteAlertProps) {
  const router = useRouter();
  const { token } = useAuth();

  const handleDelete = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete the note.');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this note.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}