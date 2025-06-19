'use client';

import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import ReactDatePicker from 'react-datepicker' // Renamed import to avoid conflict
import "react-datepicker/dist/react-datepicker.css"

interface DatePickerProps {
  id?: string;
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  required?: boolean;
}

export function DatePicker({ id, selected, onSelect, required }: DatePickerProps) {
  // Add this handler function to properly handle the type conversion
  const handleDateChange = (date: Date | null) => {
    // Convert null to undefined if needed
    onSelect(date || undefined);
  };

  return (
    <div className="relative">
      <ReactDatePicker
        id={id}
        selected={selected}
        onChange={handleDateChange} // Use our handler function
        dateFormat="dd/MM/yyyy"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        wrapperClassName="w-full"
        required={required}
      />
      <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
    </div>
  )
}
