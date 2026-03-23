import { DollarSign, MapPin, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ServiceCardProps {
  title: string;
  specialists: number;
  services: number;
  priceFrom: number;
  currency?: string;
  buttonText?: string;
  logo: { url: string } | undefined;
  rating?: number;
  location?: string;
  onButtonClick?: () => void;
  className?: string;
}

export function ServiceCard({
  title,
  logo,
  specialists,
  services,
  priceFrom,
  currency,
  buttonText,
  rating = 5,
  location = "Yerevan",
  onButtonClick,
  className = "",
}: ServiceCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`w-full max-w-xs rounded-2xl overflow-hidden shadow-md bg-white ${className}`}
    >
      {/* Image */}
      <div className="h-44 w-full overflow-hidden">
        {logo ? (
          <img
            src={logo.url}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-white bg-[linear-gradient(to_bottom_right,rgba(179,149,149,0.4),rgba(179,149,149,0.9))]">
            {title[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-4 bg-white">
        {/* Title */}
        <h3 className="text-lg font-semibold text-primary mb-1">{title}</h3>

        {/* Stars + Location */}
        {/* <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={13}
                className={i < rating ? "fill-[#C97B7B] text-[#C97B7B]" : "fill-gray-200 text-gray-200"}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">{location}</span>
        </div> */}

        {/* Specialists & Services */}
        <div className="flex items-center gap-1.5 text-sm">
          <MapPin size={13} className="text-gray-400 shrink-0" />
          <span>
            {t("serviceCard.specialists", { count: specialists })}
            {" · "}
            {t("serviceCard.services", { count: services })}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-sm mb-3">
          <DollarSign size={13} className="text-gray-400 shrink-0" />
          <span>
            {t("serviceCard.priceFrom", {
              price: priceFrom,
              currency: currency ?? t("serviceCard.defaultCurrency"),
            })}
          </span>
        </div>

        {/* Price Button */}
        <button
          onClick={onButtonClick}
          className="w-full py-2.5 rounded-xl bg-primary hover:bg-primaryz active:bg-primary text-white text-sm font-semibold transition-colors"
        >
          {buttonText ??
            `${priceFrom} ${currency ?? t("serviceCard.defaultCurrency")}`}
        </button>
      </div>
    </div>
  );
}
