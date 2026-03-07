import { Calendar } from "@/pages/DashboardPage/Calendar";
import { QuickBookingBar } from "@/pages/DashboardPage/QuickBookingBar";
import { Pagination } from "@/components/Pagination"; // adjust path as needed
import { useState, useEffect } from "react";
import { businessService, bookingService } from "../../services/api";
import { BookingCard } from "./BookingCard";
import { ChangeStatusModal } from "./ChangeStatusModal";
import { CalendarDays, SlidersHorizontal, X } from "lucide-react";
import type { TBooking, TBookingStatus, TBusiness, TPagination } from "@/types";
import { SectionTitle } from "@/components";

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
  const [pagination, setPagination] = useState<TPagination>({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({
    branch: "all", service: "all", specialist: "all",
    timeRange: { start: "", end: "" }, status: "all",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<TBooking | null>(null);
  const [mobileCalendarOpen, setMobileCalendarOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const businessData = await businessService.getMyBusiness();
      setBusiness(businessData);
      await fetchBookings(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (page = 1) => {
    try {
      console.log(page)
      const bookingsData = await bookingService.getBusinessBookings({ page });
      setBookings(bookingsData.bookings || []);
      if (bookingsData.pagination) {
        setPagination(bookingsData.pagination);
      }
    } catch (error) {
      console.error("Failed to load bookings:", error);
    }
  };

  const handlePageChange = (page: number) => {
    fetchBookings(page);
  };

  // ... rest of handlers unchanged
  const handleChangeStatus = (bookingId: string) => {
    const booking = bookings.find((b) => b._id === bookingId);
    if (booking) { setSelectedBooking(booking); setIsModalOpen(true); }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: TBookingStatus) => {
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      await fetchBookings(pagination.page);
    } catch (error) {
      console.error("Failed to update booking status:", error);
      throw error;
    }
  };

  const normalizeDate = (date: Date | string): string => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const getBookingsForDate = (date: Date) =>
    bookings.filter((b) => normalizeDate(b.bookingDate) === normalizeDate(date));

  const getBookingCountForDate = (date: Date) => getBookingsForDate(date).length;

  const timeToMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

  const filteredBookings = bookings.filter((booking) => {
    const dateMatch = selectedDate ? normalizeDate(booking.bookingDate) === normalizeDate(selectedDate) : true;
    const branchMatch = filters.branch === "all" || booking.branch?._id === filters.branch;
    const statusMatch = filters.status === "all" || booking.status === filters.status;
    const serviceMatch = filters.service === "all" || booking.services.find((e) => e._id === filters.service);
    const specialistMatch = filters.specialist === "all" || booking.specialist?._id === filters.specialist;
    let timeMatch = true;
    if (filters.timeRange.start && filters.timeRange.end) {
      const t = timeToMinutes(booking.startTime);
      timeMatch = t >= timeToMinutes(filters.timeRange.start) && t <= timeToMinutes(filters.timeRange.end);
    } else if (filters.timeRange.start) {
      timeMatch = timeToMinutes(booking.startTime) >= timeToMinutes(filters.timeRange.start);
    } else if (filters.timeRange.end) {
      timeMatch = timeToMinutes(booking.startTime) <= timeToMinutes(filters.timeRange.end);
    }
    return dateMatch && branchMatch && statusMatch && serviceMatch && specialistMatch && timeMatch;
  });

  const branches = business?.branches || [];
  const services = business?.services || [];
  const specialists = business?.specialists || [];

  const handleFilterChange = (filterValues: {
    branch: string | null; service: string | null;
    specialist: string | null; timeRange: { start: string; end: string };
  }) => {
    setFilters((prev) => ({
      ...prev,
      branch: filterValues.branch || "all",
      service: filterValues.service || "all",
      specialist: filterValues.specialist || "all",
      timeRange: filterValues.timeRange || { start: "", end: "" },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  const bookingBarProps = business ? {
    business,
    branchOptions: [
      { label: "All Branches", value: "all" },
      ...branches.map((b) => ({ label: b.address?.street || b.address?.city || "Branch", value: b._id })),
    ],
    serviceOptions: [
      { label: "All Services", value: "all" },
      ...services.map((s) => ({ label: s.name, value: s._id })),
    ],
    specialistOptions: [
      { label: "All Specialists", value: "all" },
      ...specialists.map((s) => ({ label: s.name, value: s._id })),
    ],
    onFilterChange: handleFilterChange,
    onBooked: fetchBookings,
  } : null;

  return (
    <div className="h-full overflow-hidden">

      {/* ══════════════════════════════════════
          DESKTOP (lg+)
      ══════════════════════════════════════ */}
      <div className="hidden lg:grid h-full grid-cols-[1fr_minmax(300px,350px)] gap-2">
        <div className="h-full flex flex-col gap-2 min-h-0">
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm min-h-0">
            <div className="relative flex gap-4 px-6 py-4 border-b border-gray-100">
              <div className="flex-shrink-0 items-center">
                <SectionTitle
                  title="Bookings"
                  subtitle={`${filteredBookings.length} booking${filteredBookings.length !== 1 ? "s" : ""}`}
                  className="!mb-0"
                />
              </div>
              {bookingBarProps && (
                <div className="flex-1 flex justify-center">
                  <div className="w-full max-w-3xl">
                    <QuickBookingBar {...bookingBarProps} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto min-h-0 p-6">
              <BookingsList bookings={filteredBookings} selectedDate={selectedDate} onChangeStatus={handleChangeStatus} />
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            </div>
          </div>
        </div>
        <aside className="h-full flex flex-col bg-white/40 rounded-2xl p-4 overflow-auto">
          <h3 className="mb-3 font-medium text-text-body">Calendar</h3>
          <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} getBookingCount={getBookingCountForDate} showGoToToday showShowAll />
          <div className="mt-6 pt-6 border-t space-y-3">
            <h3 className="font-medium text-text-body mb-3">Statistics</h3>
            <div className="flex justify-between text-sm"><span>Total Bookings</span><span className="font-semibold">{pagination.total}</span></div>
            <div className="flex justify-between text-sm"><span>Today</span><span className="font-semibold">{getBookingsForDate(new Date()).length}</span></div>
            <div className="flex justify-between text-sm"><span>Filtered</span><span className="font-semibold">{filteredBookings.length}</span></div>
            <div className="flex justify-between text-sm"><span>Pending</span><span className="font-semibold text-yellow-600">{bookings.filter((b) => b.status === "pending").length}</span></div>
          </div>
        </aside>
      </div>

      {/* ══════════════════════════════════════
          MOBILE (< lg)
      ══════════════════════════════════════ */}
      <div className="flex flex-col h-full lg:hidden bg-gray-50 overflow-hidden">

        {/* Top bar */}
        <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 pt-3 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Bookings</h2>
              <p className="text-xs text-gray-400">
                {filteredBookings.length} shown
                {selectedDate && (
                  <span className="text-teal-600"> · {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileCalendarOpen(true)}
                className="relative flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 active:bg-gray-200 transition-colors"
              >
                <CalendarDays size={15} />
                <span>Calendar</span>
                {selectedDate && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal-600 rounded-full border-2 border-white" />}
              </button>
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="relative flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 active:bg-gray-200 transition-colors"
              >
                <SlidersHorizontal size={15} />
                <span>Filter</span>
                {(filters.branch !== "all" || filters.service !== "all" || filters.specialist !== "all" || filters.status !== "all" || filters.timeRange.start) && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal-600 rounded-full border-2 border-white" />
                )}
              </button>
            </div>
          </div>
          {bookingBarProps && <QuickBookingBar {...bookingBarProps} />}
        </div>

        {/* Bookings list */}
        <div className="flex-1 overflow-y-auto p-3">
          <BookingsList bookings={filteredBookings} selectedDate={selectedDate} onChangeStatus={handleChangeStatus} />
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </div>
      </div>

      {/* ── Mobile Calendar sheet ── */}
      {mobileCalendarOpen && (
        <MobileSheet title="Calendar" onClose={() => setMobileCalendarOpen(false)}>
          <div className="flex flex-col items-center">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={(date) => { setSelectedDate(date); setMobileCalendarOpen(false); }}
              getBookingCount={getBookingCountForDate}
              showGoToToday
              showShowAll
            />
            <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 gap-3">
              {[
                { label: "Total Bookings", value: pagination.total, color: "text-gray-900" },
                { label: "Today", value: getBookingsForDate(new Date()).length, color: "text-teal-700" },
                { label: "Filtered", value: filteredBookings.length, color: "text-gray-900" },
                { label: "Pending", value: bookings.filter(b => b.status === "pending").length, color: "text-yellow-600" },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-2xl px-4 py-3">
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </MobileSheet>
      )}

      {/* ── Mobile Filter sheet ── */}
      {mobileFiltersOpen && (
        <MobileSheet title="Filter Bookings" onClose={() => setMobileFiltersOpen(false)}>
          <div className="space-y-5">
            <FilterGroup label="Branch" options={[{ label: "All", value: "all" }, ...branches.map(b => ({ label: b.address?.street || "Branch", value: b._id }))]}
              value={filters.branch} onChange={v => setFilters(p => ({ ...p, branch: v }))} />
            <FilterGroup label="Service" options={[{ label: "All", value: "all" }, ...services.map(s => ({ label: s.name, value: s._id }))]}
              value={filters.service} onChange={v => setFilters(p => ({ ...p, service: v }))} />
            <FilterGroup label="Specialist" options={[{ label: "All", value: "all" }, ...specialists.map(s => ({ label: s.name, value: s._id }))]}
              value={filters.specialist} onChange={v => setFilters(p => ({ ...p, specialist: v }))} />
            <FilterGroup label="Status" options={["all", "pending", "confirmed", "completed", "cancelled"].map(s => ({ label: s === "all" ? "All" : s, value: s }))}
              value={filters.status} onChange={v => setFilters(p => ({ ...p, status: v }))} />

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Time Range</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">From</p>
                  <input type="time" value={filters.timeRange.start}
                    onChange={e => setFilters(p => ({ ...p, timeRange: { ...p.timeRange, start: e.target.value } }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">To</p>
                  <input type="time" value={filters.timeRange.end}
                    onChange={e => setFilters(p => ({ ...p, timeRange: { ...p.timeRange, end: e.target.value } }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setFilters({ branch: "all", service: "all", specialist: "all", timeRange: { start: "", end: "" }, status: "all" })}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold text-sm">
                Clear All
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-3.5 bg-teal-700 text-white rounded-2xl font-semibold text-sm">
                Apply
              </button>
            </div>
          </div>
        </MobileSheet>
      )}

      {isModalOpen && selectedBooking && (
        <ChangeStatusModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedBooking(null); }}
          booking={selectedBooking}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function BookingsList({ bookings, selectedDate, onChangeStatus }: {
  bookings: TBooking[]; selectedDate: Date | null; onChangeStatus: (id: string) => void;
}) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-gray-500 text-sm">No bookings found</p>
        <p className="text-xs text-gray-400 mt-1">
          {selectedDate ? "Try selecting a different date" : "No bookings match your filters"}
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {bookings.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((booking) => (
        <BookingCard key={booking._id} booking={booking} onChangeStatus={onChangeStatus} />
      ))}
    </div>
  );
}

function MobileSheet({ title, onClose, children }: {
  title: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[88dvh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 pb-10">{children}</div>
      </div>
    </>
  );
}

function FilterGroup({ label, options, value, onChange }: {
  label: string; options: { label: string; value: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border capitalize transition-colors ${value === opt.value ? "bg-teal-700 text-white border-teal-700" : "bg-white text-gray-700 border-gray-200"}`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}