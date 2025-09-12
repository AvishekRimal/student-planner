"use client";

import React from 'react';
import { getNepaliDay } from '@/lib/dateUtils';

interface DateCellWrapperProps {
  children: React.ReactNode;
  value: Date; // The Gregorian date for this cell
  calendarType: 'AD' | 'BS';
}

export function DateCellWrapper({ children, value, calendarType }: DateCellWrapperProps) {
  // The 'children' prop from react-big-calendar is the background div (e.g., the part that gets highlighted for 'today').
  // The default date number is actually rendered separately by the library.
  // Our goal is to render our OWN number on top of this background.
  
  // First, render the background div that the library provides.
  // This ensures that styling like the "today" highlight still works.
  const background = children;

  // Now, determine which date number to show.
  const dayNumber = calendarType === 'BS' ? getNepaliDay(value) : value.getDate();

  return (
    <div className="rbc-day-bg"> {/* We can use the library's class for consistency */}
      {/* 
        This is a bit of a trick. We let the library render its default background,
        but we ignore its default date number. We then render our OWN number inside
        our own link, which will appear on top.
      */}
      {background}
      <div className="rbc-date-cell">
        <a href="#" className="rbc-button-link">{dayNumber}</a>
      </div>
    </div>
  );
}