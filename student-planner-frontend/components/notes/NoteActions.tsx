"use client";

import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteNoteAlert } from "./DeleteNoteAlert";
import { EditNoteModal } from "./EditNoteModal";
import { Note } from "./NoteTable";

interface NoteActionsProps {
  note: Note;
}

export function NoteActions({ note }: NoteActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EditNoteModal note={note}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
        </EditNoteModal>
        <DropdownMenuSeparator />
        <DeleteNoteAlert noteId={note._id}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DeleteNoteAlert>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}