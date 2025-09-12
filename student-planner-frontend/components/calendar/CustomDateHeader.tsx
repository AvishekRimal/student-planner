import { getNepaliDay } from "@/lib/dateUtils";

interface CustomDateHeaderProps {
  label: string;
  date: Date;
  calendarType: 'AD' | 'BS';
}

export function CustomDateHeader({ label, date, calendarType }: CustomDateHeaderProps) {
  // In month view, 'label' is the day number as a string.
  // We will replace it with our own logic.
  const dayNumber = calendarType === 'BS' ? getNepaliDay(date) : date.getDate();

  return (
    <a href="#">{dayNumber}</a>
  );
}