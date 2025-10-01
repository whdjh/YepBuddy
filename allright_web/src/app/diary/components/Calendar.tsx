"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { EventData } from '@/types/Diary';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface CalendarProps {
  onDateChange?: (date: Date) => void;
  initialDate?: Date;
}

export default function DiaryCalendar({ onDateChange, initialDate = new Date() }: CalendarProps) {
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate());
  
  const [value, setValue] = useState<Value>(initialDate || defaultDate);
  const [events, setEvents] = useState<EventData[]>([]);
  const router = useRouter();

  const handleDateChange = (newValue: Value) => {
    setValue(newValue);
    if (newValue instanceof Date && onDateChange) {
      onDateChange(newValue);
    }
  };

  const handleTileClick = (value: Date) => {
    const dateString = value.toISOString().split('T')[0];
    router.push(`/diary/${dateString}`);
  };

  const getEventsForDate = (date: Date) => {
    const adjustedDate = new Date(date);
    adjustedDate.setDate(date.getDate() + 1);
    const dateString = adjustedDate.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const dateEvents = getEventsForDate(date);
    const hasEvents = dateEvents.length > 0;
    
    return `hover:bg-[#34343A] transition-colors ${hasEvents ? 'relative' : ''}`;
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dateEvents = getEventsForDate(date);
    
    if (dateEvents.length === 0) return null;

    return (
      <div className="absolute bottom-0 left-0 right-0">
        {dateEvents.map((event) => (
          <div
            key={event.id}
            className="bg-green-600 text-white text-xs px-1 py-0.5 rounded-[0.3rem] truncate flex items-center justify-between"
            title={event.title}
          >
            <span>{event.title}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#242429] rounded-lg p-4 w-full flex flex-col items-center">
      <Calendar
        onChange={handleDateChange}
        value={value}
        className="w-full border-none bg-transparent text-white"
        maxDetail="month"
        minDetail="month"
        showNavigation={true}
        showNeighboringMonth={false}
        tileClassName={tileClassName}
        tileContent={tileContent}
        navigationLabel={({ date }) => 
          date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
        }
        formatDay={(_, date) => date.getDate().toString()}
        view="month"
        onClickDay={handleTileClick}
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
          font-size: 1.1rem !important;
          padding: 0rem 0.5rem 1rem 0.5rem !important;
          border-radius: 0.3rem !important;
          transition: background-color 0.2s !important;
          text-align: center !important;
          position: relative !important;
          min-height: 4rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .react-calendar__tile--active {
          background: #34343A !important;
          color: white !important;
        }
        
        .react-calendar__tile--neighboringMonth {
          color: #666 !important;
        }
      `}</style>
    </div>
  );
}
