import { useState, useRef, useEffect } from "react";
import { Building2, Briefcase, User2, Calendar, Check, ChevronDown } from "lucide-react";

export type FilterOption = { label: string; value: string };

export type BookingFilters = {
  branch: string | null;
  service: string | null;
  specialist: string | null;
  date: string | null;
};

export type BookingFilterBarProps = {
  branchOptions: FilterOption[];
  serviceOptions: FilterOption[];
  specialistOptions: FilterOption[];
  dateOptions: FilterOption[];
  onBook?: (filters: BookingFilters) => void;
};

type FilterItemProps = {
  icon: React.ReactNode;
  placeholder: string;
  options: FilterOption[];
  selected: string | null;
  onSelect: (value: string) => void;
  active?: boolean;
};

function FilterItem({
  icon,
  placeholder,
  options,
  selected,
  onSelect,
  active = false,
}: FilterItemProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const label = selected
    ? (options.find((o) => o.value === selected)?.label ?? placeholder)
    : placeholder;

  const textColor = active ? "text-white" : "text-gray-600";
  const iconColor = active ? "text-white/70" : "text-gray-400";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${textColor} hover:opacity-90`}
      >
        <span className={`flex-shrink-0 ${iconColor}`}>{icon}</span>
        <span>{label}</span>
        <ChevronDown
          size={13}
          className={`${iconColor} transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        /* Changed left-0 to left-1/2 and added -translate-x-1/2 to center the dropdown */
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onSelect(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                selected === opt.value
                  ? "bg-teal-50 text-teal-800 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {opt.label}
              {selected === opt.value && (
                <Check size={13} className="text-teal-700" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 flex-shrink-0" />;
}

export function Filter({
  branchOptions,
  serviceOptions,
  specialistOptions,
  dateOptions,
  onBook,
}: BookingFilterBarProps) {
  const [branch, setBranch] = useState<string | null>(null);
  const [service, setService] = useState<string | null>(null);
  const [specialist, setSpecialist] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);

  const handleBook = () => {
    onBook?.({ branch, service, specialist, date });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center" }}
        className="bg-white border border-gray-200 rounded-full shadow-sm"
      >
        <FilterItem
          icon={<Building2 size={15} />}
          placeholder="Select Branch"
          options={branchOptions}
          selected={branch}
          onSelect={setBranch}
        />

        <Divider />

        <FilterItem
          icon={<Briefcase size={15} />}
          placeholder="Select Service"
          options={serviceOptions}
          selected={service}
          onSelect={setService}
        />

        <Divider />

        <FilterItem
          icon={<User2 size={15} />}
          placeholder="Select Specialist"
          options={specialistOptions}
          selected={specialist}
          onSelect={setSpecialist}
        />

        <Divider />

        {/* Added relative here so the dropdown centers correctly against this container */}
        <div style={{ margin: 4, borderRadius: 9999 }} className="bg-teal-800 relative">
          <FilterItem
            icon={<Calendar size={15} />}
            placeholder="Select Date"
            options={dateOptions}
            selected={date}
            onSelect={setDate}
            active
          />
        </div>

        <button
          onClick={handleBook}
          style={{ margin: 4 }}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-800 hover:bg-teal-700 active:bg-teal-900 text-white text-sm font-semibold rounded-full transition-colors duration-150 whitespace-nowrap"
        >
          <Check size={13} strokeWidth={3} />
          BOOK NOW
        </button>
      </div>
    </div>
  );
}