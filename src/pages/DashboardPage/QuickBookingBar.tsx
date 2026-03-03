import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Building2, Briefcase, User2, CalendarDays, Clock,
  Check, ChevronDown, X, Zap, CheckCircle2, DollarSign,
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

// Exact copy from BookingModal
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
  if (url) return <img src={url} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />;
  return (
    <div className="w-6 h-6 rounded-full bg-[#3D2B2B] flex items-center justify-center flex-shrink-0">
      <span className="text-white text-[10px] font-bold">
        {name.split(" ").slice(0, 2).map(e => e[0]).join("")}
      </span>
    </div>
  );
}

// ── ScrollPicker — exact copy from BookingModal ───────────────────────────────

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
      <button onClick={() => step(-1)} className="z-20 p-2 text-primary hover:scale-110 active:scale-95 transition-transform">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <div className="relative h-[120px] w-16 overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-10 border-y border-primary/20 bg-primary/5 pointer-events-none" />
        <div ref={scrollRef} onScroll={handleScroll}
          className="h-full overflow-y-auto snap-y snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollPaddingBlock: "40px" }}>
          <div style={{ height: "40px" }} />
          {Array.from({ length }, (_, i) => {
            const padded = i.toString().padStart(2, "0");
            const isActive = value === padded;
            return (
              <div key={i} onClick={() => onChange(padded)}
                className={`h-10 flex items-center justify-center text-xl font-medium transition-all duration-200 snap-center cursor-pointer ${isActive ? "text-primary scale-125 font-bold" : "text-gray-400 scale-100"}`}>
                {padded}
              </div>
            );
          })}
          <div style={{ height: "40px" }} />
        </div>
      </div>
      <button onClick={() => step(1)} className="z-20 p-2 text-primary hover:scale-110 active:scale-95 transition-transform">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

// ── Shared portal dropdown shell ──────────────────────────────────────────────

function usePortalDropdown() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const openDropdown = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 220) });
    }
    setOpen(true);
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return { open, setOpen, pos, btnRef, menuRef, openDropdown };
}

// ── BookingDropdownTrigger — the pill button in the bar ───────────────────────

const BookingTrigger = React.forwardRef<HTMLButtonElement, {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  active?: boolean;
  done?: boolean;
  locked?: boolean;
  onClick: () => void;
  onClear?: () => void;
}>(function BookingTrigger({ icon, label, sublabel, active, done, locked, onClick, onClear }, ref) {
  return (
    <button
      ref={ref}
      onClick={locked ? undefined : onClick}
      className={[
        "flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap transition-all min-w-0",
        locked ? "opacity-35 cursor-not-allowed text-gray-400" :
        done ? "text-gray-900 cursor-pointer hover:opacity-80" :
        active ? "text-gray-900 cursor-pointer" :
        "text-gray-500 cursor-pointer hover:text-gray-700",
      ].join(" ")}
    >
      <span className={done ? "text-[#3D2B2B]" : "text-gray-400"}>{icon}</span>
      <div className="flex flex-col items-start min-w-0">
        <span className={`leading-tight truncate max-w-[120px] ${done ? "text-gray-900 font-semibold text-xs" : "text-sm"}`}>
          {label}
        </span>
        {sublabel && <span className="text-[10px] text-gray-400 leading-tight truncate max-w-[120px]">{sublabel}</span>}
      </div>
      {done && onClear ? (
        <span
          role="button"
          onClick={e => { e.stopPropagation(); onClear(); }}
          className="ml-0.5 rounded-full hover:bg-gray-100 p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={11} />
        </span>
      ) : (
        !locked && <ChevronDown size={11} className={`text-gray-400 transition-transform flex-shrink-0 ${active ? "rotate-180" : ""}`} />
      )}
    </button>
  );
});

// ── Filter dropdowns (for the left filter side) ───────────────────────────────

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
              className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-3 transition-colors ${selected === opt.value ? "bg-[#3D2B2B] text-white font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3D2B2B]" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">End</label>
              <input type="time" value={le} onChange={e => setLe(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3D2B2B]" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setLs(""); setLe(""); onChange("", ""); setOpen(false); }}
                className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Clear</button>
              <button onClick={() => { onChange(ls, le); setOpen(false); }}
                className="flex-1 py-2 text-sm font-medium text-white bg-[#3D2B2B] rounded-lg hover:opacity-90 transition-opacity">Apply</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ── Booking Dropdowns ─────────────────────────────────────────────────────────

// Branch dropdown
function BranchBookingDropdown({ branches, selected, onSelect, disabled }: {
  branches: any[]; selected: any; onSelect: (b: any) => void; disabled?: boolean;
}) {
  const { open, setOpen, pos, btnRef, menuRef, openDropdown } = usePortalDropdown();
  return (
    <>
      <BookingTrigger
        ref={btnRef}
        icon={<Building2 size={14} />}
        label={selected ? selected.address?.street || "Branch" : "Branch"}
        sublabel={selected ? selected.address?.city : undefined}
        done={!!selected}
        locked={disabled}
        active={open}
        onClick={openDropdown}
        onClear={selected ? () => onSelect(null) : undefined}
      />
      {open && createPortal(
        <div ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 overflow-hidden">
          {branches.map(b => (
            <button key={b._id} onClick={() => { onSelect(b); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors ${selected?._id === b._id ? "bg-[#3D2B2B] text-white" : "text-gray-700 hover:bg-gray-50"}`}>
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

// Service dropdown
function ServiceBookingDropdown({ services, selected, onSelect, disabled }: {
  services: TService[]; selected: TService | null; onSelect: (s: TService) => void; disabled?: boolean;
}) {
  const { open, setOpen, pos, btnRef, menuRef, openDropdown } = usePortalDropdown();
  return (
    <>
      <BookingTrigger
        ref={btnRef}
        icon={<Briefcase size={14} />}
        label={selected ? selected.name : "Service"}
        sublabel={selected ? `${selected.duration}min · $${selected.price?.amount}` : undefined}
        done={!!selected}
        locked={disabled}
        active={open}
        onClick={openDropdown}
        onClear={selected ? () => onSelect(null as any) : undefined}
      />
      {open && createPortal(
        <div ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 overflow-hidden">
          {services.length === 0
            ? <p className="px-4 py-3 text-sm text-gray-400">No services at this branch</p>
            : services.map(s => (
              <button key={s._id} onClick={() => { onSelect(s); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors ${selected?._id === s._id ? "bg-[#3D2B2B] text-white" : "text-gray-700 hover:bg-gray-50"}`}>
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className={`flex items-center gap-2 text-xs mt-0.5 ${selected?._id === s._id ? "text-white/60" : "text-gray-400"}`}>
                    <span className="flex items-center gap-0.5"><Clock size={10} />{s.duration}min</span>
                    <span className="flex items-center gap-0.5"><DollarSign size={10} />{s.price?.amount}</span>
                  </div>
                </div>
                {selected?._id === s._id && <Check size={14} />}
              </button>
            ))}
        </div>,
        document.body
      )}
    </>
  );
}

// Specialist dropdown
function SpecialistBookingDropdown({ specialists, selected, onSelect, disabled }: {
  specialists: TSpecialist[]; selected: TSpecialist | null; onSelect: (s: TSpecialist) => void; disabled?: boolean;
}) {
  const { open, setOpen, pos, btnRef, menuRef, openDropdown } = usePortalDropdown();
  return (
    <>
      <BookingTrigger
        ref={btnRef}
        icon={<User2 size={14} />}
        label={selected ? selected.name : "Specialist"}
        done={!!selected}
        locked={disabled}
        active={open}
        onClick={openDropdown}
        onClear={selected ? () => onSelect(null as any) : undefined}
      />
      {open && createPortal(
        <div ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 overflow-hidden">
          {specialists.length === 0
            ? <p className="px-4 py-3 text-sm text-gray-400">No specialists for this service</p>
            : specialists.map(sp => (
              <button key={sp._id} onClick={() => { onSelect(sp); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${selected?._id === sp._id ? "bg-[#3D2B2B] text-white" : "text-gray-700 hover:bg-gray-50"}`}>
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

// Date dropdown — exact BookingModal calendar
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
      <BookingTrigger
        ref={btnRef}
        icon={<CalendarDays size={14} />}
        label={displayLabel}
        done={!!selected}
        locked={disabled}
        active={open}
        onClick={openDropdown}
        onClear={selected ? () => { onSelect(null as any); } : undefined}
      />
      {open && createPortal(
        <div ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
          {/* Calendar — exact same as BookingModal */}
          <div className="rounded-xl p-4 bg-primary/5 border-0">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => changeMonth(-1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors font-bold text-lg text-secondary">←</button>
              <span className="font-semibold text-sm text-[#3D2B2B]">{monthYearLabel}</span>
              <button onClick={() => changeMonth(1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors font-bold text-lg text-secondary">→</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {weekdays.map(d => (
                <div key={d} className="font-semibold py-1 text-xs text-primary">{d}</div>
              ))}
              {calDays.map((dateObj, idx) => {
                const isWorking = workingHours?.some(
                  (e: any) => e.dayOfWeek === (dateObj?.getDay() ?? -1) && e.isOpen
                ) ?? false;
                const isPast = dateObj ? dateObj < today : false;
                const isDisabled = !dateObj || isPast || !isWorking;
                const isSelected = dateObj && selected === dateObj.ds;
                return (
                  <div key={idx}>
                    {dateObj && (
                      <button
                        onClick={() => { if (!isDisabled) { onSelect(dateObj.ds); setOpen(false); } }}
                        disabled={isDisabled}
                        className={[
                          "w-full aspect-square rounded-md text-[13px] transition-colors flex items-center justify-center",
                          isSelected ? "bg-[#3D2B2B] text-white font-bold" :
                          isDisabled ? "text-gray-300 cursor-not-allowed" :
                          "hover:bg-primary/20 cursor-pointer",
                        ].join(" ")}>
                        {dateObj.getDate()}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Working hours — exact same as BookingModal */}
          {selected && workingHours && (
            <div className="mx-3 mb-3 rounded-lg p-2.5 flex items-center gap-2 text-xs bg-primary/5 border border-primary/20 text-[#3D2B2B]">
              <Clock className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
              <span className="font-semibold">Working Hours:</span>
              <span className="text-secondary">
                {(() => {
                  const day = new Date(selected + "T00:00:00").getDay();
                  const s = workingHours.find((wh: any) => wh.dayOfWeek === day);
                  if (!s?.isOpen) return "Closed";
                  if (s.hasBreak && s.breakStart && s.breakEnd)
                    return `${s.openTime} - ${s.breakStart}, ${s.breakEnd} - ${s.closeTime}`;
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

// Time dropdown — exact BookingModal slots + ScrollPicker custom time
function TimeBookingDropdown({ selected, onSelect, slots, loading, error, service, specialist, date, disabled }: {
  selected: TimeSlot | null; onSelect: (t: TimeSlot | null) => void;
  slots: TimeSlot[]; loading: boolean; error: string | null;
  service: TService | null; specialist: TSpecialist | null; date: string | null; disabled?: boolean;
}) {
  const { open, setOpen, pos, btnRef, menuRef, openDropdown } = usePortalDropdown();
  const [customHour, setCustomHour] = useState("00");
  const [customMinute, setCustomMinute] = useState("00");
  const [customTimeError, setCustomTimeError] = useState("");
  const [validatingTime, setValidatingTime] = useState(false);

  const label = selected ? selected.startTime : "Time";

  // validateCustomTime — exact same as BookingModal
  const validateCustomTime = async () => {
    if (!customHour || !customMinute || !specialist || !service || !date) return;
    setValidatingTime(true);
    setCustomTimeError("");
    try {
      const res = await bookingService.validateCustomTime({
        specialistId: specialist._id,
        serviceId: service._id,
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
      setCustomHour(h);
      setCustomMinute(m);
      setCustomTimeError("");
      onSelect({ ...slot, isCustomTime: false });
      setOpen(false);
    }
  };

  return (
    <>
      <BookingTrigger
        ref={btnRef}
        icon={<Clock size={14} />}
        label={label}
        done={!!selected}
        locked={disabled}
        active={open}
        onClick={openDropdown}
        onClear={selected ? () => onSelect(null) : undefined}
      />
      {open && createPortal(
        <div ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, minWidth: Math.max(pos.width, 300), zIndex: 9999 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4">
            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="mt-2 text-sm text-gray-500">Loading available times...</p>
              </div>
            ) : error && !slots.length ? (
              <div className="text-center py-3 rounded-xl text-sm bg-amber-50 border border-amber-200 text-amber-700">{error}</div>
            ) : (
              <>
                {/* Slots — exact same as BookingModal */}
                <div className="rounded-xl p-4 bg-gray-50 border border-[#ede5e5]">
                  <h4 className="text-sm font-semibold mb-3 text-[#3D2B2B]">Available Time Slots</h4>
                  <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block bg-green-50 border border-green-300" /> Available</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block bg-red-50 border border-red-200" /> Booked</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {slots.map((slot, idx) => {
                        const isSel = selected?.startTime === slot.startTime && !selected?.isCustomTime;
                        return (
                          <button key={idx} onClick={() => selectSlot(slot)} disabled={!slot.isAvailable}
                            className={[
                              "rounded-lg py-2 px-1 text-[13px] font-semibold border-2 transition-all",
                              !slot.isAvailable ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed" :
                              isSel ? "bg-green-700 border-green-800 text-white" :
                              "bg-green-50 border-green-300 text-green-800 hover:bg-green-100",
                            ].join(" ")}>
                            {slot.startTime}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Custom time picker — exact same as BookingModal, gated on allowSpecificTimes */}
                {service?.allowSpecificTimes && (
                  <div className="rounded-xl p-5 mt-3 bg-primary/5 border border-[#e5dada]">
                    <p className="text-center text-sm mb-4 text-secondary">— or enter a custom time —</p>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <ScrollPicker length={24} value={customHour} onChange={setCustomHour} />
                      <span className="text-3xl font-bold text-primary/50">:</span>
                      <ScrollPicker length={60} value={customMinute} onChange={setCustomMinute} />
                      <div className="ml-2 px-4 py-2 bg-white rounded-xl shadow border-2 border-primary/30 font-mono text-xl font-bold min-w-[80px] text-center text-[#3D2B2B]">
                        {customHour && customMinute ? `${customHour}:${customMinute}` : <span className="text-gray-300">--:--</span>}
                      </div>
                    </div>
                    {customHour && customMinute && (
                      <div className="text-center">
                        <button onClick={validateCustomTime} disabled={validatingTime}
                          className="bg-[#3D2B2B] text-white rounded-xl py-3 px-8 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity">
                          {validatingTime ? "Validating..." : "Set This Time"}
                        </button>
                      </div>
                    )}
                    {selected?.isCustomTime && !customTimeError && (
                      <p className="mt-3 p-3 rounded-lg text-sm bg-green-50 border border-green-300 text-green-800">
                        ✓ Custom time set: <strong>{selected.startTime}</strong>
                      </p>
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

// ── Main Export ───────────────────────────────────────────────────────────────

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
  // ── Mode ─────────────────────────────────────────────────────────────────
  const [bookingMode, setBookingMode] = useState(false);

  // ── Filter state ─────────────────────────────────────────────────────────
  const [filterBranch, setFilterBranch] = useState<string | null>(null);
  const [filterService, setFilterService] = useState<string | null>(null);
  const [filterSpecialist, setFilterSpecialist] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });

  // ── Booking state ─────────────────────────────────────────────────────────
  const [bookBranch, setBookBranch] = useState<any>(null);
  const [bookService, setBookService] = useState<TService | null>(null);
  const [bookSpecialist, setBookSpecialist] = useState<TSpecialist | null>(null);
  const [bookDate, setBookDate] = useState<string | null>(null);
  const [bookTime, setBookTime] = useState<TimeSlot | null>(null);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [confirming, setConfirming] = useState(false);
  const [lastBooked, setLastBooked] = useState<TBooking | null>(null);

  // Propagate filter changes
  useEffect(() => {
    onFilterChange?.({ branch: filterBranch, service: filterService, specialist: filterSpecialist, timeRange });
  }, [filterBranch, filterService, filterSpecialist, timeRange]);

  // Auto-select single branch
  useEffect(() => {
    if (business.branches?.length === 1) setBookBranch(business.branches[0]);
  }, []);

  // Reset downstream when branch changes
  useEffect(() => {
    setBookService(null); setBookSpecialist(null); setBookDate(null); setBookTime(null);
    setSlots([]); setSlotsError(null);
  }, [bookBranch?._id]);

  // Reset specialist when service changes
  useEffect(() => {
    setBookSpecialist(null); setBookDate(null); setBookTime(null);
    setSlots([]); setSlotsError(null);
  }, [bookService?._id]);

  // Reset date/time when specialist changes
  useEffect(() => {
    setBookDate(null); setBookTime(null); setSlots([]); setSlotsError(null);
  }, [bookSpecialist?._id]);

  // Reset time when date changes
  useEffect(() => {
    setBookTime(null); setSlots([]); setSlotsError(null);
  }, [bookDate]);

  // Fetch slots — exact same as BookingModal
  const fetchSlots = useCallback(async () => {
    if (!bookSpecialist || !bookService || !bookDate) return;
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const data = await bookingService.getAvailability({
        specialistId: bookSpecialist._id,
        serviceId: bookService._id,
        date: bookDate,
      });
      setSlots((data.slots ?? []) as TimeSlot[]);
      if (!data.slots?.length) setSlotsError("No time slots available for this date. Please try another date.");
    } catch (err) {
      setSlotsError(getErrorMessage(err, "Failed to load available slots"));
    } finally {
      setLoadingSlots(false);
    }
  }, [bookSpecialist, bookService, bookDate]);

  useEffect(() => {
    if (bookDate && bookService && bookSpecialist) fetchSlots();
  }, [bookDate, bookService?._id, bookSpecialist?._id]);

  // Filtered data — exact same logic as BookingModal
  const branchServices = (business.services ?? []).filter((s: any) => s.branch === bookBranch?._id);
  const filteredSpecialists: TSpecialist[] = (business.specialists ?? []).filter(sp => {
    if (bookBranch && sp.branch !== bookBranch._id) return false;
    if (!bookService) return true;
    if (!sp.services?.length) return false;
    return sp.services.some(svc => (typeof svc === "string" ? svc : svc._id) === bookService._id);
  });

  // Confirm — exact same as BookingModal createBooking, admin info
  const handleConfirm = async () => {
    if (!bookService || !bookSpecialist || !bookDate || !bookTime) return;
    setConfirming(true);
    try {
      const booking = await bookingService.createBooking({
        businessId: business.id,
        branchId: bookBranch?._id,
        serviceId: bookService._id,
        specialistId: bookSpecialist._id,
        bookingDate: bookDate,
        startTime: bookTime.startTime,
        customerInfo: { firstName: "Admin", lastName: "Admin", email: "admin@admin.com", phone: "" },
        notes: "",
        isGuestBooking: false,
      });
      setLastBooked(booking);
      onBooked?.();
      // Reset booking fields
      setBookBranch(business.branches?.length === 1 ? business.branches[0] : null);
      setBookService(null); setBookSpecialist(null); setBookDate(null); setBookTime(null);
      setSlots([]); setSlotsError(null);
      setTimeout(() => setLastBooked(null), 3000);
    } catch (err) {
      console.error("Booking failed:", getErrorMessage(err, "Failed to create booking"));
    } finally {
      setConfirming(false);
    }
  };

  const bookingReady = !!(bookBranch && bookService && bookSpecialist && bookDate && bookTime);

  return (
    <>
      <div className="flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">

        {/* ── Contents swap based on mode ── */}
        <div className="flex items-center flex-1 min-w-0">
          {!bookingMode ? (
            /* ── Filter mode ── */
            <>
              <FilterDropdown icon={<Building2 size={14} />} placeholder="All Branches" options={branchOptions} selected={filterBranch} onSelect={setFilterBranch} />
              <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
              <FilterDropdown icon={<Briefcase size={14} />} placeholder="All Services" options={serviceOptions} selected={filterService} onSelect={setFilterService} />
              <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
              <FilterDropdown icon={<User2 size={14} />} placeholder="All Specialists" options={specialistOptions} selected={filterSpecialist} onSelect={setFilterSpecialist} />
              <div className="w-px h-5 bg-gray-200 flex-shrink-0" />
              <div className="bg-[#3D2B2B] rounded-xl my-1 ml-1 flex-shrink-0">
                <TimeRangeFilter timeRange={timeRange} onChange={(s, e) => setTimeRange({ start: s, end: e })} />
              </div>
            </>
          ) : (
            /* ── Booking mode ── */
            <>
              {business.branches && business.branches.length > 1 && (
                <>
                  <BranchBookingDropdown
                    branches={business.branches}
                    selected={bookBranch}
                    onSelect={b => setBookBranch(b)}
                  />
                  <div className="w-px h-5 bg-gray-100 flex-shrink-0" />
                </>
              )}
              <ServiceBookingDropdown
                services={branchServices as TService[]}
                selected={bookService}
                onSelect={s => setBookService(s || null)}
                disabled={!bookBranch}
              />
              <div className="w-px h-5 bg-gray-100 flex-shrink-0" />
              <SpecialistBookingDropdown
                specialists={filteredSpecialists}
                selected={bookSpecialist}
                onSelect={sp => setBookSpecialist(sp || null)}
                disabled={!bookService}
              />
              <div className="w-px h-5 bg-gray-100 flex-shrink-0" />
              <DateBookingDropdown
                selected={bookDate}
                onSelect={ds => setBookDate(ds || null)}
                workingHours={bookBranch?.workingHours}
                disabled={!bookSpecialist}
              />
              <div className="w-px h-5 bg-gray-100 flex-shrink-0" />
              <TimeBookingDropdown
                selected={bookTime}
                onSelect={t => setBookTime(t)}
                slots={slots}
                loading={loadingSlots}
                error={slotsError}
                service={bookService}
                specialist={bookSpecialist}
                date={bookDate}
                disabled={!bookDate}
              />
            </>
          )}
        </div>

        {/* ── Right buttons ── */}
        <div className="flex items-center flex-shrink-0">
          {/* Confirm — only in booking mode */}
          {bookingMode && (
            <button
              onClick={handleConfirm}
              disabled={!bookingReady || confirming}
              className={`flex items-center gap-2 mx-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${bookingReady && !confirming ? "bg-[#3D2B2B] text-white hover:opacity-90" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            >
              {confirming
                ? <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin" />
                : <Zap size={14} />}
              Confirm
            </button>
          )}

          {/* Book Now / Cancel toggle */}
          <button
            onClick={() => setBookingMode(p => !p)}
            className={`flex items-center gap-2 mr-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${bookingMode ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-[#3D2B2B] text-white hover:opacity-90 shadow-md"}`}
          >
            {bookingMode ? <><X size={14} /> Cancel</> : <><Zap size={14} /> Book Now</>}
          </button>
        </div>
      </div>

      {/* Success toast */}
      {lastBooked && (
        <div className="fixed bottom-6 right-6 bg-[#3D2B2B] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 z-[100]">
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