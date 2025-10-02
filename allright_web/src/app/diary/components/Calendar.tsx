"use client";

import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface EventData {
  id: string
  date: string
  title: string
  color?: string
}

const events: EventData[] = [
  { id: "1", date: "2025-10-02", title: "하체, 유산소", color: "bg-[#a3167a]" },
]

export default function DiaryCalendar() {
  const router = useRouter();

  const getEventsForDate = (date: Date | undefined) => {
    if (!date) {
      return [];
    }

    const dateString = date.toLocaleDateString("sv-SE") 

    return events.filter((e) => e.date === dateString);
  }

  return (
    <div className="p-4">
      <Calendar
        mode="single"
        className="w-full"
        showOutsideDays={false}
        components={{
          DayButton: ({ day, modifiers, ...props }) => {
            const date = (day as any).date as Date;
            const dayEvents = getEventsForDate(date);
            const dateString = date.toLocaleDateString("sv-SE") 

            return (
              <button
                {...props}
                onClick={() => router.push(`/diary/${dateString}`)}
                className={cn(
                  "relative flex flex-col items-center w-full h-full px-1 py-1 text-sm rounded-md hover:bg-muted transition-colors"
                )}
              >
                {/* 날짜 */}
                <span className="mb-1">{date.getDate()}</span>

                {/* 이벤트 */}
                {dayEvents.length > 0 && (
                  <div className="flex flex-col gap-0.5 w-full">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "w-full truncate text-[0.65rem] px-1 py-0.5 rounded-full",
                          event.color || "bg-[#16a34a]"
                        )}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                )}
              </button>
            )
          },
        }}
      />
    </div>
  )
}
