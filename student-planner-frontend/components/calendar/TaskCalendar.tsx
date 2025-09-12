/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from 'react';
import { Calendar, Views, Event as CalendarEvent, ToolbarProps } from 'react-big-calendar';
import * as React from 'react'; // Import React for cloneElement

// Localizer and all our custom components
import { localizer } from './CalendarSetup';
import { CalendarToolbar } from './CalendarToolbar';
import { CalendarEvent as CustomEventComponent } from './CalendarEvent';
import { DateCellWrapper } from './DateCellWrapper'; // The new cell wrapper
import '@/app/calendar.css';

// Re-used components and types from other features

import { AddEditTaskModal } from './AddEditTaskModal';
import { Task } from '../task/TaskTable';
import { CustomDateHeader } from './CustomDateHeader';

interface TaskCalendarProps {
  tasks: Task[];
}

export function TaskCalendar({ tasks }: TaskCalendarProps) {
  // State for the Add/Edit modal
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    task?: Task | null;
    selectedDate?: Date | null;
  }>({ isOpen: false });

  // State to control the calendar's current date and view
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<any>(Views.MONTH);
  
  // --- NEW: State to manage the calendar type (AD or BS) ---
  const [calendarType, setCalendarType] = useState<'AD' | 'BS'>('AD');

  // Convert our tasks into the "event" format for the calendar
  const events: CalendarEvent[] = tasks
    .filter(task => task.deadline)
    .map(task => ({
      title: task.title,
      start: new Date(task.deadline!),
      end: new Date(task.deadline!),
      resource: task,
    }));

  // Handlers for opening the modal
  const handleSelectSlot = (slotInfo: { start: Date }) => { setModalState({ isOpen: true, selectedDate: slotInfo.start }); };
  const handleSelectEvent = (event: CalendarEvent) => { setModalState({ isOpen: true, task: event.resource }); };
  const closeModal = () => { setModalState({ isOpen: false }); };

  // Handlers to control the calendar state from our custom toolbar
  const handleNavigate = useCallback((newDate: Date) => setDate(newDate), [setDate]);
  const handleView = useCallback((newView: any) => setView(newView), [setView]);
  
  // Handler for the "+X more" link
  const handleShowMore = (events: CalendarEvent[], date: Date) => { setView(Views.DAY); setDate(date); };

  return (
    <div className="h-[80vh] bg-background p-4 rounded-lg border">
      <Calendar
        localizer={localizer}
        events={events}
        date={date}
        view={view}
        onNavigate={handleNavigate}
        onView={handleView}
        onShowMore={handleShowMore}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        selectable
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        
        // --- THIS IS THE KEY UPDATE ---
        // We are passing all the necessary state and handlers to our custom components
        components={{
          toolbar: (props: ToolbarProps) => (
            <CalendarToolbar 
              {...props} 
              calendarType={calendarType}
              onCalendarTypeChange={setCalendarType}
            />
          ),
          event: CustomEventComponent,
          // Tell the calendar to use our custom wrapper for each date cell
          month: {
        dateHeader: (props) => (
          <CustomDateHeader 
            {...props} 
            calendarType={calendarType} 
          />
        ),
      },
    }}
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