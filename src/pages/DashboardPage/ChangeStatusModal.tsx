import { useState } from "react";
import { X } from "lucide-react";
import { Button, Select } from "@/components";

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    _id: string;
    customerInfo?: {
      firstName?: string;
      lastName?: string;
    };
    status: string;
    startTime: string;
  } | null;
  onUpdateStatus: (
    bookingId: string,
    newStatus: string,
    reason?: string
  ) => Promise<void>;
}

export function ChangeStatusModal({
  isOpen,
  onClose,
  booking,
  onUpdateStatus,
}: ChangeStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !booking) return null;

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

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
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-200"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Change Booking Status
        </h2>

        {/* Booking Info */}
        <div className="mb-4 space-y-1 text-sm">
          <p>
            <span className="text-gray-600">Customer:</span>{" "}
            <span className="font-medium text-gray-900">
              {booking.customerInfo?.firstName}{" "}
              {booking.customerInfo?.lastName}
            </span>
          </p>
          <p>
            <span className="text-gray-600">Current Status:</span>{" "}
            <span className="font-medium text-gray-900 capitalize">
              {booking.status}
            </span>
          </p>
          <p>
            <span className="text-gray-600">Time:</span>{" "}
            <span className="font-medium text-gray-900">
              {booking.startTime}
            </span>
          </p>
        </div>

        {/* Custom Select */}
        <div className="mb-4">
          <Select
            label="New Status"
            required
            placeholder="Select Status *"
            options={statusOptions}
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value)}
            error={!selectedStatus ? "Status is required" : undefined}
          />
        </div>

        {/* Reason Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for status change..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={4}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            variant={!selectedStatus || isUpdating ? "outline" : "default"}
            disabled={!selectedStatus || isUpdating}
            className="flex-1"
          >
            {isUpdating ? "Updating..." : "Update Status"}
          </Button>

          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}