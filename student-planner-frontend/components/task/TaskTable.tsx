"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TaskActions } from "./TaskActions";
import { UpdateTaskStatus } from "./UpdateTaskStatus";

// We define and export the main Task interface here.
// This acts as a single source of truth for the shape of a task object
// that other components can import and use.
export interface Task {
  _id: string;
  title: string;
  description?: string; // Optional field
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  deadline?: string; // Optional field
  completed: boolean;
}

// The props for our table component take an array of tasks to display.
interface TaskTableProps {
  tasks: Task[];
}

export function TaskTable({ tasks }: TaskTableProps) {
  // A helper function to determine the Tailwind CSS classes for the priority badge.
  // This keeps the JSX clean.
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-[120px]">Priority</TableHead>
            <TableHead className="w-[150px]">Category</TableHead>
            <TableHead className="w-[150px]">Deadline</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => (
              <TableRow 
                key={task._id} 
                // Conditionally apply classes for visual feedback on completed tasks
                className={task.completed ? 'text-muted-foreground line-through' : ''}
              >
                <TableCell className="text-center">
                  {/* The interactive checkbox component */}
                  <UpdateTaskStatus task={task} />
                </TableCell>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <Badge className={getPriorityBadgeClass(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>{task.category}</TableCell>
                <TableCell>
                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {/* The '...' dropdown menu for edit/delete actions */}
                  <TaskActions task={task} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No tasks found. Get started by adding a new task!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}