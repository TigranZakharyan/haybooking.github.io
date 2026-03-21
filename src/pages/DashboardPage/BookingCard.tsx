import { User, Clock, Phone, Mail } from "lucide-react";
import { Button } from "@/components";
import { useTranslation } from "react-i18next";

interface BookingCardProps {
  booking: {
    _id: string;
    bookingDate: string | Date;
    startTime: string;
    endTime: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    customerInfo?: { firstName?: string; lastName?: string; phone?: string; email?: string; };
    services?: { _id: string; name: string; }[];
    specialist?: { _id: string; name: string; };
    price?: { amount: number; };
    notes?: string;
    isGuestBooking?: boolean;
  };
  onChangeStatus: (bookingId: string) => void;
}

export function BookingCard({ booking, onChangeStatus }: BookingCardProps) {
  const { t } = useTranslation();

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white border-2 border-primary rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="font-medium text-gray-900 text-sm sm:text-base">
            {booking.startTime} - {booking.endTime}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal capitalize ${getStatusColor(booking.status)}`}>
            {t(`statuses.${booking.status}`)}
          </span>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
          <span className="text-base sm:text-lg font-semibold text-gray-900">
            $ {booking.price?.amount || 0}
          </span>
          <Button onClick={() => onChangeStatus(booking._id)} className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 h-auto">
            {t("dashboard.changeStatus")}
          </Button>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="font-medium text-gray-900 text-sm sm:text-base">
            {booking.customerInfo?.firstName} {booking.customerInfo?.lastName}
          </span>
          {booking.isGuestBooking && (
            <span className="text-xs text-gray-500">({t("dashboard.guest")})</span>
          )}
        </div>
      </div>

      <div className="space-y-1 mb-3 text-sm text-gray-700">
        <div>
          <span>{t("dashboard.services")}: </span>
          <ul className="font-medium list-disc list-inside">
            {booking.services?.map((service) => (
              <li key={service._id}>{service.name}</li>
            ))}
          </ul>
        </div>
        <div className="text-gray-600">
          {t("dashboard.with")} {booking.specialist?.name || t("dashboard.specialist")}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-x-4 text-sm text-gray-600">
        {booking.customerInfo?.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span>{booking.customerInfo.phone}</span>
          </div>
        )}
        {booking.customerInfo?.email && (
          <div className="flex items-center gap-1.5 min-w-0">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{booking.customerInfo.email}</span>
          </div>
        )}
      </div>

      {booking.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">{booking.notes}</p>
        </div>
      )}
    </div>
  );
}