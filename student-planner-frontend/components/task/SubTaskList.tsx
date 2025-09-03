/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/redux/hooks/useAuth';
import { toast } from 'sonner';
import { SubTask } from './TaskTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';

interface SubTaskListProps {
  taskId: string;
  initialSubTasks: SubTask[];
  // We no longer need the onSubTaskChange callback
}

export function SubTaskList({ taskId, initialSubTasks }: SubTaskListProps) {
  const [subTasks, setSubTasks] = useState(initialSubTasks);
  const [newSubTaskText, setNewSubTaskText] = useState('');
  const { token } = useAuth();
  
  // This effect correctly syncs the state if the modal is re-opened with new data
  useEffect(() => {
    setSubTasks(initialSubTasks);
  }, [initialSubTasks]);
  
  // --- NEW LOGIC: OPTIMISTIC UI UPDATES ---

  const handleAddSubTask = async () => {
    if (!newSubTaskText.trim() || !token) return;

    // 1. Create a temporary "optimistic" sub-task object for instant UI feedback
    const optimisticSubTask: SubTask = {
      _id: `temp-${Date.now()}`, // A temporary, unique ID
      text: newSubTaskText,
      completed: false,
    };

    // 2. Update the UI IMMEDIATELY with the optimistic data
    setSubTasks(prevSubTasks => [...prevSubTasks, optimisticSubTask]);
    const originalText = newSubTaskText;
    setNewSubTaskText(''); // Clear the input right away

    try {
      // 3. Make the real API call in the background
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: originalText }),
      });

      if (!res.ok) throw new Error("Failed to add sub-task");

      // 4. If the API call succeeds, get the real sub-task from the server
      const newSubTaskFromServer = await res.json();
      toast.success("Sub-task added!");

      // Replace the temporary sub-task with the real one from the server (which has the correct _id)
      setSubTasks(prevSubTasks => 
        prevSubTasks.map(st => st._id === optimisticSubTask._id ? newSubTaskFromServer : st)
      );

    } catch (err: any) {
      toast.error(err.message);
      // 5. If the API call fails, roll back the UI change
      setSubTasks(prevSubTasks => prevSubTasks.filter(st => st._id !== optimisticSubTask._id));
    }
  };

  const handleToggleSubTask = async (subTaskToToggle: SubTask) => {
    // 1. Optimistically update the UI to feel instant
    setSubTasks(prev => prev.map(st => 
        st._id === subTaskToToggle._id ? { ...st, completed: !st.completed } : st
    ));

    try {
      // 2. Make the real API call in the background
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks/${taskId}/subtasks/${subTaskToToggle._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ completed: !subTaskToToggle.completed, text: subTaskToToggle.text }),
      });
    } catch (err: any) {
      toast.error("Failed to update status");
      // 3. If the API call fails, roll back the UI change to its original state
      setSubTasks(prev => prev.map(st => 
        st._id === subTaskToToggle._id ? { ...st, completed: subTaskToToggle.completed } : st
      ));
    }
  };

  const handleDeleteSubTask = async (subTaskId: string) => {
    const originalSubTasks = subTasks;
    // 1. Optimistically remove the sub-task from the UI
    setSubTasks(prev => prev.filter(st => st._id !== subTaskId));
    toast.success("Sub-task deleted!");

    try {
      // 2. Make the real API call in the background
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tasks/${taskId}/subtasks/${subTaskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed on server");
    } catch (err: any) {
      toast.error("Failed to delete, restoring sub-task.");
      // 3. If the API call fails, roll back the UI change
      setSubTasks(originalSubTasks);
    }
  };
  
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-left">Sub-tasks / Checklist</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {subTasks.map(sub => (
          <div key={sub._id} className="flex items-center gap-2 group">
            <Checkbox
              id={sub._id}
              checked={sub.completed}
              onCheckedChange={() => handleToggleSubTask(sub)}
            />
            <label htmlFor={sub._id} className={`flex-1 text-sm ${sub.completed ? 'line-through text-muted-foreground' : ''}`}>
              {sub.text}
            </label>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteSubTask(sub._id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input 
          value={newSubTaskText}
          onChange={(e) => setNewSubTaskText(e.target.value)}
          placeholder="Add a new item..."
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubTask(); } }}
        />
        <Button onClick={handleAddSubTask}>Add</Button>
      </div>
    </div>
  );
}