import { useState, useRef, useEffect } from "react";
import { Building2, Briefcase, User2, Clock, Check, ChevronDown } from "lucide-react";

export type FilterOption = { label: string; value: string };

export type BookingFilters = {
  branch: string | null;
  service: string | null;
  specialist: string | null;
  timeRange: { start: string; end: string };
};

export type BookingFilterBarProps = {
  branchOptions: FilterOption[];
  serviceOptions: FilterOption[];
  specialistOptions: FilterOption[];
  onFilterChange?: (filters: BookingFilters) => void;
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

type TimeRangePickerProps = {
  icon: React.ReactNode;
  placeholder: string;
  startTime: string;
  endTime: string;
  onTimeRangeChange: (start: string, end: string) => void;
  active?: boolean;
};

function TimeRangePicker({
  icon,
  placeholder,
  startTime,
  endTime,
  onTimeRangeChange,
  active = false,
}: TimeRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [localStart, setLocalStart] = useState(startTime);
  const [localEnd, setLocalEnd] = useState(endTime);
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

  const handleApply = () => {
    onTimeRangeChange(localStart, localEnd);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalStart("");
    setLocalEnd("");
    onTimeRangeChange("", "");
    setOpen(false);
  };

  const label =
    startTime && endTime
      ? `${startTime} - ${endTime}`
      : startTime
      ? `From ${startTime}`
      : endTime
      ? `Until ${endTime}`
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
        <span className="max-w-[140px] truncate">{label}</span>
        <ChevronDown
          size={13}
          className={`${iconColor} transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-4 space-y-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Select Time Range
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  value={localStart}
                  onChange={(e) => setLocalStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  End Time
                </label>
                <input
                  type="time"
                  value={localEnd}
                  onChange={(e) => setLocalEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleClear}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
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
  onFilterChange,
}: BookingFilterBarProps) {
  const [branch, setBranch] = useState<string | null>(null);
  const [service, setService] = useState<string | null>(null);
  const [specialist, setSpecialist] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  useEffect(() => {
    onFilterChange?.({ branch, service, specialist, timeRange });
  }, [branch, service, specialist, timeRange]);

  const handleTimeRangeChange = (start: string, end: string) => {
    setTimeRange({ start, end });
  };

  return (
    <div
      className="flex justify-center items-center"
    >
      <div
        className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow"
      >
        <FilterItem
          icon={<Building2 size={15} />}
          placeholder="All Branches"
          options={branchOptions}
          selected={branch}
          onSelect={setBranch}
        />

        <Divider />

        <FilterItem
          icon={<Briefcase size={15} />}
          placeholder="All Services"
          options={serviceOptions}
          selected={service}
          onSelect={setService}
        />

        <Divider />

        <FilterItem
          icon={<User2 size={15} />}
          placeholder="All Specialists"
          options={specialistOptions}
          selected={specialist}
          onSelect={setSpecialist}
        />

        <Divider />

        <div className="bg-teal-800 relative rounded-full">
          <TimeRangePicker
            icon={<Clock size={15} />}
            placeholder="Any Time"
            startTime={timeRange.start}
            endTime={timeRange.end}
            onTimeRangeChange={handleTimeRangeChange}
            active
          />
        </div>
      </div>
    </div>
  );
}