"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NoteActions } from "./NoteActions";
 // We will create this next

export interface Note {
  _id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
}

interface NoteTableProps {
  notes: Note[];
}

export function NoteTable({ notes }: NoteTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes && notes.length > 0 ? (
            notes.map((note) => (
              <TableRow key={note._id}>
                <TableCell className="font-medium">{note.title}</TableCell>
                <TableCell>{note.category}</TableCell>
                <TableCell>{new Date(note.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <NoteActions note={note} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No notes found. Create your first note!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}