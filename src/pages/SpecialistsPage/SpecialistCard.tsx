import { Trash2, Edit, Eye, EyeOff } from "lucide-react";
import type { TSpecialist } from "@/types";
import { UploadImage } from "@/components";
import { useTranslation } from "react-i18next";

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

export const SpecialistCard = ({ specialist, isEditing, isUploading, onImageChange, onImageDelete, onToggleActive, onEdit, onDelete }: SpecialistCardProps) => {
  const { t } = useTranslation();

  return (
    <div className={`w-full p-3 sm:p-4 rounded-xl transition-colors duration-200 ${isEditing ? "bg-blue-50 border-2 border-blue-300" : "bg-primary/5 hover:bg-primary/10"} ${!specialist.isActive ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3 w-full overflow-hidden">

        {/* LEFT */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <label
            htmlFor={`specialist-image-${specialist._id}`}
            className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition flex-shrink-0"
          >
            <UploadImage
              id={specialist._id}
              imageUrl={specialist.photo?.url}
              altText={specialist.name}
              isUploading={isUploading}
              onChange={onImageChange}
              onDelete={onImageDelete}
            />
          </label>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h5 className={`font-semibold text-sm sm:text-base break-words ${!specialist.isActive ? "text-gray-500" : "text-black"}`}>
                {specialist.name}
              </h5>
              {!specialist.isActive && (
                <span className="text-xs bg-gray-300 text-gray-700 px-2 py-0.5 rounded">
                  {t("services.inactive")}
                </span>
              )}
            </div>

            <p className={`text-xs sm:text-sm mt-1 break-words ${!specialist.isActive ? "text-gray-400" : "text-gray-600"}`}>
              {specialist.services.map((service) => service.name).join(", ")}
            </p>

            <p className={`text-xs mt-1 break-words ${!specialist.isActive ? "text-gray-400" : "text-gray-500"}`}>
              {specialist.branch.address.country},{" "}
              {specialist.branch.address.city},{" "}
              {specialist.branch.address.street}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onToggleActive}
            className={`p-2 rounded-lg transition-colors ${specialist.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-500 hover:bg-gray-100"}`}
            aria-label={specialist.isActive ? t("specialists.deactivate", { name: specialist.name }) : t("specialists.activate", { name: specialist.name })}
            title={specialist.isActive ? t("specialists.clickToDeactivate") : t("specialists.clickToActivate")}
          >
            {specialist.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label={t("specialists.editMemberName", { name: specialist.name })}
          >
            <Edit size={18} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label={t("specialists.deleteMemberName", { name: specialist.name })}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};