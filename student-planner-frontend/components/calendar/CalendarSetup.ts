import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import {enUS} from 'date-fns/locale/en-US';

const locales = {
  'en-US': enUS,
};

// This sets up the calendar to use date-fns for all its date logic
export const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});