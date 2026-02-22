import { Calendar } from "@/pages/DashboardPage/Calendar";
import { Filter } from "@/pages/DashboardPage/Filter";
import { useState, useEffect } from "react";
import { businessService, bookingService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { User, Settings, Copy, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Types
interface Booking {
  _id: string;
  bookingDate: string | Date;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  customerInfo?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  };
  service?: {
    _id: string;
    name: string;
  };
  specialist?: {
    _id: string;
    name: string;
  };
  price?: {
    amount: number;
  };
  notes?: string;
  isGuestBooking?: boolean;
}

interface Business {
  businessName: string;
  bookingLink: string;
}

interface FilterValues {
  branch: string;
  service: string;
  specialist: string;
  date: string;
  status: string;
  timeRange: { start: string; end: string };
  priceRange: { min: string; max: string };
}

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({
    branch: "all",
    service: "all",
    specialist: "all",
    date: "all",
    status: "all",
    timeRange: { start: "", end: "" },
    priceRange: { min: "", max: "" },
  });

  const { user } = useAuth();
  const navigate = useNavigate();

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

  const copyBookingLink = () => {
    if (business?.bookingLink) {
      const link = `${window.location.origin}/book/${business.bookingLink}`;
      navigator.clipboard.writeText(link);
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
  const getBookingsForDate = (date: Date): Booking[] => {
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

    // Status filter
    const statusMatch =
      filters.status === "all" || booking.status === filters.status;

    // Service filter
    const serviceMatch =
      filters.service === "all" ||
      booking.service?._id === filters.service ||
      booking.service === filters.service;

    // Specialist filter
    const specialistMatch =
      filters.specialist === "all" ||
      booking.specialist?._id === filters.specialist ||
      booking.specialist === filters.specialist;

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

    // Price range filter
    let priceMatch = true;
    const price = booking.price?.amount || 0;
    if (filters.priceRange.min && filters.priceRange.max) {
      priceMatch =
        price >= parseFloat(filters.priceRange.min) &&
        price <= parseFloat(filters.priceRange.max);
    } else if (filters.priceRange.min) {
      priceMatch = price >= parseFloat(filters.priceRange.min);
    } else if (filters.priceRange.max) {
      priceMatch = price <= parseFloat(filters.priceRange.max);
    }

    return (
      dateMatch &&
      statusMatch &&
      serviceMatch &&
      specialistMatch &&
      timeMatch &&
      priceMatch
    );
  });

  // Extract unique services and specialists
  const uniqueServices = [
    ...new Map(
      bookings.filter((b) => b.service).map((b) => [b.service!._id, b.service]),
    ).values(),
  ];

  const uniqueSpecialists = [
    ...new Map(
      bookings
        .filter((b) => b.specialist)
        .map((b) => [b.specialist!._id, b.specialist]),
    ).values(),
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
      <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_minmax(300px,350px)] gap-6">
        {/* Left Column - Filter and Bookings */}
        <div className="h-full flex flex-col gap-6 min-h-0">
          {/* Filter Component - Fixed */}
          <div className="flex-shrink-0">
            <Filter
              branchOptions={[{ label: "All Branches", value: "all" }]}
              serviceOptions={[
                { label: "All Services", value: "all" },
                ...uniqueServices.map((s) => ({ label: s!.name, value: s!._id })),
              ]}
              specialistOptions={[
                { label: "All Specialists", value: "all" },
                ...uniqueSpecialists.map((s) => ({
                  label: s!.name,
                  value: s!._id,
                })),
              ]}
              dateOptions={[
                { label: "All Dates", value: "all" },
                { label: "Today", value: "today" },
                { label: "Tomorrow", value: "tomorrow" },
              ]}
              onBook={(filterValues) => {
                handleFilterChange({
                  service: filterValues.service || "all",
                  specialist: filterValues.specialist || "all",
                  date: filterValues.date || "all",
                });
              }}
            />
          </div>

          {/* Bookings List - Scrollable */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm min-h-0">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 p-6 border-b border-gray-100">
              <h2 className="text-2xl font-light text-gray-700">
                Bookings List
              </h2>
            </div>

            {/* Table Container - Scrollable */}
            <div className="flex-1 overflow-auto min-h-0">
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-normal text-gray-500">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-normal text-gray-500">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-normal text-gray-500">
                      Specialist
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-normal text-gray-500">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-normal text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="text-gray-500 font-normal text-sm">
                          No bookings found
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {selectedDate
                            ? "Try selecting a different date"
                            : "No bookings match your filters"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredBookings
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((booking) => (
                        <tr
                          key={booking._id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          {/* Client */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-gray-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-normal text-gray-900 truncate">
                                  {booking.customerInfo?.firstName}{" "}
                                  {booking.customerInfo?.lastName}
                                </p>
                                {booking.isGuestBooking && (
                                  <p className="text-xs text-gray-400">Guest</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Service */}
                          <td className="px-6 py-4">
                            <div className="min-w-0">
                              <p className="text-sm font-normal text-gray-900 truncate">
                                {booking.service?.name || "Service"}
                              </p>
                              {booking.notes && (
                                <p className="text-xs text-gray-400 truncate">
                                  {booking.notes}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Specialist */}
                          <td className="px-6 py-4">
                            <div className="min-w-0">
                              <p className="text-sm font-normal text-gray-900 truncate">
                                {booking.specialist?.name || "Specialist"}
                              </p>
                              {booking.customerInfo?.phone && (
                                <p className="text-xs text-gray-400">
                                  {booking.customerInfo.phone}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4">
                            <p className="text-sm font-normal text-gray-900 whitespace-nowrap">
                              {new Date(booking.bookingDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}{" "}
                              at {booking.startTime}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-normal capitalize ${
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-700"
                                  : booking.status === "pending"
                                    ? "bg-orange-100 text-orange-700"
                                    : booking.status === "completed"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - Fixed */}
            {filteredBookings.length > 0 && (
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  1 - {Math.min(5, filteredBookings.length)} of{" "}
                  {filteredBookings.length}
                </p>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
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
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Confirmed</span>
              <span className="font-semibold text-green-600">
                {bookings.filter((b) => b.status === "confirmed").length}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}