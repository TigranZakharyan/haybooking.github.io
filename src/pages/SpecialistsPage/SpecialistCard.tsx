import { Trash2, Edit, Eye, EyeOff } from "lucide-react";
import type { TSpecialist } from "@/types";

interface SpecialistCardProps {
  specialist: TSpecialist;
  isEditing: boolean;
  isUploading: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDelete: () => void;
  onToggleActive: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const SpecialistCard = ({
  specialist,
  isEditing,
  isUploading,
  onImageChange,
  onImageDelete,
  onToggleActive,
  onEdit,
  onDelete,
}: SpecialistCardProps) => {
  const imageUrl = specialist.photo?.url || null;

  return (
    <div
      className={`flex items-start justify-between p-4 rounded-xl transition-colors duration-200 ${
        isEditing
          ? "bg-blue-50 border-2 border-blue-300"
          : "bg-primary/5 hover:bg-primary/10"
      } ${!specialist.isActive ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Specialist Image */}
        <label
          htmlFor={`specialist-image-${specialist._id}`}
          className="relative h-12 w-12 rounded-full border border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition flex-shrink-0"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={specialist.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-xl leading-none">+</span>
          )}
          <input
            id={`specialist-image-${specialist._id}`}
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full">
              <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {imageUrl && !isUploading && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onImageDelete();
              }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
              title="Remove image"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </label>

        {/* Specialist Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h5
              className={`font-semibold text-black text-lg ${!specialist.isActive ? "text-gray-500" : ""}`}
            >
              {specialist.name}
            </h5>
            {!specialist.isActive && (
              <span className="text-xs bg-gray-300 text-gray-700 px-2 py-0.5 rounded">
                INACTIVE
              </span>
            )}
          </div>

          <div
            className={`text-sm mb-2 ${!specialist.isActive ? "text-gray-400" : "text-gray-600"}`}
          >
            {specialist.services.map((service) => service.name).join(", ")}
          </div>

          <div
            className={`text-xs ${!specialist.isActive ? "text-gray-400" : "text-gray-500"}`}
          >
            <p>
              Branch: {specialist.branch.address.country},{" "}
              {specialist.branch.address.city}, {specialist.branch.address.street}
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
            specialist.isActive
              ? "text-green-600 hover:bg-green-50"
              : "text-gray-500 hover:bg-gray-100"
          }`}
          aria-label={
            specialist.isActive
              ? `Deactivate ${specialist.name}`
              : `Activate ${specialist.name}`
          }
          title={
            specialist.isActive ? "Click to deactivate" : "Click to activate"
          }
        >
          {specialist.isActive ? (
            <Eye size={20} />
          ) : (
            <EyeOff color="red" size={20} />
          )}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          aria-label={`Edit ${specialist.name}`}
        >
          <Edit size={20} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label={`Delete ${specialist.name}`}
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};