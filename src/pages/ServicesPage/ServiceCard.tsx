import { Trash2, Edit, Eye, EyeOff } from "lucide-react";
import type { TService } from "@/types";
import { UploadImage } from "@/components";

interface ServiceCardProps {
  service: TService;
  isEditing: boolean;
  isUploading: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDelete: () => void;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ServiceCard = ({
  service,
  isEditing,
  isUploading,
  onImageChange,
  onImageDelete,
  onToggleActive,
  onEdit,
  onDelete,
}: ServiceCardProps) => {
  return (
    <div
      className={`w-full p-3 sm:p-4 rounded-xl transition-colors duration-200 ${
        isEditing
          ? "bg-blue-50 border-2 border-blue-300"
          : "bg-primary/5 hover:bg-primary/10"
      } ${!service.isActive ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-3 w-full overflow-hidden">
        
        {/* LEFT SIDE */}
        <div className="flex gap-3 flex-1 min-w-0">
          <label
            htmlFor={`service-image-${service._id}`}
            className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition flex-shrink-0"
          >
            <UploadImage
              id={service._id}
              imageUrl={service.image?.url}
              altText={service.name}
              isUploading={isUploading}
              onChange={onImageChange}
              onDelete={onImageDelete}
            />
          </label>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h5
                className={`font-semibold text-sm sm:text-base break-words ${
                  !service.isActive ? "text-gray-500" : "text-black"
                }`}
              >
                {service.name}
              </h5>

              {!service.isActive && (
                <span className="text-xs bg-gray-300 text-gray-700 px-2 py-0.5 rounded">
                  INACTIVE
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-700 mt-1">
              <span>{service.duration} min</span>
              <span>•</span>
              <span>
                {service.price.amount} {service.price.currency}
              </span>
            </div>

            {service.description && (
              <p
                className={`text-xs sm:text-sm mt-1 break-words ${
                  !service.isActive ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {service.description}
              </p>
            )}

            <div
              className={`text-xs mt-1 break-words ${
                !service.isActive ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <p>
                Interval: {service.timeInterval || 30} min • Specific Times:{" "}
                {service.allowSpecificTimes ? "Yes" : "No"}
              </p>

              <p className="mt-0.5">
                Branch: {service.branch.address.country},{" "}
                {service.branch.address.city},{" "}
                {service.branch.address.street}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onToggleActive}
            className={`p-2 rounded-lg transition-colors ${
              service.isActive
                ? "text-green-600 hover:bg-green-50"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {service.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};