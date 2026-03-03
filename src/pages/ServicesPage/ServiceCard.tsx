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
      className={`flex items-start justify-between p-4 rounded-xl transition-colors duration-200 ${
        isEditing
          ? "bg-blue-50 border-2 border-blue-300"
          : "bg-primary/5 hover:bg-primary/10"
      } ${!service.isActive ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Service Image */}
        <label
          htmlFor={`service-image-${service._id}`}
          className="relative h-12 w-12 rounded-full border border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition flex-shrink-0"
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

        {/* Service Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h5
              className={`font-semibold text-black text-lg ${!service.isActive ? "text-gray-500" : ""}`}
            >
              {service.name}
            </h5>
            {!service.isActive && (
              <span className="text-xs bg-gray-300 text-gray-700 px-2 py-0.5 rounded">
                INACTIVE
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-700 mb-2">
            <span>{service.duration} min</span>
            <span>•</span>
            <span>
              {service.price.amount} {service.price.currency}
            </span>
          </div>

          {service.description && (
            <p
              className={`text-sm mb-2 ${!service.isActive ? "text-gray-400" : "text-gray-600"}`}
            >
              {service.description}
            </p>
          )}

          <div
            className={`text-xs ${!service.isActive ? "text-gray-400" : "text-gray-500"}`}
          >
            <p>
              Interval: {service.timeInterval || 30} min • Specific Times:{" "}
              {service.allowSpecificTimes ? "Yes" : "No"}
            </p>
            <p className="mt-1">
              Branch: {service.branch.address.country},{" "}
              {service.branch.address.city}, {service.branch.address.street}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-shrink-0 ml-4">
        <button
          type="button"
          onClick={onToggleActive}
          className={`p-2 rounded-lg transition-colors ${
            service.isActive
              ? "text-green-600 hover:bg-green-50"
              : "text-gray-500 hover:bg-gray-100"
          }`}
          aria-label={
            service.isActive
              ? `Deactivate ${service.name}`
              : `Activate ${service.name}`
          }
          title={service.isActive ? "Click to deactivate" : "Click to activate"}
        >
          {service.isActive ? (
            <Eye size={20} />
          ) : (
            <EyeOff color="red" size={20} />
          )}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          aria-label={`Edit ${service.name}`}
        >
          <Edit size={20} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label={`Delete ${service.name}`}
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};
