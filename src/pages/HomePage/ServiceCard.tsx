import { Button } from "@/components";
import { Users, Briefcase, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ServiceCardProps {
  title: string;
  specialists: number;
  services: number;
  priceFrom: number;
  currency?: string;
  buttonText?: string;
  logo: { url: string } | undefined;
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
  onButtonClick,
  className = "",
}: ServiceCardProps) {
  const { t } = useTranslation();

  return (
    <div className={`w-full max-w-xs rounded-2xl overflow-hidden shadow-md bg-white ${className}`}>
      {/* Image */}
      <div className="h-48 w-full overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-7xl text-white bg-[linear-gradient(to_bottom_right,rgba(179,149,149,0.5),rgba(179,149,149,1))]">
          <span>
            {logo
              ? <img src={logo.url} alt="" className="w-full h-full object-cover" />
              : title[0].toUpperCase()
            }
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-primary p-5 text-white">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        <div className="flex items-center gap-2 text-sm mb-2 opacity-90">
          <Users size={16} />
          <span>{t("serviceCard.specialists", { count: specialists })}</span>
        </div>

        <div className="flex items-center gap-2 text-sm mb-2 opacity-90">
          <Briefcase size={16} />
          <span>{t("serviceCard.services", { count: services })}</span>
        </div>

        <div className="flex items-center gap-2 text-sm mb-4 opacity-90">
          <DollarSign size={16} />
          <span>{t("serviceCard.priceFrom", { price: priceFrom, currency: currency ?? t("serviceCard.defaultCurrency") })}</span>
        </div>

        <Button
          onClick={onButtonClick}
          variant="outline"
          className="w-full py-2 bg-secondary bg-white text-primary font-bold"
        >
          {buttonText ?? t("dashboard.bookNow")}
        </Button>
      </div>
    </div>
  );
}