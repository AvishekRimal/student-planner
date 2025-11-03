// components/task/TaskTable.tsx

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
import { useMediaQuery } from "@/redux/hooks/useMediaQuery"; // Make sure this path is correct
import { TaskCard } from "./TaskCard"; // Import our new card component

// =================================================================================
// TYPE DEFINITIONS (Single source of truth)
// =================================================================================
export interface SubTask {
  _id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  _id:string;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  deadline?: string;
  completed: boolean;
  subTasks: SubTask[];
}

// Props for our responsive component
interface TaskTableProps {
  tasks: Task[];
}

// =================================================================================
// MAIN RESPONSIVE COMPONENT
// =================================================================================
export function TaskTable({ tasks }: TaskTableProps) {
  // This hook returns `true` if the screen is 768px or wider, `false` otherwise.
  const isDesktop = useMediaQuery("(min-width: 768px)");

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

  // --- RENDER LOGIC ---

  // If the screen is wide enough, render the full data table.
  if (isDesktop) {
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
                  className={task.completed ? 'text-muted-foreground line-through' : ''}
                >
                  <TableCell className="text-center">
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
                    <TaskActions task={task} onNoteActionComplete={() => {}} />
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

  // If the screen is narrow, render the mobile-friendly list of cards.
  return (
    <div className="space-y-4">
      {tasks && tasks.length > 0 ? (
        tasks.map((task) => (
          <TaskCard 
            key={task._id} 
            task={task} 
            onActionComplete={() => {}} 
          />
        ))
      ) : (
        <div className="py-12 text-center text-muted-foreground">
          <p>No tasks found. Get started by adding a new task!</p>
        </div>
      )}
    </div>
  );
}