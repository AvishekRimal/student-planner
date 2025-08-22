"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ToolbarProps } from 'react-big-calendar'; // Import the correct type for the props

// --- THIS IS THE KEY FIX ---
// By using the 'ToolbarProps' type, we get correct autocompletion and type safety.
// We destructure the functions and state we need directly from the props.
export function CalendarToolbar({ label, onNavigate, onView, view }: ToolbarProps) {

  return (
    <div className="p-2 mb-4 flex flex-col sm:flex-row items-center justify-between border-b gap-2 sm:gap-4">
      {/* Left side: Navigation Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => onNavigate('PREV')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={() => onNavigate('TODAY')}>
          Today
        </Button>
        <Button variant="outline" size="icon" onClick={() => onNavigate('NEXT')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Center: The current month/year label */}
      <div className="text-lg font-semibold text-foreground text-center">
        {label}
      </div>

      {/* Right side: View Switcher Buttons */}
      <div className="flex items-center gap-2">
        <Button variant={view === 'month' ? 'default' : 'outline'} onClick={() => onView('month')}>Month</Button>
        <Button variant={view === 'week' ? 'default' : 'outline'} onClick={() => onView('week')}>Week</Button>
        <Button variant={view === 'day' ? 'default' : 'outline'} onClick={() => onView('day')}>Day</Button>
      </div>
    </div>
  );
}