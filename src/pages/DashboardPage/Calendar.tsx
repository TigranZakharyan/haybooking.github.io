import { Button } from "@/components";
import { useState } from "react";

type BookingCalendarProps = {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  getBookingCount: (date: Date) => number;
  showGoToToday?: boolean;
  showShowAll?: boolean;
};

export function Calendar({
  selectedDate,
  onDateSelect,
  getBookingCount,
  showGoToToday,
  showShowAll,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  let startDay = firstDayOfMonth.getDay();
  startDay = (startDay + 6) % 7; // Monday = 0

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const goToPrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(today);
  };

  const showAllBookings = () => {
    onDateSelect(null);
  };

  const today = new Date();
  const isToday = (date: Date) => date.toDateString() === today.toDateString();

  const days = [];
  const totalCells = 42;

  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - startDay + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      days.push(<div key={`empty-${i}`} />);
    } else {
      const date = new Date(year, month, dayNumber);
      const count = getBookingCount(date);
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();
      const todayCell = isToday(date);

      days.push(
        <div key={dayNumber} className="flex items-center justify-center">
          <button
            onClick={() => onDateSelect(date)}
            className={`
              relative w-9 h-9 rounded-full flex items-center justify-center
              transition-all duration-150
              ${
                isSelected
                  ? "bg-primary text-white shadow-md"
                  : todayCell
                    ? "bg-rose-50 ring-1 ring-rose-200"
                    : "hover:bg-gray-50"
              }
            `}
          >
            {/* Day number */}
            <span
              className={`text-base font-bold leading-none ${
                isSelected
                  ? "text-white"
                  : todayCell
                    ? "text-primary"
                    : "text-gray-800"
              }`}
            >
              {dayNumber}
            </span>

            {/* Booking count badge — bottom-center, overlapping the circle edge */}
            {count > 0 && (
              <span
                className={`
                  absolute left-1/2 -translate-x-1/2
                  min-w-[16px] h-4 px-1
                  rounded-full flex items-center justify-center
                  text-[10px] font-bold leading-none
                  ${isSelected ? "bg-white text-primary -bottom-2" : "text-primary -bottom-1"}
                `}
              >
                {count}
              </span>
            )}
          </button>
        </div>
      );
    }
  }

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="w-full max-w-md bg-transparent rounded-2xl shadow-sm border border-gray-100 p-5 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={goToPrevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition hover:text-gray-800"
        >
          ←
        </button>
        <h2 className="font-semibold text-base tracking-wide">
          {currentMonth.toLocaleString("default", { month: "long" })} {year}
        </h2>
        <button
          onClick={goToNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition hover:text-gray-800"
        >
          →
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center mb-1">
        {weekdays.map((day) => (
          <div key={day} className="text-xs font-medium text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">{days}</div>

      {/* Footer */}
      <div className="flex justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
        {showGoToToday && (
          <Button variant="liberty" className="bg-primary flex-1" onClick={goToToday}>
            Today
          </Button>
        )}
        {showShowAll && (
          <Button variant="liberty" className="bg-gray-600 flex-1" onClick={showAllBookings}>
            Show All
          </Button>
        )}
      </div>
    </div>
  );
}