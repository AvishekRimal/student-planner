/* eslint-disable @typescript-eslint/no-explicit-any */
import NepaliDate from 'nepali-date-converter';

// We need to extend the Date prototype to use the toNepaliDate method
// This is a requirement of the library.
if (!('toNepaliDate' in Date.prototype)) {
    Object.defineProperty(Date.prototype, 'toNepaliDate', {
        value: function() {
            return new NepaliDate(this);
        }
    });
}
// Add the declaration to the global scope to satisfy TypeScript
declare global {
    interface Date {
        toNepaliDate(): any;
    }
}

/**
 * Takes a standard JavaScript Date object (Gregorian) and returns
 * the corresponding day number of the Bikram Sambat calendar.
 * @param gregorianDate - The input Gregorian date.
 * @returns The day of the month (1-32) as a number.
 */
export function getNepaliDay(gregorianDate: Date): number {
    try {
        const nepaliDate = gregorianDate.toNepaliDate();
        return nepaliDate.getDate();
    } catch (e) {
        // Fallback in case of an error
        return gregorianDate.getDate();
    }
}