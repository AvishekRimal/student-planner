/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from 'react';
import { Calendar, Views, Event as CalendarEvent, ToolbarProps } from 'react-big-calendar';

// Localizer and custom styling/components
import { localizer } from './CalendarSetup';
import { CalendarToolbar } from './CalendarToolbar'; // The custom, functional toolbar
import { CalendarEvent as CalendarEventComponent } from './CalendarEvent';     // The custom component for rendering events
import '@/app/calendar.css';                       // The dedicated stylesheet for the calendar

// Re-used components and types
        // The main Task interface
import { AddEditTaskModal } from './AddEditTaskModal'; // The modal for CRUD operations
import { Task } from '../task/TaskTable';

interface TaskCalendarProps {
  // This component receives the list of tasks fetched from the server page
  tasks: Task[];
}

export function TaskCalendar({ tasks }: TaskCalendarProps) {
  // State to manage the Add/Edit modal's visibility and the data it needs
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    task?: Task | null;
    selectedDate?: Date | null;
  }>({ isOpen: false, task: null, selectedDate: null });

  // --- NEW: State to manage the calendar's current date and view ---
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<any>(Views.MONTH);

  // Convert our tasks array into the "event" array that react-big-calendar requires
  const events: CalendarEvent[] = tasks
    .filter(task => task.deadline)
    .map(task => ({
      title: task.title,
      start: new Date(task.deadline!),
      end: new Date(task.deadline!),
      resource: task,
    }));

  // Handlers for opening the Add/Edit modal
  const handleSelectSlot = (slotInfo: { start: Date }) => {
    setModalState({ isOpen: true, selectedDate: slotInfo.start, task: null });
  };
  const handleSelectEvent = (event: CalendarEvent) => {
    setModalState({ isOpen: true, task: event.resource, selectedDate: null });
  };
  const closeModal = () => {
    setModalState({ isOpen: false, task: null, selectedDate: null });
  };

  // --- NEW: Handlers for controlling the calendar's state ---
  // This is called when the user clicks 'next', 'back', or 'today' in our custom toolbar
  const handleNavigate = useCallback((newDate: Date) => setDate(newDate), [setDate]);
  
  // This is called when the user clicks 'month', 'week', or 'day' in our custom toolbar
  const handleView = useCallback((newView: any) => setView(newView), [setView]);

  // --- NEW: This is the fix for the "+X more" link ---
  // This function is called when the user clicks the "+X more" link
  const handleShowMore = (events: CalendarEvent[], date: Date) => {
    // When clicked, we programmatically switch to the 'day' view for that specific date
    setView(Views.DAY);

    setDate(date);
  };

  return (
    <div className="h-[80vh] bg-background p-4 rounded-lg border">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        selectable
        
        // --- UPDATED: Control the calendar's state from our component ---
        date={date}
        view={view}
        onNavigate={handleNavigate}
        onView={handleView}
        
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onShowMore={handleShowMore} // <-- This is the new prop for the fix

        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        
        components={{
          toolbar: (props: ToolbarProps) => <CalendarToolbar {...props} />,
          event: CalendarEventComponent,
        }}
        
        tooltipAccessor={(event: any) => `${event.resource.category} - ${event.resource.priority} Priority`}
      />
      
      {modalState.isOpen && (
         <AddEditTaskModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            task={modalState.task}
            selectedDate={modalState.selectedDate}
        />
      )}
    </div>
  );
}