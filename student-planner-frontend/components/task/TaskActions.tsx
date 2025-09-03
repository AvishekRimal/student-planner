"use client";

import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteTaskAlert } from "./DeleteTaskAlert";
import { EditTaskModal } from "./EditTaskModal"; // <-- Import the Edit Modal
import { Task } from "./TaskTable"; // <-- Import the Task type

interface TaskActionsProps {
  task: Task;
  onNoteActionComplete: () => void;
}

export function TaskActions({ task, onNoteActionComplete  }: TaskActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">

        {/* --- THIS IS THE NEW PART --- */}
        <EditTaskModal task={task} onTaskUpdated={onNoteActionComplete}>
          {/* The DropdownMenuItem is now the "trigger" for the modal */}
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
        </EditTaskModal>

        <DropdownMenuSeparator />
        
        <DeleteTaskAlert taskId={task._id}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DeleteTaskAlert>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}