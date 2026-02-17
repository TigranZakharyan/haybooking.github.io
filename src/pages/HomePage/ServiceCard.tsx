import { Button } from "@/components";
import { MapPin, Users, Briefcase, DollarSign } from "lucide-react";

interface ServiceCardProps {
  image: string;
  title: string;
  address: any;
  specialists: number;
  services: number;
  priceFrom: number;
  currency?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
}

export function ServiceCard({
  image,
  title,
  address,
  specialists,
  services,
  priceFrom,
  buttonText = "View & Book",
  onButtonClick,
  className = "",
}: ServiceCardProps) {
  console.log(address)
  return (
    <div
      className={`w-full max-w-xs rounded-2xl overflow-hidden shadow-md bg-white ${className}`}
    >
      {/* Image */}
      <div className="h-48 w-full overflow-hidden">
        {
          image ? (
            <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
          )
          : (
            <div className="w-full h-full flex items-center justify-center text-7xl text-white bg-[linear-gradient(to_bottom_right,rgba(179,149,149,0.5),rgba(179,149,149,1))]">
              <span>{title[0].toUpperCase()}</span> 
            </div>
          )
        }
      </div>

      {/* Content */}
      <div className="bg-primary p-5 text-white">
        {/* Title & Badge */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 text-sm mb-2 opacity-90">
          <MapPin size={16} />
          <span>{address}</span>
        </div>

        {/* Specialists */}
        <div className="flex items-center gap-2 text-sm mb-2 opacity-90">
          <Users size={16} />
          <span>{specialists} specialists</span>
        </div>

        {/* Services */}
        <div className="flex items-center gap-2 text-sm mb-2 opacity-90">
          <Briefcase size={16} />
          <span>{services} services</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 text-sm mb-4 opacity-90">
          <DollarSign size={16} />
          <span>
            From {priceFrom} Dram
          </span>
        </div>

        <Button onClick={onButtonClick} variant="outline" className="w-full py-2 bg-secondary bg-white text-primary front-bold">{buttonText}</Button>
      </div>
    </div>
  );
}
