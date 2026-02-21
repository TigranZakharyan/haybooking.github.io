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
  phone: string;
  address: Address;
  owner?: BusinessOwner;
  services?: TService[];
  specialists?: Specialist[];
  workingHours?: WorkingHour[];
  settings?: BusinessSettings;
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

export type TService = {
  _id: string;
  name: string;
  duration: number;
  price: Price;
  description?: string;
  timeInterval?: number;
  allowSpecificTimes?: boolean;
  isActive: boolean;
  branch: Branch;
  image?: Image | null;
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