import { Calendar } from "@/pages/DashboardPage/Calendar";
import { useState } from "react";

const mockBookings = [
  { id: "1", date: "2026-02-14" },
  { id: "2", date: "2026-02-14" },
  { id: "3", date: "2026-02-20" },
  { id: "4", date: "2026-02-25" },
];

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getBookingCountForDate = (date: Date) => {
    const formatted = date.toISOString().split("T")[0];

    return mockBookings.filter((booking) => booking.date === formatted).length;
  };

  return (
    <div className="h-full grid grid-cols-[1fr_minmax(300px,350px)]">
      <div></div>
      <aside className="h-full bg-white/40 rounded-2xl p-4">
        <h3 className="mb-3 font-medium text-text-body">Calendar</h3>
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          getBookingCount={getBookingCountForDate}
          showGoToToday
          showShowAll
        />
      </aside>
    </div>
  );
}
