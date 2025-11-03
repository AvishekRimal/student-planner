// components/task/TaskCard.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { TaskActions } from "./TaskActions";
import { UpdateTaskStatus } from "./UpdateTaskStatus";
import { Task } from "./TaskTable"; // We'll import the type from our main component

interface TaskCardProps {
  task: Task;
  onActionComplete: () => void; // A function to refetch data after an action
}

export function TaskCard({ task, onActionComplete }: TaskCardProps) {
  // Helper to get the correct color for the priority badge
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500 hover:bg-red-600 text-secondary-foreground';
      case 'Medium':
        return 'bg-yellow-500 hover:bg-yellow-600 text-secondary-foreground';
      case 'Low':
        return 'bg-green-500 hover:bg-green-600 text-secondary-foreground';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-secondary-foreground';
    }
  };

  return (
    <div className={`relative flex flex-col gap-3 rounded-lg border p-4 ${task.completed ? 'text-muted-foreground bg-muted/50' : ''}`}>
      {/* The '...' actions menu in the top-right corner */}
      <div className="absolute top-3 right-3">
        <TaskActions task={task} onNoteActionComplete={onActionComplete} />
      </div>

      {/* Top section containing the checkbox and title */}
      <div className="flex items-start gap-3 pr-8">
        <div className="mt-1">
          <UpdateTaskStatus task={task} />
        </div>
        <h3 className={`font-semibold ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
      </div>
      
      {/* Bottom section with task details */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm pl-9"> {/* Aligned with title */}
        <Badge className={getPriorityBadgeClass(task.priority)}>
          {task.priority}
        </Badge>
        <div className="flex items-center">
          <span className="mr-1.5 text-muted-foreground">Category:</span>
          <span>{task.category}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-1.5 text-muted-foreground">Deadline:</span>
          <span>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}