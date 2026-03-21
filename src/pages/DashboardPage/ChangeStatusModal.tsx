import { useState } from "react";
import { X } from "lucide-react";
import { Button, Select } from "@/components";
import type { TBooking, TBookingStatus } from "@/types";
import { statusOptions } from "@/constants";
import { useTranslation } from "react-i18next";

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: TBooking;
  onUpdateStatus: (bookingId: string, newStatus: TBookingStatus, reason?: string) => Promise<void>;
}

export function ChangeStatusModal({ isOpen, onClose, booking, onUpdateStatus }: ChangeStatusModalProps) {
  const { t } = useTranslation();

  if (!isOpen || !booking) return null;

  const [selectedStatus, setSelectedStatus] = useState<TBookingStatus | "">(booking.status);
  const [reason, setReason] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(booking._id, selectedStatus, reason);
      onClose();
      setSelectedStatus("");
      setReason("");
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setSelectedStatus("");
    setReason("");
    onClose();
  };

  return (
    <div className="fixed w-full h-full top-0 left-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-200" onClick={handleCancel} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <button onClick={handleCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t("dashboard.modal.title")}
        </h2>

        <div className="mb-4 space-y-1 text-sm">
          <p>
            <span className="text-gray-600">{t("dashboard.modal.customer")}:</span>{" "}
            <span className="font-medium text-gray-900">
              {booking.customerInfo?.firstName} {booking.customerInfo?.lastName}
            </span>
          </p>
          <p>
            <span className="text-gray-600">{t("dashboard.modal.currentStatus")}:</span>{" "}
            <span className="font-medium text-gray-900 capitalize">
              {t(`statuses.${booking.status}`)}
            </span>
          </p>
          <p>
            <span className="text-gray-600">{t("dashboard.modal.time")}:</span>{" "}
            <span className="font-medium text-gray-900">{booking.startTime}</span>
          </p>
        </div>

        <div className="mb-4">
          <Select
            label={t("dashboard.modal.newStatus")}
            required
            placeholder={t("dashboard.modal.selectStatus")}
            options={statusOptions}
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value as TBookingStatus)}
            error={!selectedStatus ? t("errors.required") : undefined}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("dashboard.modal.reason")}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("dashboard.modal.reasonPlaceholder")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={4}
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            variant={!selectedStatus || isUpdating ? "outline" : "default"}
            disabled={!selectedStatus || isUpdating}
            className="flex-1"
          >
            {isUpdating ? t("dashboard.modal.updating") : t("dashboard.modal.updateStatus")}
          </Button>
          <Button onClick={handleCancel} variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
            {t("services.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}