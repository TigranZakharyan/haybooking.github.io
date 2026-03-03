import { Calendar } from "@/pages/DashboardPage/Calendar";
import { Filter } from "@/pages/DashboardPage/Filter";
import { useState, useEffect } from "react";
import { businessService, bookingService } from "../../services/api";
import { BookingCard } from "./BookingCard";
import { ChangeStatusModal } from "./ChangeStatusModal";
import type { TBooking, TBookingStatus, TBusiness } from "@/types";

interface FilterValues {
  branch: string;
  service: string;
  specialist: string;
  timeRange: { start: string; end: string };
  status: string;
}

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [business, setBusiness] = useState<TBusiness | null>(null);
  const [bookings, setBookings] = useState<TBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({
    branch: "all",
    service: "all",
    specialist: "all",
    timeRange: { start: "", end: "" },
    status: "all",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<TBooking | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const businessData = await businessService.getMyBusiness();
      setBusiness(businessData);
      await fetchBookings();
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const bookingsData = await bookingService.getBusinessBookings({});
      setBookings(bookingsData.bookings || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    }
  };

  const handleChangeStatus = (bookingId: string) => {
    const booking = bookings.find((b) => b._id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setIsModalOpen(true);
    }
  };

  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: TBookingStatus,
  ) => {
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      await fetchBookings();
    } catch (error) {
      console.error("Failed to update booking status:", error);
      throw error;
    }
  };

  const normalizeDate = (date: Date | string): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getBookingsForDate = (date: Date): TBooking[] => {
    if (!date) return [];
    const targetDateStr = normalizeDate(date);
    return bookings.filter(
      (booking) => normalizeDate(booking.bookingDate) === targetDateStr,
    );
  };

  const getBookingCountForDate = (date: Date): number => {
    return getBookingsForDate(date).length;
  };

  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = normalizeDate(booking.bookingDate);

    let dateMatch = true;
    if (selectedDate) {
      dateMatch = bookingDate === normalizeDate(selectedDate);
    }

    const branchMatch =
      filters.branch === "all" || booking.branch?._id === filters.branch;

    const statusMatch =
      filters.status === "all" || booking.status === filters.status;

    const serviceMatch =
      filters.service === "all" ||
      booking.services.find((e) => e._id === filters.service);

    const specialistMatch =
      filters.specialist === "all" ||
      booking.specialist?._id === filters.specialist;

    let timeMatch = true;
    if (filters.timeRange.start && filters.timeRange.end) {
      const bookingTime = timeToMinutes(booking.startTime);
      const startTime = timeToMinutes(filters.timeRange.start);
      const endTime = timeToMinutes(filters.timeRange.end);
      timeMatch = bookingTime >= startTime && bookingTime <= endTime;
    } else if (filters.timeRange.start) {
      timeMatch =
        timeToMinutes(booking.startTime) >=
        timeToMinutes(filters.timeRange.start);
    } else if (filters.timeRange.end) {
      timeMatch =
        timeToMinutes(booking.startTime) <=
        timeToMinutes(filters.timeRange.end);
    }

    return (
      dateMatch &&
      branchMatch &&
      statusMatch &&
      serviceMatch &&
      specialistMatch &&
      timeMatch
    );
  });

  const branches = business?.branches || [];
  const services = business?.services || [];
  const specialists = business?.specialists || [];

  const handleFilterChange = (newFilters: Partial<FilterValues>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_minmax(300px,350px)] gap-2">
        <div className="h-full flex flex-col gap-2 min-h-0">
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm min-h-0">
            
            {/* HEADER WITH CENTERED FILTER */}
            <div className="relative flex items-center justify-between p-6 border-b border-gray-100">
              
              {/* Left */}
              <div>
                <h2 className="text-2xl font-light text-gray-700">Bookings</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredBookings.length} booking
                  {filteredBookings.length !== 1 ? "s" : ""}
                  {selectedDate && (
                    <span className="ml-2 text-teal-600">
                      on {selectedDate.toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>

              {/* Center Filter */}
              <div className="absolute left-1/2 -translate-x-1/2">
                <Filter
                  branchOptions={[
                    { label: "All Branches", value: "all" },
                    ...branches.map((b) => ({
                      label:
                        b.address?.city ||
                        b.address?.street ||
                        "Branch",
                      value: b._id,
                    })),
                  ]}
                  serviceOptions={[
                    { label: "All Services", value: "all" },
                    ...services.map((s) => ({
                      label: s.name,
                      value: s._id,
                    })),
                  ]}
                  specialistOptions={[
                    { label: "All Specialists", value: "all" },
                    ...specialists.map((s) => ({
                      label: s.name,
                      value: s._id,
                    })),
                  ]}
                  onFilterChange={(filterValues) => {
                    handleFilterChange({
                      branch: filterValues.branch || "all",
                      service: filterValues.service || "all",
                      specialist: filterValues.specialist || "all",
                      timeRange:
                        filterValues.timeRange || { start: "", end: "" },
                    });
                  }}
                />
              </div>

              {/* Right spacer to balance layout */}
              <div className="w-[200px]" />
            </div>

            {/* BOOKINGS LIST */}
            <div className="flex-1 overflow-auto min-h-0 p-6">
              {filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-500 font-normal text-sm">
                    No bookings found
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedDate
                      ? "Try selecting a different date"
                      : "No bookings match your filters"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings
                    .sort((a, b) =>
                      a.startTime.localeCompare(b.startTime),
                    )
                    .map((booking) => (
                      <BookingCard
                        key={booking._id}
                        booking={booking}
                        onChangeStatus={handleChangeStatus}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="h-full flex flex-col bg-white/40 rounded-2xl p-4 overflow-auto">
          <h3 className="mb-3 font-medium text-text-body">Calendar</h3>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            getBookingCount={getBookingCountForDate}
            showGoToToday
            showShowAll
          />

          <div className="mt-6 pt-6 border-t space-y-3">
            <h3 className="font-medium text-text-body mb-3">Statistics</h3>
            <div className="flex justify-between text-sm">
              <span>Total Bookings</span>
              <span className="font-semibold">{bookings.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Today</span>
              <span className="font-semibold">
                {getBookingsForDate(new Date()).length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Filtered</span>
              <span className="font-semibold">
                {filteredBookings.length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pending</span>
              <span className="font-semibold text-yellow-600">
                {bookings.filter((b) => b.status === "pending").length}
              </span>
            </div>
          </div>
        </aside>
      </div>

      {isModalOpen && selectedBooking && (
        <ChangeStatusModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}