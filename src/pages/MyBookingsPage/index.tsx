import { useState, useEffect, lazy } from "react";
import { Calendar, Clock, MapPin, User, Edit3, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Container,
  SwitchTabs,
  Pagination,
} from "@/components";
import type { TBooking, TBookingStatus, TBusiness, TPagination } from "@/types";
import { bookingService, businessService } from "@/services/api";

const BookingModal = lazy(() => import("@/components/BookingModal"));

type FilterType = "all" | TBookingStatus;

const tabs: FilterType[] = ["all", "pending", "completed", "cancelled"];

export function MyBookingsPage() {
  const { t, i18n } = useTranslation();
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

  useEffect(() => {
    fetchBookings();
  }, []);

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
          booking.business.bookingLink
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
    if (window.confirm(t("myBookings.confirmCancel"))) {
      try {
        await bookingService.cancelBooking(bookingId);
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: "cancelled" as const }
              : booking
          )
        );
      } catch (error) {
        console.error("Failed to cancel booking:", error);
        alert(t("myBookings.cancelFailed"));
      }
    }
  };

  // FIXED: Format date using i18n month names from translations
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const year = date.getFullYear();
    const monthIndex = date.getMonth();
    
    // Get month names from i18n translations
    const monthNames = [
      t("calendar.months.january"),
      t("calendar.months.february"),
      t("calendar.months.march"),
      t("calendar.months.april"),
      t("calendar.months.may"),
      t("calendar.months.june"),
      t("calendar.months.july"),
      t("calendar.months.august"),
      t("calendar.months.september"),
      t("calendar.months.october"),
      t("calendar.months.november"),
      t("calendar.months.december"),
    ];
    
    const month = monthNames[monthIndex];
    const language = i18n.language;
    
    // Format based on language
    if (language === "hy") {
      // Armenian: 15 Հունվար 2026
      return `${day} ${month} ${year}`;
    } else if (language === "ru") {
      // Russian: 15 Январь 2026
      return `${day} ${month} ${year}`;
    } else {
      // English: January 15, 2026
      return `${month} ${day}, ${year}`;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string): string => t(`statuses.${status}`);

  const EmptyState = () => (
    <Card>
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("myBookings.noBookings")}
        </h3>
        <p className="text-gray-600">
          {activeFilter === "all"
            ? t("myBookings.noBookingsYet")
            : t("myBookings.noFilteredBookings", { status: t(`statuses.${activeFilter}`) })}
        </p>
      </div>
    </Card>
  );

  const LoadingState = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20" />
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent absolute top-0 left-0" />
          </div>
          <p className="text-gray-600 mt-4 font-medium">
            {t("myBookings.loading")}
          </p>
        </div>
      </Card>
    </div>
  );

  const BookingCard = ({ booking }: { booking: TBooking }) => {
    const services = Array.isArray(booking.services) ? booking.services : [];
    const totalDuration = services.reduce(
      (acc, s) => acc + (s.duration ?? 0),
      0
    );

    const renderServiceTags = () => {
      if (services.length === 1) {
        return (
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {services[0].name}
          </h3>
        );
      }

      return (
        <div className="mb-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {services.length} {t("myBookings.services")}
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
      );
    };

    const renderActions = () => {
      if (booking.status === "pending") {
        return (
          <div className="flex gap-3">
            <Button
              onClick={() => handleModify(booking._id)}
              className="gap-2"
              variant="liberty"
            >
              <Edit3 className="w-4 h-4" />
              {t("myBookings.modify")}
            </Button>
            <Button
              onClick={() => handleCancel(booking._id)}
              className="gap-2 text-red-500"
            >
              <X className="w-4 h-4" />
              {t("myBookings.cancel")}
            </Button>
          </div>
        );
      }

      if (booking.status === "cancelled") {
        return (
          <span className="text-sm text-gray-500 italic">
            {t("myBookings.bookingCancelled")}
          </span>
        );
      }

      if (booking.status === "completed") {
        return (
          <span className="text-sm text-gray-500 italic">
            {t("myBookings.bookingCompleted")}
          </span>
        );
      }

      return null;
    };

    return (
      <Card key={booking._id}>
        <div>
          <div className="mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                booking.status
              )}`}
            >
              {getStatusLabel(booking.status)}
            </span>
          </div>

          <div className="mb-4">
            {renderServiceTags()}
            <p className="text-gray-600">{booking.business.businessName}</p>
          </div>

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
                  <span className="ml-1.5 text-sm text-gray-400">
                    ({t("myBookings.totalDuration", { totalDuration })})
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span>{booking.branch.address.street || "N/A"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <div className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                {booking.price.amount}
                <span className="text-base font-normal text-gray-500 ml-1">
                  {booking.price.currency}
                </span>
              </div>
              {services.length > 1 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {services.map((s) => `${s.price?.currency || "$"}${s.price?.amount ?? 0}`).join(" + ")}
                </p>
              )}
            </div>
            {renderActions()}
          </div>
        </div>
      </Card>
    );
  };

  const ModalLoadingState = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
      <Card>
        <div className="flex flex-col items-center justify-center py-12 px-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20" />
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent absolute top-0 left-0" />
          </div>
          <p className="text-gray-600 mt-4 font-medium">
            {t("myBookings.loadingDetails")}
          </p>
        </div>
      </Card>
    </div>
  );

  if (loading && bookings.length === 0) {
    return <LoadingState />;
  }

  return (
    <Container>
      <h2 className="uppercase">{t("myBookings.title")}</h2>

      <div className="my-6">
        <SwitchTabs
          tabs={tabs.map((tab) => ({
            value: tab,
            label: tab === "all" ? t("statuses.all") : t(`statuses.${tab}`),
          }))}
          activeTab={activeFilter}
          onChange={(value) => setActiveFilter(value as FilterType)}
        />
      </div>

      {bookings.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>

          {pagination && (
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}

      {isModalOpen && selectedBooking && (
        <>
          {loadingBusiness ? (
            <ModalLoadingState />
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