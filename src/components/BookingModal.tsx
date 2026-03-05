import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Phone, Clock, DollarSign, X } from "lucide-react";
import { PhoneInput } from "@/components/PhoneInput";
import { MapWithCoords } from "@/components/MapWithCoords";
import { GoogleMapButton } from "@/components/GoogleMapButton";
import { YandexMapButton } from "@/components/YandexMapButton";
import { bookingService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { isValidPhone, isValidEmail } from "@/services/validation";
import type {
  TBusiness,
  TCustomerInfo,
  TService,
  TSpecialist,
  TBooking,
} from "@/types";
import { months, weekdays } from "@/constants";
import { formatPhone } from "@/services/format";

interface Props {
  business: TBusiness;
  editBooking?: any;
  mode?: "create" | "edit";
  onClose: () => void;
  onConfirmed: (booking: TBooking) => void;
  selectedBranch?: any;
}

const STEPS = [
  { num: 1, label: "Select Branch", short: "Branch" },
  { num: 2, label: "Service & Specialist", short: "Service" },
  { num: 3, label: "Date & Time", short: "Date" },
  { num: 4, label: "Your Info", short: "Info" },
  { num: 5, label: "Phone Verify", short: "Verify" },
] as const;

const DEMO_CODE = "0000";

// ── Error helper ──────────────────────────────────────────────────────────────

function getErrorMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ??
    (err as { message?: string })?.message ??
    fallback
  );
}

// ── Form validation ───────────────────────────────────────────────────────────

function validateInfoForm(
  customerInfo: TCustomerInfo,
  isValidEmail: (email: string) => boolean,
  isValidPhone: (phone: string) => boolean,
): Partial<TCustomerInfo> {
  const errors: Partial<TCustomerInfo> = {};
  if (!customerInfo.firstName) errors.firstName = "Full name is required";
  if (!isValidEmail(customerInfo.email))
    errors.email = "Enter a valid email address";
  if (!isValidPhone(customerInfo.phone))
    errors.phone = "Enter a valid phone number (8–15 digits)";
  return errors;
}

// ── Calendar generator ────────────────────────────────────────────────────────

function generateCalendar(calendarDate: Date): (CalendarDate | null)[] {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const startDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (CalendarDate | null)[] = Array(startDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d) as CalendarDate;
    date.dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push(date);
  }
  return days;
}

// ── Step gate ────────────────────────────────────────────────────────────────

function canGoToStep(
  num: number,
  {
    selectedBranch,
    selectedService,
    selectedSpecialist,
    selectedDate,
    selectedTime,
    sentCode,
  }: {
    selectedBranch: unknown;
    selectedService: unknown;
    selectedSpecialist: unknown;
    selectedDate: string | null;
    selectedTime: TimeSlot | null;
    sentCode: string;
  },
  mode: "create" | "edit" = "create",
): boolean {
  if (mode === "edit" && num === 5) return false;
  if (num <= 1) return true;
  if (num === 2) return !!selectedBranch;
  if (num === 3) return !!(selectedService && selectedSpecialist);
  if (num === 4) return !!(selectedDate && selectedTime);
  if (num === 5) return !!sentCode;
  return false;
}

// ── Service icon helper ───────────────────────────────────────────────────────

export function Icon({ url, name }: { url: string; name: string }) {
  if (url) {
    return <img src={url} className="w-8 h-8 rounded-full" />;
  }
  return (
    <div className="w-8 h-8 rounded-full uppercase text-center flex items-center justify-center bg-primary">
      <span className="font-bold text-white text-sm">
        {name
          .split(" ")
          .slice(0, 2)
          .map((e) => e[0])
          .join("")}
      </span>
    </div>
  );
}

// ── Scroll Picker ─────────────────────────────────────────────────────────────

interface ScrollPickerProps {
  length: number;
  value: string;
  onChange: (v: string) => void;
}

const ScrollPicker = ({ length, value, onChange }: ScrollPickerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemHeight = 40;

  const scrollToValue = useCallback(
    (val: string, behavior: ScrollBehavior = "smooth") => {
      if (scrollRef.current) {
        const index = parseInt(val);
        scrollRef.current.scrollTo({
          top: index * itemHeight,
          behavior,
        });
      }
    },
    [],
  );

  useEffect(() => {
    scrollToValue(value);
  }, [value, scrollToValue]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const newValue = index.toString().padStart(2, "0");
    if (newValue !== value && index >= 0 && index < length) {
      onChange(newValue);
    }
  };

  const step = (dir: number) => {
    const currentIndex = parseInt(value);
    const nextIndex = (currentIndex + dir + length) % length;
    onChange(nextIndex.toString().padStart(2, "0"));
  };

  return (
    <div className="flex flex-col items-center select-none">
      <button
        onClick={() => step(-1)}
        className="z-20 p-2 text-primary hover:scale-110 active:scale-95 transition-transform"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <div className="relative h-[120px] w-16 overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-10 border-y border-primary/20 bg-primary/5 pointer-events-none" />
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollPaddingBlock: "40px",
          }}
        >
          <div style={{ height: "40px" }} />
          {Array.from({ length }, (_, i) => {
            const padded = i.toString().padStart(2, "0");
            const isActive = value === padded;
            return (
              <div
                key={i}
                onClick={() => onChange(padded)}
                className={`h-10 flex items-center justify-center text-xl font-medium transition-all duration-200 snap-center cursor-pointer
                  ${isActive ? "text-primary scale-125 font-bold" : "text-gray-400 scale-100"}`}
              >
                {padded}
              </div>
            );
          })}
          <div style={{ height: "40px" }} />
        </div>
      </div>

      <button
        onClick={() => step(1)}
        className="z-20 p-2 text-primary hover:scale-110 active:scale-95 transition-transform"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────

export const BookingModal = ({
  business,
  onClose,
  onConfirmed,
  editBooking,
  mode = "create",
  selectedBranch: preSelectedBranch,
}: Props) => {
  const { user } = useAuth();
  const isEditMode = mode === "edit" && !!editBooking;

  const initializeFromBooking = () => {
    if (!isEditMode || !editBooking) return null;
    const bookingDateObj = new Date(editBooking.bookingDate);
    const dateString = `${bookingDateObj.getFullYear()}-${String(bookingDateObj.getMonth() + 1).padStart(2, "0")}-${String(bookingDateObj.getDate()).padStart(2, "0")}`;
    return {
      branch: editBooking.branch,
      service: Array.isArray(editBooking.services)
        ? editBooking.services[0]
        : editBooking.services,
      specialist: editBooking.specialist,
      date: dateString,
      time: {
        startTime: editBooking.startTime,
        endTime: editBooking.endTime,
        isAvailable: true,
        isCustomTime: false,
        duration: editBooking.totalDuration,
      },
      customerInfo: {
        firstName: editBooking.customerInfo.firstName,
        lastName: editBooking.customerInfo.lastName,
        email: editBooking.customerInfo.email,
        phone: editBooking.customerInfo.phone,
        notes: editBooking.notes || "",
      },
    };
  };

  const initialData = initializeFromBooking();

  const getInitialStep = () => {
    if (preSelectedBranch) return 2;
    return 1;
  };

  const [step, setStep] = useState(getInitialStep());

  const [selectedBranch, setSelectedBranch] = useState<any>(
    initialData?.branch || preSelectedBranch || null,
  );
  const [selectedService, setSelectedService] = useState<TService | null>(
    initialData?.service || null,
  );
  const [selectedSpecialist, setSelectedSpecialist] = useState<TSpecialist | null>(
    initialData?.specialist || null,
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(
    initialData?.date || null,
  );
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(
    initialData?.time || null,
  );

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [calendarDate, setCalendarDate] = useState(
    initialData?.date ? new Date(initialData.date) : new Date(),
  );

  const [customerInfo, setCustomerInfo] = useState<TCustomerInfo>(
    initialData?.customerInfo || {
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      notes: "",
    },
  );
  const [infoErrors, setInfoErrors] = useState<Partial<TCustomerInfo>>({});

  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const [customHour, setCustomHour] = useState(() => {
    const hour = initialData?.time?.startTime?.split(":")[0] || "";
    return hour ? hour.padStart(2, "0") : "";
  });
  const [customMinute, setCustomMinute] = useState(() => {
    const minute = initialData?.time?.startTime?.split(":")[1] || "";
    return minute ? minute.padStart(2, "0") : "";
  });
  const [customTimeError, setCustomTimeError] = useState("");
  const [validatingTime, setValidatingTime] = useState(false);

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (customHour && hourRef.current)
      hourRef.current.scrollTop = parseInt(customHour) * 32;
  }, [customHour]);
  useEffect(() => {
    if (customMinute && minuteRef.current)
      minuteRef.current.scrollTop = parseInt(customMinute) * 32;
  }, [customMinute]);

  useEffect(() => {
    if (isEditMode && initialData?.time?.startTime) {
      const [h, m] = initialData.time.startTime.split(":");
      if (hourRef.current && h) {
        setTimeout(() => {
          if (hourRef.current) hourRef.current.scrollTop = parseInt(h) * 32;
        }, 100);
      }
      if (minuteRef.current && m) {
        setTimeout(() => {
          if (minuteRef.current) minuteRef.current.scrollTop = parseInt(m) * 32;
        }, 100);
      }
    }
  }, [isEditMode]);

  useEffect(() => {
    if (step === 3 && customHour && customMinute) {
      setTimeout(() => {
        if (hourRef.current)
          hourRef.current.scrollTop = parseInt(customHour) * 32;
        if (minuteRef.current)
          minuteRef.current.scrollTop = parseInt(customMinute) * 32;
      }, 100);
    }
  }, [step]);

  useEffect(() => {
    if (selectedDate && selectedService && selectedSpecialist) fetchSlots();
  }, [selectedDate, selectedService, selectedSpecialist]);

  useEffect(() => {
    if (
      !isEditMode &&
      !preSelectedBranch &&
      business.branches &&
      business.branches.length === 1
    ) {
      setSelectedBranch(business.branches[0]);
      setStep(2);
    }
  }, [business.branches, isEditMode, preSelectedBranch]);

  useEffect(() => {
    if (!isEditMode) {
      setSelectedSpecialist(null);
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setAvailableSlots([]);
    }
  }, [selectedBranch, isEditMode]);

  // ── Data fetching ───────────────────────────────────────────────────────────

  const fetchSlots = async () => {
    if (!selectedSpecialist || !selectedService || !selectedDate) return;
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const data = await bookingService.getAvailability({
        specialistId: selectedSpecialist._id,
        serviceId: selectedService._id,
        date: selectedDate,
      });
      setAvailableSlots((data.slots ?? []) as TimeSlot[]);
      if (!data.slots?.length)
        setSlotsError("No time slots available for this date. Please try another date.");
    } catch (err) {
      setSlotsError(getErrorMessage(err, "Failed to load available slots"));
    } finally {
      setLoadingSlots(false);
    }
  };

  // ── Handlers ────────────────────────────────────────────────────────────────

  const filteredSpecialists: TSpecialist[] = (business.specialists ?? []).filter(
    (specialist) => {
      if (selectedBranch && specialist.branch !== selectedBranch._id) return false;
      if (!selectedService) return true;
      if (!specialist.services?.length) return false;
      return specialist.services.some((svc) => {
        const id = typeof svc === "string" ? svc : svc._id;
        return id === selectedService._id;
      });
    },
  );

  const selectBranch = (branch: any) => {
    setSelectedBranch(branch);
    if (!isEditMode) {
      setSelectedSpecialist(null);
      setSelectedService(null);
    }
    setStep(2);
  };

  const selectService = (service: TService) => {
    setSelectedService(service);
    if (!isEditMode) setSelectedSpecialist(null);
  };

  const selectSpecialist = (specialist: TSpecialist) => {
    setSelectedSpecialist(specialist);
    setStep(3);
  };

  const selectDate = (dateString: string) => {
    setSelectedDate(dateString);
    setSelectedTime(null);
    setAvailableSlots([]);
    setSlotsError(null);
    setCustomHour("");
    setCustomMinute("");
    setCustomTimeError("");
  };

  const selectSlot = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    if (selectedTime?.startTime === slot.startTime && !selectedTime?.isCustomTime) {
      setSelectedTime(null);
    } else {
      setSelectedTime({ ...slot, isCustomTime: false });
      const [h, m] = slot.startTime.split(":");
      setCustomHour(h);
      setCustomMinute(m);
    }
    setCustomTimeError("");
  };

  const handleCustomerFieldChange = (key: keyof TCustomerInfo, raw: string) => {
    const value = key === "phone" ? formatPhone(raw) : raw;
    setCustomerInfo((prev) => ({ ...prev, [key]: value }));
    setInfoErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handlePhoneChange = (value: string | null) => {
    setCustomerInfo((prev) => ({ ...prev, phone: value || "" }));
    setInfoErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const sendVerificationCode = async () => {
    const errors = validateInfoForm(customerInfo, isValidEmail, isValidPhone);
    if (Object.keys(errors).length) {
      setInfoErrors(errors);
      return;
    }
    setIsSendingCode(true);
    try {
      await new Promise<void>((r) => setTimeout(r, 1500));
      setSentCode(DEMO_CODE);
      setStep(5);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyAndConfirm = async () => {
    if (verificationCode.length !== 4) {
      setVerifyError("Please enter the 4-digit code.");
      return;
    }
    if (verificationCode !== sentCode) {
      setVerifyError("Invalid code. Please try again.");
      setVerificationCode("");
      return;
    }
    setIsVerifyingCode(true);
    try {
      await confirmBooking();
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleSaveEdit = async () => {
    const errors = validateInfoForm(customerInfo, isValidEmail, isValidPhone);
    if (Object.keys(errors).length) {
      setInfoErrors(errors);
      return;
    }
    setIsVerifyingCode(true);
    try {
      await updateBooking();
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const confirmBooking = async () => {
    if (!selectedService || !selectedSpecialist || !selectedDate || !selectedTime) return;
    const booking = await bookingService.createBooking({
      businessId: business.id,
      branchId: selectedBranch?._id,
      serviceId: selectedService._id,
      specialistId: selectedSpecialist._id,
      bookingDate: selectedDate,
      startTime: selectedTime.startTime,
      customerInfo: {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
      },
      notes: customerInfo.notes,
      isGuestBooking: !user,
    });
    onConfirmed?.(booking);
  };

  const updateBooking = async () => {
    if (!selectedService || !selectedSpecialist || !selectedDate || !selectedTime || !editBooking) return;
    const updatedBooking = await bookingService.updateBooking(editBooking._id, {
      branchId: selectedBranch?._id,
      serviceId: selectedService._id,
      specialistId: selectedSpecialist._id,
      bookingDate: selectedDate,
      startTime: selectedTime.startTime,
      customerInfo: {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
      },
      notes: customerInfo.notes,
    });
    onConfirmed?.(updatedBooking);
  };

  const validateCustomTime = async () => {
    if (!customHour || !customMinute || !selectedSpecialist || !selectedService || !selectedDate) return;
    const timeStr = `${customHour}:${customMinute}`;
    setValidatingTime(true);
    setCustomTimeError("");
    try {
      const res = await bookingService.validateCustomTime({
        specialistId: selectedSpecialist._id,
        serviceId: selectedService._id,
        bookingDate: selectedDate,
        customStartTime: timeStr,
      });
      if (res.isValid) {
        setSelectedTime({
          startTime: res.startTime as string,
          endTime: res.endTime as string,
          isAvailable: true,
          isCustomTime: true,
          duration: res.duration as number,
        });
      }
    } catch (err) {
      setCustomTimeError(getErrorMessage(err, "This time is not available"));
      setSelectedTime(null);
    } finally {
      setValidatingTime(false);
    }
  };

  const stepGate = (num: number) =>
    canGoToStep(
      num,
      { selectedBranch, selectedService, selectedSpecialist, selectedDate, selectedTime, sentCode },
      mode,
    );

  const monthYearLabel = `${months[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`;
  const changeMonth = (dir: number) =>
    setCalendarDate((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + dir);
      return d;
    });

  const calendarDays = generateCalendar(calendarDate);
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const currentBranchWorkingHours = selectedBranch?.workingHours;
  const branchServices = (business.services ?? []).filter(
    (service: any) => service.branch === selectedBranch?._id,
  );
  const displaySteps = isEditMode ? STEPS.filter((s) => s.num !== 5) : STEPS;

  // ── Branch map point ────────────────────────────────────────────────────────
  const branchHasCoords =
    selectedBranch?.address.coordinates?.latitude && selectedBranch?.address.coordinates?.longitude;

  const branchMapPoint = branchHasCoords
    ? {
        id: selectedBranch._id,
        lat: selectedBranch.address.coordinates.latitude,
        lng: selectedBranch.address.coordinates.longitude,
        label: selectedBranch.address?.street,
        isBase: selectedBranch.isBaseBranch,
      }
    : null;
      console.log(selectedBranch)
  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm font-sans">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 rounded-t-2xl bg-primary">
          <div className="flex items-start justify-between p-5 sm:p-6 gap-3">

            {/* Left: title + address info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-wide uppercase">
                {isEditMode
                  ? `EDIT BOOKING - ${business.businessName}`
                  : business.businessName}
              </h2>
              <div className="space-y-1.5 text-xs sm:text-sm text-white/85">
                {[
                  {
                    Icon: MapPin,
                    text: selectedBranch
                      ? `${selectedBranch.address?.street}, ${selectedBranch.address?.city}`
                      : "Select a branch",
                  },
                  {
                    Icon: Phone,
                    text: selectedBranch?.phones?.[0] || business.phone,
                  },
                ].map(({ Icon, text }, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <Icon className="h-3.5 w-3.5 flex-shrink-0 text-white/70" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: mini map + map buttons (only when branch with coords is selected) */}
            {branchMapPoint && (
              <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                <div className="w-36 h-24 sm:w-48 sm:h-28 hidden sm:block rounded-xl overflow-hidden shadow-lg border-2 border-white/20">
                  <MapWithCoords
                    points={[branchMapPoint]}
                    selectedPointId={branchMapPoint.id}
                  />
                </div>
                <div className="flex gap-1.5">
                  <GoogleMapButton
                    latitude={branchMapPoint.lat}
                    longitude={branchMapPoint.lng}
                  />
                  <YandexMapButton
                    latitude={branchMapPoint.lat}
                    longitude={branchMapPoint.lng}
                  />
                </div>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-full hover:opacity-70 transition-opacity text-white/80"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Step tabs */}
          <div className="flex border-t border-white/15">
            {displaySteps.map(({ num, label, short }) => {
              const done = num < step;
              const active = num === step;
              return (
                <button
                  key={num}
                  onClick={() => stepGate(num) && setStep(num)}
                  disabled={!stepGate(num)}
                  className={[
                    "flex-1 py-3 px-1 text-xs font-medium border-b-[3px] border-transparent transition-all whitespace-nowrap",
                    active
                      ? "bg-[#3D2B2B] text-white border-primary/60"
                      : done
                        ? "bg-[#c8adad] text-white cursor-pointer hover:bg-[#b89d9d]"
                        : "bg-white/12 text-white/75 cursor-not-allowed",
                  ].join(" ")}
                >
                  <span className="hidden sm:inline">{num}. {label}</span>
                  <span className="sm:hidden">{num}. {short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="p-5 sm:p-6">

          {/* ── Step 1: Branch Selection ─────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-primary">
                Select Branch
              </h3>

              {!business.branches || business.branches.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No branches available</p>
                  <button
                    onClick={onClose}
                    className="bg-[#3D2B2B] text-white rounded-xl py-3 px-6 text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {business.branches.map((branch: any) => {
                    const isSelected = selectedBranch?._id === branch._id;
                    return (
                      <div
                        key={branch._id}
                        onClick={() => selectBranch(branch)}
                        className={[
                          "border-2 rounded-xl p-4 cursor-pointer transition-all",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm text-[#3D2B2B]">
                                {branch.address?.street}{" "}
                                {branch.address?.state && `, ${branch.address.state}`}
                              </p>
                              {branch.isBaseBranch && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                  Main Branch
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{branch.address?.city}</p>
                            {branch.phones && branch.phones.length > 0 && (
                              <div className="flex items-center gap-1.5 text-xs text-primary">
                                <Phone className="h-3 w-3" />
                                <span>{branch.phones[0]}</span>
                              </div>
                            )}
                          </div>
                          <div
                            className={[
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-gray-300 bg-white",
                            ].join(" ")}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedBranch && (
                <button
                  onClick={() => setStep(2)}
                  className="w-full mt-4 bg-[#3D2B2B] text-white rounded-xl py-3 px-6 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Continue to Service Selection
                </button>
              )}
            </div>
          )}

          {/* ── Step 2: Service & Specialist ───────────────────────────── */}
          {step === 2 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-primary">
                Select Service
              </h3>

              {!branchServices.length ? (
                <p className="text-center py-8 text-gray-500">
                  No services available at this branch.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {branchServices.map((service: any) => {
                    const selected = selectedService?._id === service._id;
                    return (
                      <div
                        key={service._id}
                        onClick={() => selectService(service)}
                        className={[
                          "rounded-xl p-4 cursor-pointer transition-all text-white border-2",
                          selected
                            ? "bg-[#3D2B2B] border-white"
                            : "bg-[#4A3535] border-transparent hover:border-primary/50",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon url={service?.image?.url} name={service.name} />
                            <h4 className="font-semibold text-base text-white">{service.name}</h4>
                          </div>
                          <div
                            className={[
                              "w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                              selected
                                ? "border-white bg-white"
                                : "border-white/50 bg-transparent",
                            ].join(" ")}
                          >
                            {selected && <div className="w-[7px] h-[7px] rounded-full bg-[#4A3535]" />}
                          </div>
                        </div>
                        {service.description && (
                          <p className="text-xs mb-3 text-white/65">{service.description}</p>
                        )}
                        <div className="flex justify-between items-center text-xs text-white/75">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" /> {service.duration} min
                          </span>
                          <span className="flex items-center font-bold text-base text-white">
                            <DollarSign className="h-3.5 w-3.5" />
                            {service.price.amount}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedService && (
                <>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 text-primary">
                    Select Specialist
                  </h3>
                  <div className="space-y-2 mb-6">
                    {filteredSpecialists.length === 0 ? (
                      <p className="text-center py-6 text-gray-500 text-sm">
                        No specialists available for this service at this branch
                      </p>
                    ) : (
                      filteredSpecialists.map((specialist) => {
                        const selected = selectedSpecialist?._id === specialist._id;
                        return (
                          <div
                            key={specialist._id}
                            onClick={() => selectSpecialist(specialist)}
                            className={[
                              "rounded-xl p-3.5 px-4 border-2 cursor-pointer transition-all flex items-center gap-3",
                              selected
                                ? "border-primary bg-primary/5"
                                : "border-[#e5dada] bg-white hover:border-primary hover:bg-primary/5",
                            ].join(" ")}
                          >
                            <Icon url={specialist?.photo?.url} name={specialist.name} />
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-[#3D2B2B]">{specialist.name}</p>
                            </div>
                            <div
                              className={[
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                selected
                                  ? "border-primary bg-primary"
                                  : "border-gray-300 bg-white",
                              ].join(" ")}
                            >
                              {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-3 mt-2">
                {!isEditMode && (
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white text-[#3D2B2B] border-2 border-gray-200 rounded-xl py-3 px-6 text-sm font-semibold hover:bg-primary/5 hover:border-primary/30 transition-colors"
                  >
                    Back to Branches
                  </button>
                )}
                <button
                  onClick={() => selectedService && selectedSpecialist && setStep(3)}
                  disabled={!(selectedService && selectedSpecialist)}
                  className="flex-1 bg-[#3D2B2B] text-white rounded-xl py-3 px-6 text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  Next: Date &amp; Time
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Date & Time ─────────────────────────────────────── */}
          {step === 3 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 text-primary">
                Select Date
              </h3>

              {/* Calendar */}
              <div className="rounded-xl p-4 mb-4 max-w-sm mx-auto bg-primary/5 border border-[#e5dada]">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors font-bold text-lg text-secondary"
                  >
                    ←
                  </button>
                  <span className="font-semibold text-sm text-[#3D2B2B]">{monthYearLabel}</span>
                  <button
                    onClick={() => changeMonth(1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors font-bold text-lg text-secondary"
                  >
                    →
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {weekdays.map((d) => (
                    <div key={d} className="font-semibold py-1 text-xs text-primary">{d}</div>
                  ))}
                  {calendarDays.map((dateObj, idx) => {
                    const isWorking =
                      currentBranchWorkingHours?.some(
                        (e) => e.dayOfWeek === (dateObj?.getDay() ?? -1) && e.isOpen,
                      ) ?? false;
                    const isPast = dateObj ? dateObj < today : false;
                    const isDisabled = !dateObj || isPast || !isWorking;
                    const isSelected = dateObj && selectedDate === dateObj.dateString;
                    return (
                      <div key={idx}>
                        {dateObj && (
                          <button
                            onClick={() => !isDisabled && selectDate(dateObj.dateString)}
                            disabled={isDisabled}
                            className={[
                              "w-full aspect-square rounded-md text-[13px] transition-colors flex items-center justify-center",
                              isSelected
                                ? "bg-[#3D2B2B] text-white font-bold"
                                : isDisabled
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "hover:bg-primary/20 cursor-pointer",
                            ].join(" ")}
                          >
                            {dateObj.getDate()}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <>
                  {loadingSlots ? (
                    <div className="text-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                      <p className="mt-2 text-sm text-gray-500">Loading available times...</p>
                    </div>
                  ) : slotsError && !availableSlots.length ? (
                    <div className="text-center py-4 rounded-xl border text-sm bg-amber-50 border-amber-200 text-amber-700">
                      {slotsError}
                    </div>
                  ) : (
                    <>
                      {/* Time slots */}
                      <div className="rounded-xl p-4 mb-4 bg-gray-50 border border-[#ede5e5]">
                        <h4 className="text-sm font-semibold mb-3 text-[#3D2B2B]">
                          Available Time Slots
                        </h4>
                        <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded inline-block bg-green-50 border border-green-300" />{" "}
                            Available
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded inline-block bg-red-50 border border-red-200" />{" "}
                            Booked
                          </span>
                        </div>
                        <div className="max-h-56 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded">
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {availableSlots.map((slot, idx) => {
                              const isSelected =
                                selectedTime?.startTime === slot.startTime &&
                                !selectedTime?.isCustomTime;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => selectSlot(slot)}
                                  disabled={!slot.isAvailable}
                                  className={[
                                    "rounded-lg py-2 px-1 text-[13px] font-semibold border-2 transition-all",
                                    !slot.isAvailable
                                      ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed"
                                      : isSelected
                                        ? "bg-green-700 border-green-800 text-white"
                                        : "bg-green-50 border-green-300 text-green-800 hover:bg-green-100",
                                  ].join(" ")}
                                >
                                  {slot.startTime}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Custom time picker */}
                      {selectedService?.allowSpecificTimes && (
                        <div className="rounded-xl p-5 mb-4 bg-primary/5 border border-[#e5dada]">
                          <p className="text-center text-sm mb-4 text-secondary">
                            — or enter a custom time —
                          </p>
                          <div className="flex items-center justify-center gap-4 mb-4">
                            <ScrollPicker
                              key={`hour-${isEditMode ? editBooking?._id : "new"}`}
                              length={24}
                              value={customHour}
                              onChange={setCustomHour}
                            />
                            <span className="text-3xl font-bold text-primary/50">:</span>
                            <ScrollPicker
                              key={`minute-${isEditMode ? editBooking?._id : "new"}`}
                              length={60}
                              value={customMinute}
                              onChange={setCustomMinute}
                            />
                            <div className="ml-2 px-4 py-2 bg-white rounded-xl shadow border-2 border-primary/30 font-mono text-xl font-bold min-w-[80px] text-center text-[#3D2B2B]">
                              {customHour && customMinute ? (
                                `${customHour}:${customMinute}`
                              ) : (
                                <span className="text-gray-300">--:--</span>
                              )}
                            </div>
                          </div>
                          {customHour && customMinute && (
                            <div className="text-center">
                              <button
                                onClick={validateCustomTime}
                                disabled={validatingTime}
                                className="bg-[#3D2B2B] text-white rounded-xl py-3 px-8 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                              >
                                {validatingTime ? "Validating..." : "Set This Time"}
                              </button>
                            </div>
                          )}
                          {selectedTime?.isCustomTime && !customTimeError && (
                            <p className="mt-3 p-3 rounded-lg text-sm bg-green-50 border border-green-300 text-green-800">
                              ✓ Custom time set: <strong>{selectedTime.startTime}</strong>
                            </p>
                          )}
                          {customTimeError && (
                            <p className="mt-3 p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-600">
                              ⚠️ {customTimeError}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Working hours banner */}
                      {currentBranchWorkingHours && (
                        <div className="rounded-lg p-3 mb-4 flex items-center gap-2 text-sm bg-primary/5 border border-primary/30 text-[#3D2B2B]">
                          <Clock className="h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="font-semibold">Working Hours:</span>
                          <span className="text-secondary">
                            {(() => {
                              const day = new Date(selectedDate).getDay();
                              const schedule = currentBranchWorkingHours.find(
                                (wh) => wh.dayOfWeek === day,
                              );
                              if (!schedule?.isOpen) return "Closed";
                              if (schedule.hasBreak && schedule.breakStart && schedule.breakEnd) {
                                return `${schedule.openTime} - ${schedule.breakStart}, ${schedule.breakEnd} - ${schedule.closeTime}`;
                              }
                              return `${schedule.openTime} - ${schedule.closeTime}`;
                            })()}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 bg-white text-[#3D2B2B] border-2 border-gray-200 rounded-xl py-3 px-6 text-sm font-semibold hover:bg-primary/5 hover:border-primary/30 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      disabled={!selectedTime}
                      className="flex-1 bg-[#3D2B2B] text-white rounded-xl py-3 px-6 text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                    >
                      Next: Your Info
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Step 4: Customer Info ───────────────────────────────────── */}
          {step === 4 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-primary">
                Your Information
              </h3>
              <div className="space-y-3 mb-5">
                {(
                  [
                    { key: "firstName", label: "First Name", type: "text", placeholder: "John" },
                    { key: "lastName", label: "Last Name", type: "text", placeholder: "Smith" },
                    { key: "email", label: "Email Address", type: "email", placeholder: "john@example.com" },
                  ] as const
                ).map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold mb-1.5 text-[#3D2B2B]">
                      {label} *
                    </label>
                    <input
                      type={type}
                      value={customerInfo[key]}
                      onChange={(e) => handleCustomerFieldChange(key, e.target.value)}
                      placeholder={placeholder}
                      className={[
                        "w-full border-2 rounded-lg py-2.5 px-3.5 text-sm outline-none transition-colors bg-white",
                        infoErrors[key]
                          ? "border-red-400 focus:border-red-500"
                          : "border-[#e5dada] focus:border-primary",
                      ].join(" ")}
                    />
                    {infoErrors[key] && (
                      <p className="text-red-500 text-xs mt-1">{infoErrors[key]}</p>
                    )}
                  </div>
                ))}

                <div>
                  <PhoneInput
                    label="Phone Number"
                    variant="primary"
                    required
                    onChange={handlePhoneChange}
                    error={infoErrors.phone}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#3D2B2B]">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={customerInfo.notes}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    rows={3}
                    placeholder="Any special requests..."
                    className="w-full border-2 border-[#e5dada] focus:border-primary rounded-lg py-2.5 px-3.5 text-sm outline-none transition-colors bg-white resize-none"
                  />
                </div>

                {!isEditMode && !sentCode && (
                  <div className="rounded-xl p-3.5 text-sm bg-primary/5 border border-primary/30 text-[#3D2B2B]">
                    <p className="font-semibold mb-1">📱 Phone Verification Required</p>
                    <p className="text-secondary">
                      We'll send a <strong>4-digit code</strong> to your phone to confirm your booking.
                    </p>
                  </div>
                )}
                {!isEditMode && sentCode && (
                  <div className="rounded-xl p-3.5 text-sm bg-green-50 border border-green-300 text-green-800">
                    <p className="font-semibold">
                      ✅ Code sent to <strong>{customerInfo.phone}</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-white text-[#3D2B2B] border-2 border-gray-200 rounded-xl py-3 px-6 text-sm font-semibold hover:bg-primary/5 hover:border-primary/30 transition-colors"
                >
                  Back
                </button>
                {isEditMode ? (
                  <button
                    onClick={handleSaveEdit}
                    disabled={isVerifyingCode}
                    className="flex-1 bg-[#3D2B2B] text-white rounded-xl py-3 px-6 text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  >
                    {isVerifyingCode ? "Updating..." : "Save Changes"}
                  </button>
                ) : (
                  <button
                    onClick={sendVerificationCode}
                    disabled={!!sentCode || isSendingCode}
                    className="flex-1 bg-[#3D2B2B] text-white rounded-xl py-3 px-6 text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  >
                    {isSendingCode ? "Sending..." : "Next: Verify"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Step 5: Phone Verification ──────────────────────────────── */}
          {step === 5 && !isEditMode && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-primary">
                Phone Verification
              </h3>
              <div className="space-y-4 mb-5">
                <div className="p-4 rounded-xl text-sm bg-primary/5 border border-primary/30 text-[#3D2B2B]">
                  <p className="font-semibold mb-1">📱 Code sent to:</p>
                  <p className="font-mono text-base font-bold">{customerInfo.phone}</p>
                  {sentCode && (
                    <p className="mt-2 text-xs p-2 rounded bg-red-50 text-red-600">
                      ⚠️ DEMO — Code: <strong>{sentCode}</strong> (remove in production)
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#3D2B2B]">
                    Enter 4-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 4));
                      setVerifyError("");
                    }}
                    placeholder="- - - -"
                    autoFocus
                    className={[
                      "w-full border-2 rounded-lg py-2.5 px-3.5 text-xl text-center tracking-widest font-mono outline-none transition-colors bg-white",
                      verifyError ? "border-red-400" : "border-[#e5dada] focus:border-primary",
                    ].join(" ")}
                  />
                  {verifyError && (
                    <p className="text-red-500 text-xs mt-1">{verifyError}</p>
                  )}
                </div>
                <div className="text-center">
                  <button
                    onClick={() => {
                      setSentCode("");
                      setVerificationCode("");
                      setVerifyError("");
                      setStep(4);
                    }}
                    className="text-sm text-primary underline bg-transparent border-none cursor-pointer hover:text-secondary transition-colors"
                  >
                    Resend code
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-white text-[#3D2B2B] border-2 border-gray-200 rounded-xl py-3 px-6 text-sm font-semibold hover:bg-primary/5 hover:border-primary/30 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyAndConfirm}
                  disabled={isVerifyingCode || verificationCode.length !== 4}
                  className="flex-1 bg-[#3D2B2B] text-white rounded-xl py-3 px-6 text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  {isVerifyingCode ? "Verifying..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};