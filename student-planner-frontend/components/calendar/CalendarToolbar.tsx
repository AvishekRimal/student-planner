// "use client";

// import { Button } from "@/components/ui/button";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { ToolbarProps } from 'react-big-calendar'; // Import the correct type for the props

// // --- THIS IS THE KEY FIX ---
// // By using the 'ToolbarProps' type, we get correct autocompletion and type safety.
// // We destructure the functions and state we need directly from the props.
// export function CalendarToolbar({ label, onNavigate, onView, view }: ToolbarProps) {

//   return (
//     <div className="p-2 mb-4 flex flex-col sm:flex-row items-center justify-between border-b gap-2 sm:gap-4">
//       {/* Left side: Navigation Buttons */}
//       <div className="flex items-center gap-2">
//         <Button variant="outline" size="icon" onClick={() => onNavigate('PREV')}>
//           <ChevronLeft className="h-4 w-4" />
//         </Button>
//         <Button variant="outline" onClick={() => onNavigate('TODAY')}>
//           Today
//         </Button>
//         <Button variant="outline" size="icon" onClick={() => onNavigate('NEXT')}>
//           <ChevronRight className="h-4 w-4" />
//         </Button>
//       </div>

//       {/* Center: The current month/year label */}
//       <div className="text-lg font-semibold text-foreground text-center">
//         {label}
//       </div>

//       {/* Right side: View Switcher Buttons */}
//       <div className="flex items-center gap-2">
//         <Button variant={view === 'month' ? 'default' : 'outline'} onClick={() => onView('month')}>Month</Button>
//         <Button variant={view === 'week' ? 'default' : 'outline'} onClick={() => onView('week')}>Week</Button>
//         <Button variant={view === 'day' ? 'default' : 'outline'} onClick={() => onView('day')}>Day</Button>
//       </div>
//     </div>
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ToolbarProps } from 'react-big-calendar';

// --- 1. DEFINE THE NEW PROPS ---
// We extend the default ToolbarProps to include our custom state and handler.
interface CustomToolbarProps extends ToolbarProps {
  calendarType: 'AD' | 'BS';
  onCalendarTypeChange: (type: 'AD' | 'BS') => void;
}

export function CalendarToolbar({ 
    label, 
    onNavigate, 
    onView, 
    view, 
    calendarType, 
    onCalendarTypeChange 
}: CustomToolbarProps) {

  return (
    <div className="p-2 mb-4 flex flex-col sm:flex-row items-center justify-between border-b gap-4">
      
      {/* --- 2. ADD THE NEW BS/AD SWITCH --- */}
      {/* This is a button group for switching the calendar type. */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-md order-1 sm:order-none">
         <Button 
            size="sm"
            // The button is highlighted ('default') if its type matches the current state
            variant={calendarType === 'AD' ? 'default' : 'ghost'} 
            onClick={() => onCalendarTypeChange('AD')}
        >
            AD
        </Button>
         <Button 
            size="sm"
            variant={calendarType === 'BS' ? 'default' : 'ghost'} 
            onClick={() => onCalendarTypeChange('BS')}
        >
            BS
        </Button>
      </div>

      {/* Navigation Buttons (Back, Today, Next) */}
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

      {/* The current month/year label */}
      <div className="text-lg font-semibold text-foreground text-center">
        {label}
      </div>

      {/* View Switcher Buttons (Month, Week, Day) */}
      <div className="flex items-center gap-2">
        <Button variant={view === 'month' ? 'default' : 'outline'} onClick={() => onView('month')}>Month</Button>
        <Button variant={view === 'week' ? 'default' : 'outline'} onClick={() => onView('week')}>Week</Button>
        <Button variant={view === 'day' ? 'default' : 'outline'} onClick={() => onView('day')}>Day</Button>
      </div>
    </div>
  );
}