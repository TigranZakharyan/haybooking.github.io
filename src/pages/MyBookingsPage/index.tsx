import { useState, useEffect, lazy } from "react";
import { Calendar, Clock, MapPin, User, Edit3, X, DollarSign } from "lucide-react";
import {
  Button,
  Card,
  Container,
  SwitchTabs,
  Pagination,
} from "@/components";
import type { TBooking, TBookingStatus, TBusiness, TPagination } from "@/types";
import { bookingService, businessService } from "@/services/api";

const BookingModal = lazy(() => import("@/components/BookingModal"))

type FilterType = "all" | TBookingStatus;

const tabs: FilterType[] = ["all", "pending", "completed", "cancelled"];

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<TBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [pagination, setPagination] = useState<TPagination>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<TBooking | null>(null);
  const [fullBusinessData, setFullBusinessData] = useState<TBusiness | null>();
  const [loadingBusiness, setLoadingBusiness] = useState<boolean>(false);

  const fetchBookings = async (page: number = 1, status?: TBookingStatus) => {
    setLoading(true);
    try {
      const response = await bookingService.getMyBookings({ page, status });
      setBookings(response.bookings);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    const status = activeFilter === "all" ? undefined : activeFilter;
    fetchBookings(1, status);
  }, [activeFilter]);

  const handlePageChange = (page: number) => {
    const status = activeFilter === "all" ? undefined : activeFilter;
    fetchBookings(page, status);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleModify = async (bookingId: string) => {
    const booking = bookings.find((b) => b._id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setIsModalOpen(true);
      setLoadingBusiness(true);
      try {
        const businessData = await businessService.getBusinessByLink(
          booking.business.bookingLink,
        );
        setFullBusinessData(businessData);
      } catch (error) {
        console.error("Failed to fetch business data:", error);
        setIsModalOpen(false);
        setSelectedBooking(null);
      } finally {
        setLoadingBusiness(false);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    setFullBusinessData(null);
  };

  const handleBookingConfirmed = async () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    setFullBusinessData(null);
    const currentPage = pagination?.page || 1;
    const status = activeFilter === "all" ? undefined : activeFilter;
    await fetchBookings(currentPage, status);
  };

  const handleCancel = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await bookingService.cancelBooking(bookingId);
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: "cancelled" as const }
              : booking,
          ),
        );
      } catch (error) {
        console.error("Failed to cancel booking:", error);
        alert("Failed to cancel booking. Please try again.");
      }
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":   return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default:          return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string): string =>
    status.charAt(0).toUpperCase() + status.slice(1);

  if (loading && bookings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20" />
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent absolute top-0 left-0" />
            </div>
            <p className="text-gray-600 mt-4 font-medium">Loading bookings...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Container>
      <h2 className="uppercase">My Bookings</h2>

      <div className="my-6">
        <SwitchTabs
          tabs={tabs}
          activeTab={activeFilter}
          onChange={(value) => setActiveFilter(value as FilterType)}
        />
      </div>

      {bookings.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {activeFilter === "all"
                ? "You don't have any bookings yet."
                : `You don't have any ${activeFilter} bookings.`}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => {
              const services = Array.isArray(booking.services) ? booking.services : [];
              const totalDuration = services.reduce((acc, s) => acc + (s.duration ?? 0), 0);

              return (
                <Card key={booking._id}>
                  <div>
                    {/* Status Badge */}
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>

                    {/* Services */}
                    <div className="mb-4">
                      {services.length === 1 ? (
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {services[0].name}
                        </h3>
                      ) : (
                        <div className="mb-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {services.length} Services
                          </h3>
                          <div className="flex flex-wrap gap-1.5">
                            {services.map((service) => (
                              <span
                                key={service._id}
                                className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full"
                              >
                                {service.name}
                                {service.duration && (
                                  <span className="text-primary/60">· {service.duration}min</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-gray-600">{booking.business.businessName}</p>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-3 text-gray-700">
                        <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span>{booking.specialist?.name}</span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span>{formatDate(booking.bookingDate)}</span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span>
                          {booking.startTime} – {booking.endTime}
                          {totalDuration > 0 && (
                            <span className="ml-1.5 text-sm text-gray-400">({totalDuration} min)</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700">
                        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <span>{booking.branch.address.street || "N/A"}</span>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <div className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                          <DollarSign className="w-5 h-5" />
                          {booking.price.amount}
                          <span className="text-base font-normal text-gray-500 ml-1">
                            {booking.price.currency}
                          </span>
                        </div>
                        {services.length > 1 && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {services.map(s => `$${s.price?.amount ?? 0}`).join(" + ")}
                          </p>
                        )}
                      </div>

                      {booking.status === "pending" && (
                        <div className="flex gap-3">
                          <Button onClick={() => handleModify(booking._id)} className="gap-2" variant="liberty">
                            <Edit3 className="w-4 h-4" />
                            Modify
                          </Button>
                          <Button onClick={() => handleCancel(booking._id)} className="gap-2 text-red-500">
                            <X className="w-4 h-4" />
                            Cancel
                          </Button>
                        </div>
                      )}

                      {booking.status === "cancelled" && (
                        <span className="text-sm text-gray-500 italic">Booking cancelled</span>
                      )}

                      {booking.status === "completed" && (
                        <span className="text-sm text-gray-500 italic">Booking completed</span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {pagination && (
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}

      {/* Edit Booking Modal */}
      {isModalOpen && selectedBooking && (
        <>
          {loadingBusiness ? (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
              <Card>
                <div className="flex flex-col items-center justify-center py-12 px-8">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20" />
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent absolute top-0 left-0" />
                  </div>
                  <p className="text-gray-600 mt-4 font-medium">Loading booking details...</p>
                </div>
              </Card>
            </div>
          ) : fullBusinessData ? (
            <BookingModal
              business={fullBusinessData}
              editBooking={selectedBooking}
              mode="edit"
              onClose={handleModalClose}
              onConfirmed={handleBookingConfirmed}
            />
          ) : null}
        </>
      )}
    </Container>
  );
}