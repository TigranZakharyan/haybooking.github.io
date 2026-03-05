import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Building2, Briefcase, User2, CalendarDays, Clock,
  Check, ChevronDown, X, Zap, CheckCircle2, DollarSign,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { bookingService } from "@/services/api";
import { months, weekdays } from "@/constants";
import type { TBusiness, TService, TSpecialist, TBooking } from "@/types";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getErrorMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    (err as { message?: string })?.message ??
    fallback
  );
}

interface CalendarDate extends Date { ds: string; }

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isCustomTime?: boolean;
  duration?: number;
}

function generateCalendar(calendarDate: Date): (CalendarDate | null)[] {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const startDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (CalendarDate | null)[] = Array(startDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d) as CalendarDate;
    date.ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push(date);
  }
  return days;
}

function SpecialistIcon({ url, name }: { url: string; name: string }) {
  if (url) return <img src={url} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />;
  return (
    <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center flex-shrink-0">
      <span className="text-white text-xs font-bold">
        {name.split(" ").slice(0, 2).map(e => e[0]).join("")}
      </span>
    </div>
  );
}

// ── ScrollPicker ──────────────────────────────────────────────────────────────
const ScrollPicker = ({ length, value, onChange }: { length: number; value: string; onChange: (v: string) => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemHeight = 40;

  const scrollToValue = useCallback((val: string, behavior: ScrollBehavior = "smooth") => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: parseInt(val) * itemHeight, behavior });
    }
  }, []);

  useEffect(() => { scrollToValue(value); }, [value, scrollToValue]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const index = Math.round(scrollRef.current.scrollTop / itemHeight);
    const newValue = index.toString().padStart(2, "0");
    if (newValue !== value && index >= 0 && index < length) onChange(newValue);
  };

  const step = (dir: number) => {
    const next = (parseInt(value) + dir + length) % length;
    onChange(next.toString().padStart(2, "0"));
  };

  return (
    <div className="flex flex-col items-center select-none">
      <button onClick={() => step(-1)} className="z-20 p-2 text-teal-700 hover:scale-110 active:scale-95 transition-transform">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <div className="relative h-[120px] w-16 overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-10 border-y border-teal-200 bg-teal-50 pointer-events-none" />
        <div ref={scrollRef} onScroll={handleScroll}
          className="h-full overflow-y-auto snap-y snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollPaddingBlock: "40px" }}>
          <div style={{ height: "40px" }} />
          {Array.from({ length }, (_, i) => {
            const padded = i.toString().padStart(2, "0");
            const isActive = value === padded;
            return (
              <div key={i} onClick={() => onChange(padded)}
                className={`h-10 flex items-center justify-center text-xl font-medium transition-all duration-200 snap-center cursor-pointer ${isActive ? "text-teal-700 scale-125 font-bold" : "text-gray-400 scale-100"}`}>
                {padded}
              </div>
            );
          })}
          <div style={{ height: "40px" }} />
        </div>
      </div>
      <button onClick={() => step(1)} className="z-20 p-2 text-teal-700 hover:scale-110 active:scale-95 transition-transform">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

function usePortalDropdown() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2, width: Math.max(rect.width, 220) });
  }, []);

  const openDropdown = () => { updatePosition(); setOpen(true); };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleUpdate = () => updatePosition();
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    return () => { window.removeEventListener("scroll", handleUpdate, true); window.removeEventListener("resize", handleUpdate); };
  }, [open, updatePosition]);

  return { open, setOpen, pos, btnRef, menuRef, openDropdown };
}

// ── BookingTrigger ────────────────────────────────────────────────────────────
const BookingTrigger = React.forwardRef<HTMLButtonElement, {
  icon: React.ReactNode; label: string; sublabel?: string;
  active?: boolean; done?: boolean; locked?: boolean;
  onClick: () => void; onClear?: () => void;
}>(function BookingTrigger({ icon, label, sublabel, active, done, locked, onClick, onClear }, ref) {
  return (
    <button ref={ref} onClick={locked ? undefined : onClick}
      className={["flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap transition-all min-w-0",
        locked ? "opacity-35 cursor-not-allowed text-gray-400" :
        done ? "text-gray-900 cursor-pointer hover:opacity-80" :
        active ? "text-gray-900 cursor-pointer" : "text-gray-500 cursor-pointer hover:text-gray-700"].join(" ")}>
      <span className={done ? "text-teal-700" : "text-gray-400"}>{icon}</span>
      <div className="flex flex-col items-start min-w-0">
        <span className={`leading-tight truncate max-w-[140px] ${done ? "text-gray-900 font-semibold text-xs" : "text-sm"}`}>{label}</span>
        {sublabel && <span className="text-[10px] text-gray-400 leading-tight truncate max-w-[140px]">{sublabel}</span>}
      </div>
      {done && onClear ? (
        <span role="button" onClick={e => { e.stopPropagation(); onClear(); }}
          className="ml-0.5 rounded-full hover:bg-gray-100 p-0.5 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={11} />
        </span>
      ) : (!locked && <ChevronDown size={11} className={`text-gray-400 transition-transform flex-shrink-0 ${active ? "rotate-180" : ""}`} />)}
    </button>
  );
});

interface FilterOption { label: string; value: string; }

function FilterDropdown({ icon, placeholder, options, selected, onSelect, disabled }: {
  icon: React.ReactNode; placeholder: string; options: FilterOption[];
  selected: string | null; onSelect: (v: string) => void; disabled?: boolean;
}) {
  const { open, setOpen, pos, btnRef, menuRef, openDropdown } = usePortalDropdown();
  const label = selected ? options.find(o => o.value === selected)?.label ?? placeholder : placeholder;
  return (
    <>
      <button ref={btnRef} onClick={() => !disabled && openDropdown()} disabled={disabled}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap transition-all ${disabled ? "opacity-40 cursor-not-allowed text-gray-400" : "text-gray-600 hover:text-gray-900"}`}>
        <span className="text-gray-400">{icon}</span>
        <span className={selected ? "text-gray-900 font-semibold" : ""}>{label}</span>
        <ChevronDown size={12} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && createPortal(
        <div ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, transform: "translateX(-50%)", zIndex: 9999 }}
          className="min-w-[180px] bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 overflow-hidden">
          {options.map(opt => (
            <button key={opt.value} onClick={() => { onSelect(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-3 transition-colors ${selected === opt.value ? "bg-teal-700 text-white font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
              {opt.label}
              {selected === opt.value && <Check size={12} />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

function TimeRangeFilter({ timeRange, onChange }: {
  timeRange: { start: string; end: string }; onChange: (s: string, e: string) => void;
}) {
  const { open, setOpen, pos, btnRef, menuRef, openDropdown } = usePortalDropdown();
  const [ls, setLs] = useState(timeRange.start);
  const [le, setLe] = useState(timeRange.end);
  const label = timeRange.start && timeRange.end ? `${timeRange.start}–${timeRange.end}` : timeRange.start ? `From ${timeRange.start}` : "Any Time";
  return (
    <>
      <button ref={btnRef} onClick={openDropdown}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white whitespace-nowrap">
        <Clock size={14} className="text-white/70" />
        <span>{label}</span>
        <ChevronDown size={12} className={`text-white/70 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && createPortal(
        <div ref={menuRef}
          style={{ position: "fixed", top: pos.top, right: window.innerWidth - pos.left - pos.width, zIndex: 9999 }}
          className="w-64 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Time Range</p>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Start</label>
              <input type="time" value={ls} onChange={e => setLs(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-700" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">End</label>
              <input type="time" value={le} onChange={e => setLe(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-700" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setLs(""); setLe(""); onChange("", ""); setOpen(false); }}
                className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Clear</button>
              <button onClick={() => { onChange(ls, le); setOpen(false); }}
                className="flex-1 py-2 text-sm font-medium text-white bg-teal-700 rounded-lg hover:opacity-90 transition-opacity">Apply</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function BranchBookingDropdown({ branches, selected, onSelect, disabled }: {
  branches: any[]; selected: any; onSelect: (b: any) => void; disabled?: boolean;
}) {
  const { open, setOpen, pos, btnRef, menuRef, openDropdown } = usePortalDropdown();
  return (
    <>
      <BookingTrigger ref={btnRef} icon={<Building2 size={14} />}
        label={selected ? selected.address?.street || "Branch" : "Branch"}
        sublabel={selected ? selected.address?.city : undefined}
        done={!!selected} locked={disabled} active={open} onClick={openDropdown}
        onClear={selected ? () => onSelect(null) : undefined} />
      {open && createPortal(
        <div ref={menuRef} style={{ position: "fixed", top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 overflow-hidden">
          {branches.map(b => (
            <button key={b._id} onClick={() => { onSelect(b); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors ${selected?._id === b._id ? "bg-teal-700 text-white" : "text-gray-700 hover:bg-gray-50"}`}>
              <div>
                <div className="font-semibold flex items-center gap-1.5">
                  {b.address?.street}
                  {b.isBaseBranch && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selected?._id === b._id ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>Main</span>}
                </div>
                <div className={`text-xs mt-0.5 ${selected?._id === b._id ? "text-white/60" : "text-gray-400"}`}>{b.address?.city}</div>
              </div>
              {selected?._id === b._id && <Check size={14} />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

// ── ServiceBookingDropdown — MULTI-SELECT ─────────────────────────────────────
function ServiceBookingDropdown({ services, selected, onToggle, disabled }: {
  services: TService[];
  selected: TService[];
  onToggle: (s: TService) => void;
  disabled?: boolean;
}) {
  const { open, setOpen, pos, btnRef, menuRef, openDropdown } = usePortalDropdown();

  const label = selected.length === 0
    ? "Service"
    : selected.length === 1
      ? selected[0].name
      : `${selected.length} services`;

  const sublabel = selected.length > 0
    ? `${selected.reduce((a, s) => a + s.duration, 0)}min · $${selected.reduce((a, s) => a + s.price?.amount, 0)}`
    : undefined;

  return (
    <>
      <BookingTrigger ref={btnRef} icon={<Briefcase size={14} />}
        label={label} sublabel={sublabel}
        done={selected.length > 0} locked={disabled} active={open} onClick={openDropdown}
        onClear={selected.length > 0 ? () => selected.forEach(s => onToggle(s)) : undefined} />
      {open && createPortal(
        <div ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, minWidth: Math.max(pos.width, 240), zIndex: 9999 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-3 pb-2 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Services</p>
            {selected.length > 0 && (
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-teal-700 font-semibold">{selected.length} selected</span>
                <button
                  onClick={() => selected.forEach(s => onToggle(s))}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Service list */}
          <div className="py-1.5 max-h-72 overflow-y-auto">
            {services.length === 0
              ? <p className="px-4 py-3 text-sm text-gray-400">No services at this branch</p>
              : services.map(s => {
                const isSelected = selected.some(sel => sel._id === s._id);
                return (
                  <button key={s._id}
                    onClick={() => onToggle(s)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${isSelected ? "bg-teal-50" : "hover:bg-gray-50"}`}>
                    {/* Checkbox */}
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? "bg-teal-700 border-teal-700" : "border-gray-300"}`}>
                      {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold truncate ${isSelected ? "text-teal-800" : "text-gray-700"}`}>{s.name}</div>
                      <div className="flex items-center gap-2 text-xs mt-0.5 text-gray-400">
                        <span className="flex items-center gap-0.5"><Clock size={10} />{s.duration}min</span>
                        <span className="flex items-center gap-0.5"><DollarSign size={10} />{s.price?.amount}</span>
                      </div>
                    </div>
                    {isSelected && <Check size={14} className="text-teal-700 flex-shrink-0" />}
                  </button>
                );
              })}
          </div>

          {/* Footer summary */}
          {selected.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-teal-50 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-teal-700">
                <Clock size={11} />
                <span className="font-semibold">{selected.reduce((a, s) => a + s.duration, 0)} min total</span>
              </div>
              <div className="flex items-center gap-0.5 text-xs font-bold text-teal-700">
                <DollarSign size={11} />
                {selected.reduce((a, s) => a + s.price?.amount, 0)}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

function SpecialistBookingDropdown({ specialists, selected, onSelect, disabled }: {
  specialists: TSpecialist[]; selected: TSpecialist | null; onSelect: (s: TSpecialist) => void; disabled?: boolean;
}) {
  const { open, setOpen, pos, btnRef, menuRef, openDropdown } = usePortalDropdown();
  return (
    <>
      <BookingTrigger ref={btnRef} icon={<User2 size={14} />}
        label={selected ? selected.name : "Specialist"}
        done={!!selected} locked={disabled} active={open} onClick={openDropdown}
        onClear={selected ? () => onSelect(null as any) : undefined} />
      {open && createPortal(
        <div ref={menuRef} style={{ position: "fixed", top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 overflow-hidden">
          {specialists.length === 0
            ? <p className="px-4 py-3 text-sm text-gray-400">No specialists for selected services</p>
            : specialists.map(sp => (
              <button key={sp._id} onClick={() => { onSelect(sp); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${selected?._id === sp._id ? "bg-teal-700 text-white" : "text-gray-700 hover:bg-gray-50"}`}>
                <SpecialistIcon url={sp?.photo?.url} name={sp.name} />
                <span className="font-semibold flex-1">{sp.name}</span>
                {selected?._id === sp._id && <Check size={14} />}
              </button>
            ))}
        </div>,
        document.body
      )}
    </>
  );
}

function DateBookingDropdown({ selected, onSelect, workingHours, disabled }: {
  selected: string | null; onSelect: (ds: string) => void; workingHours: any; disabled?: boolean;
}) {
  const { open, setOpen, pos, btnRef, menuRef, openDropdown } = usePortalDropdown();
  const [calDate, setCalDate] = useState(new Date());
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const calDays = generateCalendar(calDate);
  const monthYearLabel = `${months[calDate.getMonth()]} ${calDate.getFullYear()}`;
  const changeMonth = (dir: number) => setCalDate(p => { const d = new Date(p); d.setMonth(p.getMonth() + dir); return d; });
  const displayLabel = selected
    ? new Date(selected + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Date";
  return (
    <>
      <BookingTrigger ref={btnRef} icon={<CalendarDays size={14} />}
        label={displayLabel} done={!!selected} locked={disabled} active={open} onClick={openDropdown}
        onClear={selected ? () => { onSelect(null as any); } : undefined} />
      {open && createPortal(
        <div ref={menuRef} style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
          <div className="rounded-2xl p-4 bg-teal-50 border-0">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors font-bold text-lg text-teal-600">←</button>
              <span className="font-semibold text-sm text-teal-700">{monthYearLabel}</span>
              <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors font-bold text-lg text-teal-600">→</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {weekdays.map(d => <div key={d} className="font-semibold py-1 text-xs text-teal-700">{d}</div>)}
              {calDays.map((dateObj, idx) => {
                const isWorking = workingHours?.some((e: any) => e.dayOfWeek === (dateObj?.getDay() ?? -1) && e.isOpen) ?? false;
                const isPast = dateObj ? dateObj < today : false;
                const isDisabled = !dateObj || isPast || !isWorking;
                const isSelected = dateObj && selected === dateObj.ds;
                return (
                  <div key={idx}>
                    {dateObj && (
                      <button onClick={() => { if (!isDisabled) { onSelect(dateObj.ds); setOpen(false); } }} disabled={isDisabled}
                        className={["w-full aspect-square rounded-md text-[13px] transition-colors flex items-center justify-center",
                          isSelected ? "bg-teal-700 text-white font-bold" :
                          isDisabled ? "text-gray-300 cursor-not-allowed" :
                          "hover:bg-teal-100 cursor-pointer"].join(" ")}>
                        {dateObj.getDate()}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {selected && workingHours && (
            <div className="mx-3 mb-3 rounded-xl p-2.5 flex items-center gap-2 text-xs bg-teal-50 border border-teal-200 text-teal-700">
              <Clock className="h-3.5 w-3.5 flex-shrink-0 text-teal-700" />
              <span className="font-semibold">Working Hours:</span>
              <span className="text-teal-600">
                {(() => {
                  const day = new Date(selected + "T00:00:00").getDay();
                  const s = workingHours.find((wh: any) => wh.dayOfWeek === day);
                  if (!s?.isOpen) return "Closed";
                  if (s.hasBreak && s.breakStart && s.breakEnd) return `${s.openTime} - ${s.breakStart}, ${s.breakEnd} - ${s.closeTime}`;
                  return `${s.openTime} - ${s.closeTime}`;
                })()}
              </span>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

function TimeBookingDropdown({ selected, onSelect, slots, loading, error, services, specialist, date, disabled }: {
  selected: TimeSlot | null; onSelect: (t: TimeSlot | null) => void;
  slots: TimeSlot[]; loading: boolean; error: string | null;
  services: TService[]; specialist: TSpecialist | null; date: string | null; disabled?: boolean;
}) {
  const { open, setOpen, pos, btnRef, menuRef, openDropdown } = usePortalDropdown();
  const [customHour, setCustomHour] = useState("00");
  const [customMinute, setCustomMinute] = useState("00");
  const [customTimeError, setCustomTimeError] = useState("");
  const [validatingTime, setValidatingTime] = useState(false);
  const label = selected ? selected.startTime : "Time";
  const anyAllowsCustomTime = services.some(s => s.allowSpecificTimes);

  const validateCustomTime = async () => {
    if (!customHour || !customMinute || !specialist || !services.length || !date) return;
    setValidatingTime(true);
    setCustomTimeError("");
    try {
      const res = await bookingService.validateCustomTime({
        specialistId: specialist._id,
        serviceId: services[0]._id,
        bookingDate: date,
        customStartTime: `${customHour}:${customMinute}`,
      });
      if (res.isValid) {
        onSelect({ startTime: res.startTime as string, endTime: res.endTime as string, isAvailable: true, isCustomTime: true, duration: res.duration as number });
        setOpen(false);
      }
    } catch (err) {
      setCustomTimeError(getErrorMessage(err, "This time is not available"));
    } finally {
      setValidatingTime(false);
    }
  };

  const selectSlot = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    if (selected?.startTime === slot.startTime && !selected?.isCustomTime) {
      onSelect(null);
    } else {
      const [h, m] = slot.startTime.split(":");
      setCustomHour(h); setCustomMinute(m); setCustomTimeError("");
      onSelect({ ...slot, isCustomTime: false });
      setOpen(false);
    }
  };

  return (
    <>
      <BookingTrigger ref={btnRef} icon={<Clock size={14} />}
        label={label} done={!!selected} locked={disabled} active={open} onClick={openDropdown}
        onClear={selected ? () => onSelect(null) : undefined} />
      {open && createPortal(
        <div ref={menuRef} style={{ position: "fixed", top: pos.top, left: pos.left, minWidth: Math.max(pos.width, 300), zIndex: 9999 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4">
            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700 mx-auto" />
                <p className="mt-2 text-sm text-gray-500">Loading available times...</p>
              </div>
            ) : error && !slots.length ? (
              <div className="text-center py-3 rounded-2xl text-sm bg-amber-50 border border-amber-200 text-amber-700">{error}</div>
            ) : (
              <>
                <div className="rounded-2xl p-4 bg-gray-50 border border-teal-100">
                  <h4 className="text-sm font-semibold mb-3 text-teal-700">Available Time Slots</h4>
                  <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block bg-green-50 border border-green-300" /> Available</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block bg-red-50 border border-red-200" /> Booked</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto pr-1">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {slots.map((slot, idx) => {
                        const isSel = selected?.startTime === slot.startTime && !selected?.isCustomTime;
                        return (
                          <button key={idx} onClick={() => selectSlot(slot)} disabled={!slot.isAvailable}
                            className={["rounded-lg py-2 px-1 text-[13px] font-semibold border-2 transition-all",
                              !slot.isAvailable ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed" :
                              isSel ? "bg-green-700 border-green-800 text-white" :
                              "bg-green-50 border-green-300 text-green-800 hover:bg-green-100"].join(" ")}>
                            {slot.startTime}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {anyAllowsCustomTime && (
                  <div className="rounded-2xl p-5 mt-3 bg-teal-50 border border-teal-100">
                    <p className="text-center text-sm mb-4 text-teal-600">— or enter a custom time —</p>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <ScrollPicker length={24} value={customHour} onChange={setCustomHour} />
                      <span className="text-3xl font-bold text-teal-700/50">:</span>
                      <ScrollPicker length={60} value={customMinute} onChange={setCustomMinute} />
                      <div className="ml-2 px-4 py-2 bg-white rounded-2xl shadow border-2 border-teal-200 font-mono text-xl font-bold min-w-[80px] text-center text-teal-700">
                        {customHour && customMinute ? `${customHour}:${customMinute}` : <span className="text-gray-300">--:--</span>}
                      </div>
                    </div>
                    {customHour && customMinute && (
                      <div className="text-center">
                        <button onClick={validateCustomTime} disabled={validatingTime}
                          className="bg-teal-700 text-white rounded-full py-3 px-8 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity">
                          {validatingTime ? "Validating..." : "Set This Time"}
                        </button>
                      </div>
                    )}
                    {selected?.isCustomTime && !customTimeError && (
                      <p className="mt-3 p-3 rounded-lg text-sm bg-green-50 border border-green-300 text-green-800">✓ Custom time set: <strong>{selected.startTime}</strong></p>
                    )}
                    {customTimeError && (
                      <p className="mt-3 p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-600">⚠️ {customTimeError}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE WIZARD
// ═══════════════════════════════════════════════════════════════════════════════

type WizardStep = "branch" | "service" | "specialist" | "date" | "time" | "confirm";

interface MobileWizardProps {
  business: TBusiness;
  onClose: () => void;
  onBooked: () => void;
}

function MobileBookingWizard({ business, onClose, onBooked }: MobileWizardProps) {
  const branches = business.branches ?? [];
  const allServices = business.services ?? [];
  const allSpecialists = business.specialists ?? [];

  const hasBranchChoice = branches.length > 1;

  const steps: WizardStep[] = hasBranchChoice
    ? ["branch", "service", "specialist", "date", "time", "confirm"]
    : ["service", "specialist", "date", "time", "confirm"];

  const [stepIdx, setStepIdx] = useState(0);
  const currentStep = steps[stepIdx];

  const [bookBranch, setBookBranch] = useState<any>(branches.length === 1 ? branches[0] : null);
  // ── Multi-select services ──
  const [bookServices, setBookServices] = useState<TService[]>([]);
  const [bookSpecialist, setBookSpecialist] = useState<TSpecialist | null>(null);
  const [bookDate, setBookDate] = useState<string | null>(null);
  const [bookTime, setBookTime] = useState<TimeSlot | null>(null);

  const [calDate, setCalDate] = useState(new Date());
  const today = new Date(new Date().setHours(0, 0, 0, 0));

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [customHour, setCustomHour] = useState("09");
  const [customMinute, setCustomMinute] = useState("00");
  const [customTimeError, setCustomTimeError] = useState("");
  const [validatingTime, setValidatingTime] = useState(false);

  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const branchServices = allServices.filter((s: any) => s.branch === bookBranch?._id);

  // Specialists who can perform ALL selected services
  const filteredSpecialists = allSpecialists.filter(sp => {
    if (bookBranch && sp.branch !== bookBranch._id) return false;
    if (bookServices.length === 0) return true;
    if (!sp.services?.length) return false;
    return bookServices.every(selectedSvc =>
      sp.services.some(svc => (typeof svc === "string" ? svc : svc._id) === selectedSvc._id)
    );
  });

  // Toggle a service; if removing makes current specialist invalid, clear them
  const toggleService = (service: TService) => {
    setBookServices(prev => {
      const isSelected = prev.some(s => s._id === service._id);
      const next = isSelected ? prev.filter(s => s._id !== service._id) : [...prev, service];
      // Clear specialist if they can't serve the new set
      if (bookSpecialist) {
        const stillValid = next.every(svc =>
          bookSpecialist.services?.some(sp => (typeof sp === "string" ? sp : sp._id) === svc._id)
        );
        if (!stillValid) setBookSpecialist(null);
      }
      return next;
    });
    setBookDate(null);
    setBookTime(null);
  };

  useEffect(() => {
    if (currentStep === "time" && bookSpecialist && bookServices.length > 0 && bookDate) {
      fetchSlots();
    }
  }, [currentStep]);

  const fetchSlots = async () => {
    if (!bookSpecialist || bookServices.length === 0 || !bookDate) return;
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const data = await bookingService.getAvailability({
        specialistId: bookSpecialist._id,
        serviceId: bookServices[0]._id,
        serviceIds: bookServices.map(s => s._id).join(","),
        date: bookDate,
      });
      setSlots((data.slots ?? []) as TimeSlot[]);
      if (!data.slots?.length) setSlotsError("No slots available for this date.");
    } catch (err) {
      setSlotsError(getErrorMessage(err, "Failed to load available slots"));
    } finally {
      setLoadingSlots(false);
    }
  };

  const goNext = () => { if (stepIdx < steps.length - 1) setStepIdx(s => s + 1); };
  const goBack = () => { if (stepIdx > 0) setStepIdx(s => s - 1); };

  const validateCustomTime = async () => {
    if (!bookSpecialist || bookServices.length === 0 || !bookDate) return;
    setValidatingTime(true);
    setCustomTimeError("");
    try {
      const res = await bookingService.validateCustomTime({
        specialistId: bookSpecialist._id,
        serviceId: bookServices[0]._id,
        bookingDate: bookDate,
        customStartTime: `${customHour}:${customMinute}`,
      });
      if (res.isValid) {
        setBookTime({ startTime: res.startTime as string, endTime: res.endTime as string, isAvailable: true, isCustomTime: true, duration: res.duration as number });
      }
    } catch (err) {
      setCustomTimeError(getErrorMessage(err, "This time is not available"));
    } finally {
      setValidatingTime(false);
    }
  };

  const handleConfirm = async () => {
    if (!bookServices.length || !bookSpecialist || !bookDate || !bookTime) return;
    setConfirming(true);
    try {
      await bookingService.createBooking({
        businessId: business.id,
        branchId: bookBranch?._id,
        serviceId: bookServices[0]._id,
        serviceIds: bookServices.map(s => s._id),
        specialistId: bookSpecialist._id,
        bookingDate: bookDate,
        startTime: bookTime.startTime,
        customerInfo: { firstName: "Admin", lastName: "Admin", email: "admin@admin.com", phone: "" },
        notes: "",
        isGuestBooking: false,
      });
      setConfirmed(true);
      onBooked();
      setTimeout(() => { onClose(); }, 1800);
    } catch (err) {
      console.error("Booking failed:", getErrorMessage(err, "Failed to create booking"));
    } finally {
      setConfirming(false);
    }
  };

  const calDays = generateCalendar(calDate);
  const monthYearLabel = `${months[calDate.getMonth()]} ${calDate.getFullYear()}`;
  const progress = ((stepIdx + 1) / steps.length) * 100;
  const anyAllowsCustomTime = bookServices.some(s => s.allowSpecificTimes);
  const totalDuration = bookServices.reduce((a, s) => a + s.duration, 0);
  const totalPrice = bookServices.reduce((a, s) => a + s.price?.amount, 0);

  const STEP_LABELS: Record<WizardStep, string> = {
    branch: "Choose Branch", service: "Choose Services",
    specialist: "Choose Specialist", date: "Pick a Date",
    time: "Pick a Time", confirm: "Confirm Booking",
  };

  const STEP_ICONS: Record<WizardStep, React.ReactNode> = {
    branch: <Building2 size={18} />, service: <Briefcase size={18} />,
    specialist: <User2 size={18} />, date: <CalendarDays size={18} />,
    time: <Clock size={18} />, confirm: <Zap size={18} />,
  };

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[92dvh]">

        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="h-1 mx-5 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
          <div className="h-full bg-teal-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0">
          <button onClick={stepIdx > 0 ? goBack : onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0">
            {stepIdx > 0 ? <ChevronLeft size={18} /> : <X size={18} />}
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-teal-700">{STEP_ICONS[currentStep]}</span>
              <h3 className="font-semibold text-gray-900">{STEP_LABELS[currentStep]}</h3>
              {currentStep === "service" && bookServices.length > 0 && (
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">
                  {bookServices.length} selected
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Step {stepIdx + 1} of {steps.length}</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Summary chips */}
        {stepIdx > 0 && (
          <div className="flex gap-2 px-5 pb-3 overflow-x-auto flex-shrink-0 scrollbar-hide">
            {bookBranch && hasBranchChoice && (
              <Chip icon={<Building2 size={11} />} label={bookBranch.address?.street || "Branch"} onClick={() => setStepIdx(steps.indexOf("branch"))} />
            )}
            {bookServices.length > 0 && (
              <Chip
                icon={<Briefcase size={11} />}
                label={bookServices.length === 1 ? bookServices[0].name : `${bookServices.length} services`}
                onClick={() => setStepIdx(steps.indexOf("service"))}
              />
            )}
            {bookSpecialist && (
              <Chip icon={<User2 size={11} />} label={bookSpecialist.name} onClick={() => setStepIdx(steps.indexOf("specialist"))} />
            )}
            {bookDate && (
              <Chip icon={<CalendarDays size={11} />}
                label={new Date(bookDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                onClick={() => setStepIdx(steps.indexOf("date"))} />
            )}
            {bookTime && (
              <Chip icon={<Clock size={11} />} label={bookTime.startTime} onClick={() => setStepIdx(steps.indexOf("time"))} />
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 pb-4 min-h-0">

          {/* ── BRANCH ── */}
          {currentStep === "branch" && (
            <div className="space-y-3">
              {branches.map(b => (
                <button key={b._id} onClick={() => { setBookBranch(b); setBookServices([]); setBookSpecialist(null); setBookDate(null); setBookTime(null); goNext(); }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${bookBranch?._id === b._id ? "border-teal-700 bg-teal-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Building2 size={18} className="text-teal-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {b.address?.street}
                        {b.isBaseBranch && <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-bold">Main</span>}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">{b.address?.city}</div>
                    </div>
                  </div>
                  {bookBranch?._id === b._id && <Check size={18} className="text-teal-700 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}

          {/* ── SERVICE — multi-select, no auto-advance ── */}
          {currentStep === "service" && (
            <div className="space-y-3">
              {branchServices.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">No services available at this branch.</p>
              )}
              {(branchServices as TService[]).map(s => {
                const isSelected = bookServices.some(sel => sel._id === s._id);
                return (
                  <button key={s._id}
                    onClick={() => toggleService(s)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${isSelected ? "border-teal-700 bg-teal-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}>
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? "bg-teal-700 border-teal-700" : "border-gray-300 bg-white"}`}>
                      {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase size={18} className="text-teal-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold ${isSelected ? "text-teal-800" : "text-gray-900"}`}>{s.name}</div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1"><Clock size={12} />{s.duration}min</span>
                        <span className="flex items-center gap-1"><DollarSign size={12} />{s.price?.amount}</span>
                      </div>
                    </div>
                    {isSelected && <Check size={18} className="text-teal-700 flex-shrink-0" />}
                  </button>
                );
              })}

              {/* Summary bar when services are selected */}
              {bookServices.length > 0 && (
                <div className="sticky bottom-0 mt-2 p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-teal-700 uppercase tracking-wide">{bookServices.length} service{bookServices.length > 1 ? "s" : ""} selected</p>
                    <div className="flex items-center gap-3 text-xs font-semibold text-teal-700">
                      <span className="flex items-center gap-1"><Clock size={11} />{totalDuration} min</span>
                      <span className="flex items-center gap-1"><DollarSign size={11} />{totalPrice}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {bookServices.map(s => (
                      <span key={s._id}
                        className="inline-flex items-center gap-1 text-xs bg-teal-700 text-white rounded-full px-2.5 py-1">
                        {s.name}
                        <button onClick={e => { e.stopPropagation(); toggleService(s); }} className="hover:opacity-70">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SPECIALIST ── */}
          {currentStep === "specialist" && (
            <div className="space-y-3">
              {filteredSpecialists.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8 px-4">
                  <p>No specialists available for all selected services.</p>
                  <button onClick={() => setStepIdx(steps.indexOf("service"))}
                    className="mt-2 text-teal-700 text-xs font-semibold underline">
                    Adjust services
                  </button>
                </div>
              )}
              {filteredSpecialists.map(sp => (
                <button key={sp._id} onClick={() => { setBookSpecialist(sp); setBookDate(null); setBookTime(null); goNext(); }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${bookSpecialist?._id === sp._id ? "border-teal-700 bg-teal-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"}`}>
                  <div className="flex items-center gap-3">
                    <SpecialistIcon url={sp?.photo?.url} name={sp.name} />
                    <div>
                      <span className="font-semibold text-gray-900">{sp.name}</span>
                      {bookServices.length > 1 && (
                        <p className="text-xs text-gray-400 mt-0.5">Can perform all {bookServices.length} selected services</p>
                      )}
                    </div>
                  </div>
                  {bookSpecialist?._id === sp._id && <Check size={18} className="text-teal-700 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}

          {/* ── DATE ── */}
          {currentStep === "date" && (
            <div>
              <div className="rounded-2xl p-4 bg-teal-50">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setCalDate(p => { const d = new Date(p); d.setMonth(p.getMonth() - 1); return d; })}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-teal-700 font-bold text-lg hover:bg-teal-100 transition-colors">←</button>
                  <span className="font-semibold text-teal-800">{monthYearLabel}</span>
                  <button onClick={() => setCalDate(p => { const d = new Date(p); d.setMonth(p.getMonth() + 1); return d; })}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-teal-700 font-bold text-lg hover:bg-teal-100 transition-colors">→</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {weekdays.map(d => <div key={d} className="text-xs font-bold text-teal-600 py-1">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calDays.map((dateObj, idx) => {
                    const isWorking = bookBranch?.workingHours?.some((e: any) => e.dayOfWeek === (dateObj?.getDay() ?? -1) && e.isOpen) ?? true;
                    const isPast = dateObj ? dateObj < today : false;
                    const isDisabled = !dateObj || isPast || !isWorking;
                    const isSelected = dateObj && bookDate === dateObj.ds;
                    return (
                      <div key={idx} className="aspect-square">
                        {dateObj && (
                          <button onClick={() => { if (!isDisabled) { setBookDate(dateObj.ds); setBookTime(null); } }} disabled={isDisabled}
                            className={["w-full h-full rounded-xl text-sm font-semibold transition-all",
                              isSelected ? "bg-teal-700 text-white shadow-md" :
                              isDisabled ? "text-gray-300 cursor-not-allowed" :
                              "hover:bg-white text-gray-700"].join(" ")}>
                            {dateObj.getDate()}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              {bookDate && (
                <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-teal-50 rounded-xl border border-teal-200 text-sm text-teal-700">
                  <Check size={16} className="flex-shrink-0" />
                  <span>Selected: <strong>{new Date(bookDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* ── TIME ── */}
          {currentStep === "time" && (
            <div>
              {loadingSlots ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-700" />
                  <p className="mt-3 text-sm text-gray-500">Loading available times...</p>
                </div>
              ) : slotsError && !slots.length ? (
                <div className="mt-2 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-sm text-center">{slotsError}</div>
              ) : (
                <>
                  <div className="rounded-2xl p-4 bg-gray-50 border border-teal-100">
                    <h4 className="text-sm font-bold text-teal-700 mb-3">Available Slots</h4>
                    <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block bg-green-50 border border-green-300" /> Available</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block bg-red-50 border border-red-200" /> Booked</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map((slot, idx) => {
                        const isSel = bookTime?.startTime === slot.startTime && !bookTime?.isCustomTime;
                        return (
                          <button key={idx}
                            onClick={() => { if (!slot.isAvailable) return; if (isSel) { setBookTime(null); } else { setBookTime({ ...slot, isCustomTime: false }); } }}
                            disabled={!slot.isAvailable}
                            className={["rounded-xl py-3 text-sm font-bold border-2 transition-all active:scale-95",
                              !slot.isAvailable ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed" :
                              isSel ? "bg-teal-700 border-teal-800 text-white shadow-md" :
                              "bg-white border-green-200 text-green-800 hover:border-green-400 hover:bg-green-50"].join(" ")}>
                            {slot.startTime}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {anyAllowsCustomTime && (
                    <div className="mt-4 rounded-2xl p-5 bg-teal-50 border border-teal-100">
                      <p className="text-center text-sm font-medium text-teal-600 mb-4">— or enter a custom time —</p>
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <ScrollPicker length={24} value={customHour} onChange={setCustomHour} />
                        <span className="text-3xl font-bold text-teal-700/50">:</span>
                        <ScrollPicker length={60} value={customMinute} onChange={setCustomMinute} />
                      </div>
                      <button onClick={validateCustomTime} disabled={validatingTime}
                        className="w-full py-3 bg-teal-700 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity">
                        {validatingTime ? "Validating..." : `Set ${customHour}:${customMinute}`}
                      </button>
                      {customTimeError && <p className="mt-2 text-sm text-red-600 text-center">{customTimeError}</p>}
                      {bookTime?.isCustomTime && !customTimeError && (
                        <p className="mt-2 text-sm text-green-700 text-center font-medium">✓ Custom time: {bookTime.startTime}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── CONFIRM ── */}
          {currentStep === "confirm" && (
            <div>
              {confirmed ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                    <CheckCircle2 size={36} className="text-teal-700" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">Booking Confirmed!</p>
                  <p className="text-sm text-gray-500">Closing...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-4">Review your booking details before confirming.</p>
                  <SummaryRow icon={<Building2 size={16} />} label="Branch" value={bookBranch?.address?.street || "—"} sub={bookBranch?.address?.city} />
                  {/* Services summary */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0 text-teal-700">
                      <Briefcase size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400 font-medium">Services</p>
                      {bookServices.map(s => (
                        <p key={s._id} className="text-sm font-semibold text-gray-900">{s.name}</p>
                      ))}
                      <p className="text-xs text-gray-400 mt-1">{totalDuration} min total · ${totalPrice}</p>
                    </div>
                  </div>
                  <SummaryRow icon={<User2 size={16} />} label="Specialist" value={bookSpecialist?.name || "—"} />
                  <SummaryRow icon={<CalendarDays size={16} />} label="Date" value={bookDate ? new Date(bookDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "—"} />
                  <SummaryRow icon={<Clock size={16} />} label="Time" value={bookTime ? `${bookTime.startTime} – ${bookTime.endTime}` : "—"} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {!confirmed && (
          <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
            {currentStep === "confirm" ? (
              <button onClick={handleConfirm} disabled={confirming}
                className="w-full py-4 bg-teal-700 text-white rounded-2xl text-base font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity active:scale-[0.98]">
                {confirming ? <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Zap size={18} />}
                {confirming ? "Confirming..." : "Confirm Booking"}
              </button>
            ) : currentStep === "service" ? (
              <button onClick={goNext} disabled={bookServices.length === 0}
                className="w-full py-4 bg-teal-700 text-white rounded-2xl text-base font-bold flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition-opacity active:scale-[0.98]">
                Continue with {bookServices.length > 0 ? `${bookServices.length} service${bookServices.length > 1 ? "s" : ""}` : "services"} <ChevronRight size={18} />
              </button>
            ) : currentStep === "date" ? (
              <button onClick={goNext} disabled={!bookDate}
                className="w-full py-4 bg-teal-700 text-white rounded-2xl text-base font-bold flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition-opacity active:scale-[0.98]">
                Continue <ChevronRight size={18} />
              </button>
            ) : currentStep === "time" ? (
              <button onClick={goNext} disabled={!bookTime}
                className="w-full py-4 bg-teal-700 text-white rounded-2xl text-base font-bold flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition-opacity active:scale-[0.98]">
                Review Booking <ChevronRight size={18} />
              </button>
            ) : null}
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

// Small helpers
function Chip({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-full text-xs font-medium text-teal-700 whitespace-nowrap flex-shrink-0 hover:bg-teal-100 transition-colors">
      {icon}{label}
    </button>
  );
}

function SummaryRow({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
      <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0 text-teal-700">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — QuickBookingBar
// ═══════════════════════════════════════════════════════════════════════════════

interface FilterOption2 { label: string; value: string; }

export interface QuickBookingBarProps {
  business: TBusiness;
  branchOptions: FilterOption2[];
  serviceOptions: FilterOption2[];
  specialistOptions: FilterOption2[];
  onFilterChange?: (filters: {
    branch: string | null; service: string | null;
    specialist: string | null; timeRange: { start: string; end: string };
  }) => void;
  onBooked?: () => void;
}

export function QuickBookingBar({
  business, branchOptions, serviceOptions, specialistOptions, onFilterChange, onBooked,
}: QuickBookingBarProps) {
  const [bookingMode, setBookingMode] = useState(false);
  const [mobileWizardOpen, setMobileWizardOpen] = useState(false);

  const [filterBranch, setFilterBranch] = useState<string | null>(null);
  const [filterService, setFilterService] = useState<string | null>(null);
  const [filterSpecialist, setFilterSpecialist] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });

  const [bookBranch, setBookBranch] = useState<any>(null);
  // ── Multi-select services for desktop bar ──
  const [bookServices, setBookServices] = useState<TService[]>([]);
  const [bookSpecialist, setBookSpecialist] = useState<TSpecialist | null>(null);
  const [bookDate, setBookDate] = useState<string | null>(null);
  const [bookTime, setBookTime] = useState<TimeSlot | null>(null);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [lastBooked, setLastBooked] = useState<TBooking | null>(null);

  useEffect(() => {
    onFilterChange?.({ branch: filterBranch, service: filterService, specialist: filterSpecialist, timeRange });
  }, [filterBranch, filterService, filterSpecialist, timeRange]);

  useEffect(() => {
    if (business.branches?.length === 1) setBookBranch(business.branches[0]);
  }, []);

  // Cascade resets
  useEffect(() => { setBookServices([]); setBookSpecialist(null); setBookDate(null); setBookTime(null); setSlots([]); setSlotsError(null); }, [bookBranch?._id]);
  useEffect(() => { setBookDate(null); setBookTime(null); setSlots([]); setSlotsError(null); }, [bookSpecialist?._id]);
  useEffect(() => { setBookTime(null); setSlots([]); setSlotsError(null); }, [bookDate]);

  // Toggle service for desktop; reset specialist if they can't cover new set
  const toggleBookService = (service: TService) => {
    setBookServices(prev => {
      const isSelected = prev.some(s => s._id === service._id);
      const next = isSelected ? prev.filter(s => s._id !== service._id) : [...prev, service];
      if (bookSpecialist) {
        const stillValid = next.every(svc =>
          bookSpecialist.services?.some(sp => (typeof sp === "string" ? sp : sp._id) === svc._id)
        );
        if (!stillValid) setBookSpecialist(null);
      }
      return next;
    });
    setBookDate(null);
    setBookTime(null);
    setSlots([]);
    setSlotsError(null);
  };

  const fetchSlots = useCallback(async () => {
    if (!bookSpecialist || bookServices.length === 0 || !bookDate) return;
    setLoadingSlots(true); setSlotsError(null);
    try {
      const data = await bookingService.getAvailability({
        specialistId: bookSpecialist._id,
        serviceId: bookServices[0]._id,
        serviceIds: bookServices.map(s => s._id).join(","),
        date: bookDate,
      });
      setSlots((data.slots ?? []) as TimeSlot[]);
      if (!data.slots?.length) setSlotsError("No time slots available for this date. Please try another date.");
    } catch (err) {
      setSlotsError(getErrorMessage(err, "Failed to load available slots"));
    } finally {
      setLoadingSlots(false);
    }
  }, [bookSpecialist, bookServices, bookDate]);

  useEffect(() => { if (bookDate && bookServices.length > 0 && bookSpecialist) fetchSlots(); }, [bookDate, bookServices.length, bookSpecialist?._id]);

  const branches = business.branches ?? [];
  const branchServices = (business.services ?? []).filter((s: any) => s.branch === bookBranch?._id);

  // Specialists who can perform ALL selected services
  const filteredSpecialists: TSpecialist[] = (business.specialists ?? []).filter(sp => {
    if (bookBranch && sp.branch !== bookBranch._id) return false;
    if (bookServices.length === 0) return true;
    if (!sp.services?.length) return false;
    return bookServices.every(selectedSvc =>
      sp.services.some(svc => (typeof svc === "string" ? svc : svc._id) === selectedSvc._id)
    );
  });

  const handleConfirm = async () => {
    if (!bookServices.length || !bookSpecialist || !bookDate || !bookTime) return;
    setConfirming(true);
    try {
      const booking = await bookingService.createBooking({
        businessId: business.id, branchId: bookBranch?._id,
        serviceId: bookServices[0]._id,
        serviceIds: bookServices.map(s => s._id),
        specialistId: bookSpecialist._id,
        bookingDate: bookDate, startTime: bookTime.startTime,
        customerInfo: { firstName: "Admin", lastName: "Admin", email: "admin@admin.com", phone: "" },
        notes: "", isGuestBooking: false,
      });
      setLastBooked(booking);
      onBooked?.();
      setBookBranch(business.branches?.length === 1 ? business.branches[0] : null);
      setBookServices([]); setBookSpecialist(null); setBookDate(null); setBookTime(null);
      setSlots([]); setSlotsError(null);
      setTimeout(() => setLastBooked(null), 3000);
    } catch (err) {
      console.error("Booking failed:", getErrorMessage(err, "Failed to create booking"));
    } finally {
      setConfirming(false);
    }
  };

  const bookingReady = !!(bookBranch && bookServices.length > 0 && bookSpecialist && bookDate && bookTime);

  return (
    <>
      {/* ── Desktop bar ── */}
      <div className="hidden md:flex w-full items-center gap-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="flex justify-between items-center flex-1 min-w-0">
          {!bookingMode ? (
            <>
              <FilterDropdown icon={<Building2 size={14} />} placeholder="All Branches" options={branchOptions} selected={filterBranch} onSelect={setFilterBranch} />
              <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
              <FilterDropdown icon={<Briefcase size={14} />} placeholder="All Services" options={serviceOptions} selected={filterService} onSelect={setFilterService} />
              <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
              <FilterDropdown icon={<User2 size={14} />} placeholder="All Specialists" options={specialistOptions} selected={filterSpecialist} onSelect={setFilterSpecialist} />
              <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
              <div className="bg-teal-700 rounded-full my-1 ml-1 flex-shrink-0">
                <TimeRangeFilter timeRange={timeRange} onChange={(s, e) => setTimeRange({ start: s, end: e })} />
              </div>
            </>
          ) : (
            <>
              {branches.length > 1 && (
                <>
                  <BranchBookingDropdown branches={branches} selected={bookBranch} onSelect={b => setBookBranch(b)} />
                  <div className="w-px h-5 bg-gray-100 flex-shrink-0" />
                </>
              )}
              <ServiceBookingDropdown
                services={branchServices as TService[]}
                selected={bookServices}
                onToggle={toggleBookService}
                disabled={!bookBranch}
              />
              <div className="w-px h-5 bg-gray-100 flex-shrink-0" />
              <SpecialistBookingDropdown specialists={filteredSpecialists} selected={bookSpecialist} onSelect={sp => setBookSpecialist(sp || null)} disabled={bookServices.length === 0} />
              <div className="w-px h-5 bg-gray-100 flex-shrink-0" />
              <DateBookingDropdown selected={bookDate} onSelect={ds => setBookDate(ds || null)} workingHours={bookBranch?.workingHours} disabled={!bookSpecialist} />
              <div className="w-px h-5 bg-gray-100 flex-shrink-0" />
              <TimeBookingDropdown selected={bookTime} onSelect={t => setBookTime(t)} slots={slots} loading={loadingSlots} error={slotsError} services={bookServices} specialist={bookSpecialist} date={bookDate} disabled={!bookDate} />
            </>
          )}
        </div>

        <div className="flex items-center flex-shrink-0">
          {bookingMode && (
            <button onClick={handleConfirm} disabled={!bookingReady || confirming}
              className={`flex items-center gap-2 mx-1.5 px-4 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${bookingReady && !confirming ? "bg-teal-700 text-white hover:opacity-90" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
              {confirming ? <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin" /> : <Zap size={14} />}
              Confirm
            </button>
          )}
          <button onClick={() => setBookingMode(p => !p)}
            className={`flex items-center gap-2 mr-0.5 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${bookingMode ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-teal-700 text-white hover:opacity-90 shadow-md"}`}>
            {bookingMode ? <><X size={14} /> Cancel</> : <><Zap size={14} /> Book Now</>}
          </button>
        </div>
      </div>

      {/* ── Mobile ── */}
      <button
        onClick={() => setMobileWizardOpen(true)}
        className="md:hidden flex items-center justify-center gap-2 w-full px-5 py-3 bg-teal-700 text-white rounded-2xl text-sm font-bold shadow-md hover:opacity-90 transition-opacity active:scale-[0.98]">
        <Zap size={16} />
        Book Now
      </button>

      {mobileWizardOpen && (
        <MobileBookingWizard
          business={business}
          onClose={() => setMobileWizardOpen(false)}
          onBooked={() => { onBooked?.(); setMobileWizardOpen(false); }}
        />
      )}

      {lastBooked && (
        <div className="fixed bottom-6 right-6 bg-teal-700 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 z-[100]">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold">Booking confirmed!</p>
            <p className="text-xs text-white/60">Admin booking created successfully</p>
          </div>
        </div>
      )}
    </>
  );
}