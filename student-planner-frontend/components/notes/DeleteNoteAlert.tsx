/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAuth } from '@/redux/hooks/useAuth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DeleteNoteAlertProps { noteId: string; children: React.ReactNode; onNoteDeleted: () => void; }

export function DeleteNoteAlert({ noteId, children, onNoteDeleted }: DeleteNoteAlertProps) {
  const { token } = useAuth();
  const handleDelete = async () => {
    if (!token) { toast.error("Not authenticated"); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete the note.');
      toast.success("Note deleted successfully!");
      onNoteDeleted(); // <-- Call the callback to refetch
    } catch (err: any) { toast.error(err.message); }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}