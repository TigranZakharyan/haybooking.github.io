export type TOption = { label: string; value: string };

export interface TTabOption<T extends string> {
  id: T;
  label: string;
}

export type TCredentials =
  | { email: string; phone?: string; password: string } // email is required
  | { phone: string; email?: string; password: string }; // phone is required

export type TRole = "customer" | "business";

export type TBranch = {
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates: {
      latitude: string;
      longitude: string;
    };
  };
  phones: Array<string>;
  workingHours: [];
};

export type TRegisterBusinessCreds = {
  phone: string;
  verificationCode: string;
  password: string;
  confirmPassword: string;
  role: TRole;
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
  businessType: string;
  description?: string;
  addresses?: Array<TBranch>;
};

export type TRegisterCustomerCreds = {
  phone: string;
  verificationCode: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: TRole;
};

export interface BusinessProfile {
  id: string;
  businessName: string;
  businessType: string;
  bookingLink?: string;
  phone?: string;
  address?: string;
}

export type TUser = {
  id: string;
  email: string;
  role: TRole;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  business?: BusinessProfile;
};

export interface Price {
  amount: number;
  currency?: string;
}

export interface Specialist {
  _id: string;
  name: string;
  branch: Branch;
  photo?: Image | null;
  isActive: boolean;
  services: TService[];
}

export interface Address {
  street: string;
  city: string;
}

export interface Shift {
  startTime: string;
  endTime: string;
}

export interface WorkingHour {
  dayOfWeek: number;
  isOpen: boolean;
  shifts?: Shift[];
}

export interface BusinessSettings {
  allowSpecificTimes?: boolean;
}

export interface BusinessOwner {
  email?: string;
}

export interface Business {
  _id: string;
  businessName: string;
  bookingLink: string;
  businessType: string;
  description?: string;
  phone: string;
  address: Address;
  owner?: BusinessOwner;
  services?: TService[];
  specialists?: Specialist[];
  workingHours?: WorkingHour[];
  settings?: BusinessSettings;
  logo?: {
    url: string
  }
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
}

export interface TimeSlot {
  startTime: string;
  endTime?: string;
  isAvailable: boolean;
  isCustomTime?: boolean;
  duration?: number;
}

export interface ConfirmedPayload {
  booking: unknown;
  selectedService: TService;
  selectedSpecialist: Specialist;
  customerInfo: CustomerInfo;
}

export interface ModalProps {
  business: Business;
  onClose: () => void;
  onConfirmed?: (payload: ConfirmedPayload) => void;
}

export interface CalendarDate extends Date {
  dateString: string;
}

export type TBusinessType = {
  value: string;
  label: string;
};

export type TUpdateProfile = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type TUpdatePassword = {
  currentPassword: string;
  newPassword: string;
}

export interface Branch {
  _id: string;
  address: {
    street: string;
    city: string;
    country: string;
    state: string,
    zipCode: string;
    phones: string[];
    workingHours: {
      _id: string;
      hasBreak: boolean;
      dayOfWeek: number;
      isOpen: boolean;
      closeTime: string;
      openTime: string;
      breakStart?: string;
      breakEnd?: string;
    }[];
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  isBaseBranch?: boolean;
}

export interface Image {
  cdnUrl?: string;
  url?: string;
}


export interface WorkingHoursUI {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  hasBreak: boolean;
  breakStart?: string;
  breakEnd?: string;
}

export interface NewBranch {
  address: Pick<
    Branch["address"],
    "street" | "city" | "country" | "state" | "zipCode"
  >;
  phones: Branch["address"]["phones"];
  workingHours: WorkingHoursUI[];
  isBaseBranch: Branch["isBaseBranch"];
}

export type TBookingStatus = "pending" | "completed" | "cancelled";



// ---------- Common Types ----------

export interface TPrice {
  amount: number;
  currency: string;
}

export interface TImage {
  url: string;
  key: string;
}

export interface TRating {
  average: number;
  count: number;
}

// ---------- Customer Info ----------

export interface TCustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// ---------- Business ----------

export interface TBusiness {
  _id: string;
  id: string;
  owner: string;
  businessName: string;
  businessType: string;
  description: string;
  phone: string;
  isActive: boolean;
  bookingLink: string;
  logo: TImage;
  rating: TRating;
  settings: {
    allowOnlineBooking: boolean;
    requireApproval: boolean;
    bookingBufferMinutes: number;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// ---------- Service ----------

export interface TService {
  _id: string;
  business: string;
  branch: string;
  name: string;
  description: string;
  duration: number;
  isActive: boolean;
  availableForOnlineBooking: boolean;
  timeInterval: number;
  allowSpecificTimes: boolean;
  unavailability: unknown[]; // adjust if you have structure
  price: TPrice;
  image: TImage;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// ---------- Specialist ----------

export interface TSpecialist {
  _id: string;
  business: string;
  branch: string;
  name: string;
  specialties: string[];
  services: string[];
  isActive: boolean;
  serviceAvailability: unknown[];
  unavailability: unknown[];
  workingHours: unknown[];
  timeOff: unknown[];
  rating: TRating;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// ---------- Main Booking ----------

export interface TBooking {
  _id: string;
  customerInfo: TCustomerInfo;
  price: TPrice;

  business: TBusiness;
  branch: TBranch;
  customer: string;

  services: TService[];
  specialist: TSpecialist;

  totalDuration: number;

  bookingDate: string;
  startTime: string;
  endTime: string;

  status: TBookingStatus;
  notes: string;
  reminderSent: boolean;

  createdAt: string;
  updatedAt: string;
  __v: number;
}