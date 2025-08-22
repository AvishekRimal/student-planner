import { EventProps } from 'react-big-calendar';
import { Task } from '../task/TaskTable';


// A helper function to get a color based on priority
const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'High': return 'bg-red-500';
    case 'Medium': return 'bg-yellow-500';
    case 'Low': return 'bg-green-500';
    default: return 'bg-gray-400';
  }
};

export function CalendarEvent({ event }: EventProps) {
  // We get the full task object from the event's 'resource' property
  const task: Task = event.resource;
  
  return (
    <div className="flex items-center gap-2 h-full">
      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
      <span className="truncate">{event.title}</span>
    </div>
  );
}