"use client";

import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface CalendarProps {
  onDateChange?: (date: Date) => void;
  initialDate?: Date;
}

export default function DiaryCalendar({ onDateChange, initialDate = new Date() }: CalendarProps) {
  const [value, setValue] = useState<Value>(initialDate);

  const handleDateChange = (newValue: Value) => {
    setValue(newValue);
    if (newValue instanceof Date && onDateChange) {
      onDateChange(newValue);
    }
  };

  return (
    <div className="bg-[#242429] rounded-lg p-6">
      <Calendar
        onChange={handleDateChange}
        value={value}
        className="w-full border-none bg-transparent text-white"
        maxDetail="month"
        minDetail="month"
        showNavigation={true}
        showNeighboringMonth={false}
        tileClassName="hover:bg-[#34343A] transition-colors"
        navigationLabel={({ date }) => 
          date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
        }
        formatDay={(locale, date) => date.getDate().toString()}
        view="month"
      />

      <style jsx global>{`
        .react-calendar {
          background: transparent !important;
          border: none !important;
          font-family: inherit !important;
        }
        
        .react-calendar__navigation {
          background: transparent !important;
          border: none !important;
          margin-bottom: 1rem !important;
          min-height: 2.5rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 0 1rem !important;
        }
        
        .react-calendar__navigation button {
          background: transparent !important;
          border: none !important;
          color: white !important;
          font-size: 0.9rem !important;
          font-weight: 600 !important;
          padding: 0.5rem !important;
          border-radius: 0.5rem !important;
          transition: background-color 0.2s !important;
          white-space: nowrap !important;
          min-width: 2rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .react-calendar__navigation button:hover {
          background: #34343A !important;
        }
        
        .react-calendar__navigation button:disabled {
          background: transparent !important;
          color: #666 !important;
        }
        
        .react-calendar__month-view__weekdays {
          background: transparent !important;
          border: none !important;
          margin-bottom: 0.5rem !important;
        }
        
        .react-calendar__month-view__weekdays__weekday {
          background: transparent !important;
          border: none !important;
          color: #999 !important;
          font-weight: 500 !important;
          padding: 0.5rem !important;
          text-align: center !important;
        }
        
        .react-calendar__month-view__days {
          background: transparent !important;
          border: none !important;
        }
        
        .react-calendar__tile {
          background: transparent !important;
          border: none !important;
          color: white !important;
          font-size: 1rem !important;
          padding: 0.75rem !important;
          border-radius: 0.5rem !important;
          transition: background-color 0.2s !important;
          text-align: center !important;
        }
        
        .react-calendar__tile:hover {
          background: #34343A !important;
        }
        
        .react-calendar__tile--active {
          background: #16a34a !important;
          color: white !important;
        }
        
        .react-calendar__tile--now {
          background: #404040 !important;
          color: white !important;
        }
        
        .react-calendar__tile--neighboringMonth {
          color: #666 !important;
        }
      `}</style>
    </div>
  );
}
