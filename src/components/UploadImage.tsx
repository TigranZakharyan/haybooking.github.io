import React from "react";
import { Trash2, Plus, Loader2 } from "lucide-react";

interface UploadImageProps {
  id: string;
  imageUrl?: string;
  altText?: string;
  isUploading?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
  className?: string;
}

export const UploadImage = ({
  id,
  imageUrl,
  altText = "Uploaded image",
  isUploading = false,
  onChange,
  onDelete,
  className = "h-12 w-12",
}: UploadImageProps) => {
  return (
    <label
      htmlFor={`upload-image-${id}`}
      className={`relative rounded-full border border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition flex-shrink-0 group ${className}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={altText}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <Plus className="text-gray-400 h-5 w-5" />
      )}

      <input
        id={`upload-image-${id}`}
        type="file"
        accept="image/*"
        onChange={onChange}
        disabled={isUploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />

      {/* Loading Overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full">
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        </div>
      )}

      {/* Delete Button */}
      {imageUrl && !isUploading && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 shadow-sm"
          title="Remove image"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </label>
  );
};