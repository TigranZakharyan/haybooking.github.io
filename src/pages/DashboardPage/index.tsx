import { Calendar } from "@/pages/DashboardPage/Calendar";
import { Filter } from "@/pages/DashboardPage/Filter";
import { useState, useEffect } from "react";
import { businessService, bookingService } from "../../services/api";
import { BookingCard } from "./BookingCard";
import { ChangeStatusModal } from "./ChangeStatusModal";
import type { TBooking, TBookingStatus, TBusiness } from "@/types";
import { Button } from "@/components";
import { Link } from "react-router-dom";

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

  // Date normalization to handle timezone issues
  const normalizeDate = (date: Date | string): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date): TBooking[] => {
    if (!date) return [];

    const targetDateStr = normalizeDate(date);

    return bookings.filter((booking) => {
      const bookingDateStr = normalizeDate(booking.bookingDate);
      return bookingDateStr === targetDateStr;
    });
  };

  const getBookingCountForDate = (date: Date): number => {
    return getBookingsForDate(date).length;
  };

  // Convert time string to minutes for comparison
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Filter bookings based on all criteria
  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = normalizeDate(booking.bookingDate);

    // Date filter - only apply if selectedDate is provided
    let dateMatch = true;
    if (selectedDate) {
      const selectedDateStr = normalizeDate(selectedDate);
      dateMatch = bookingDate === selectedDateStr;
    }

    // Branch filter
    const branchMatch =
      filters.branch === "all" || booking.branch?._id === filters.branch;

    // Status filter
    const statusMatch =
      filters.status === "all" || booking.status === filters.status;
    // Service filter
    const serviceMatch =
      filters.service === "all" ||
      booking.services.find((e) => e._id === filters.service);

    // Specialist filter
    const specialistMatch =
      filters.specialist === "all" ||
      booking.specialist?._id === filters.specialist;

    // Time range filter
    let timeMatch = true;
    if (filters.timeRange.start && filters.timeRange.end) {
      const bookingTime = timeToMinutes(booking.startTime);
      const startTime = timeToMinutes(filters.timeRange.start);
      const endTime = timeToMinutes(filters.timeRange.end);
      timeMatch = bookingTime >= startTime && bookingTime <= endTime;
    } else if (filters.timeRange.start) {
      const bookingTime = timeToMinutes(booking.startTime);
      const startTime = timeToMinutes(filters.timeRange.start);
      timeMatch = bookingTime >= startTime;
    } else if (filters.timeRange.end) {
      const bookingTime = timeToMinutes(booking.startTime);
      const endTime = timeToMinutes(filters.timeRange.end);
      timeMatch = bookingTime <= endTime;
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

  // Extract unique branches, services and specialists from business data
  const branches = business?.branches || [];
  const services = business?.services || [];
  const specialists = business?.specialists || [];

  const handleFilterChange = (newFilters: Partial<FilterValues>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const baseURL = window.location.protocol + "//" + window.location.hostname;

  const handleCopyLink = (link: string) => {
    try {
      navigator.clipboard.writeText(link);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

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
        {/* Left Column - Filter and Bookings */}
        <div className="h-full flex flex-col gap-2 min-h-0">
          {/* Filter Component - Fixed */}
          <div className="flex-shrink-0">
            <Filter
              branchOptions={[
                { label: "All Branches", value: "all" },
                ...branches.map((b) => ({
                  label: b.address?.city || b.address?.street || "Branch",
                  value: b._id,
                })),
              ]}
              serviceOptions={[
                { label: "All Services", value: "all" },
                ...services.map((s) => ({ label: s.name, value: s._id })),
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
                  timeRange: filterValues.timeRange || { start: "", end: "" },
                });
              }}
            />
          </div>

          <div className="flex justify-between items-center bg-primary/10 px-3 py-2 rounded-xl">
            <div>
              <h6>Booking Link:</h6>
              <Link to={"/business/" + business?.bookingLink || "#"} replace className="text-liberty">
                {baseURL}/business/{business?.bookingLink}
              </Link>
            </div>
            <Button variant="liberty" onClick={() => handleCopyLink(`${baseURL}/business/${business?.bookingLink}`)}>Copy</Button>
          </div>

          {/* Bookings List - Scrollable */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm min-h-0">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 p-6 border-b border-gray-100">
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

            {/* Cards Container - Scrollable */}
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
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
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

        {/* Right Column - Calendar and Stats - Fixed */}
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
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Bookings</span>
              <span className="font-semibold">{bookings.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Today</span>
              <span className="font-semibold">
                {getBookingsForDate(new Date()).length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Filtered Results</span>
              <span className="font-semibold">{filteredBookings.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">
                {bookings.filter((b) => b.status === "pending").length}
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Change Status Modal */}
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
