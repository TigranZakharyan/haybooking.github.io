import { User, Clock, Phone, Mail } from "lucide-react";
import { Button } from "@/components";

interface BookingCardProps {
  booking: {
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
    services?: {
      _id: string;
      name: string;
    }[];
    specialist?: {
      _id: string;
      name: string;
    };
    price?: {
      amount: number;
    };
    notes?: string;
    isGuestBooking?: boolean;
  };
  onChangeStatus: (bookingId: string) => void;
}

export function BookingCard({ booking, onChangeStatus }: BookingCardProps) {
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

  return (
    <div className="bg-white border-2 border-primary rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header - Time and Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">
            {booking.startTime} - {booking.endTime}
          </span>
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-normal capitalize ${getStatusColor(
              booking.status
            )}`}
          >
            {booking.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">
            $ {booking.price?.amount || 0}
          </span>
          <Button
            onClick={() => onChangeStatus(booking._id)}
          >
            Change Status
          </Button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">
            {booking.customerInfo?.firstName} {booking.customerInfo?.lastName}
          </span>
          {booking.isGuestBooking && (
            <span className="text-xs text-gray-500">(Guest)</span>
          )}
        </div>
      </div>

      {/* Service and Specialist */}
      <div className="space-y-1 mb-3">
        <div className="text-sm text-gray-700">
          <span>Services: </span>
          <ul className="font-medium list-disc list-inside">
            {booking.services?.map((service) => <li key={service._id}>{service.name}</li>)}
          </ul>
        </div>
        <div className="text-sm text-gray-600">
          With {booking.specialist?.name || "Specialist"}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1 text-sm text-gray-600">
        {booking.customerInfo?.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3" />
            <span>{booking.customerInfo.phone}</span>
          </div>
        )}
        {booking.customerInfo?.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3" />
            <span className="truncate">{booking.customerInfo.email}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {booking.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">{booking.notes}</p>
        </div>
      )}
    </div>
  );
}