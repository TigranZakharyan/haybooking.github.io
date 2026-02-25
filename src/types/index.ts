export type TOption = {
  label: string;
  value: string;
};

export type TBookingStatus =
  | "pending"
  | "cancelled"
  | "completed";

export type TRole = "business" | "customer";

export interface TPrice {
  amount: number;
  currency: string;
}

export type TLogo = {
  url: string;
  key: string;
};

export type TRating = {
  average: number;
  count: number;
};

export type TCoordinates = {
  latitude: number;
  longitude: number;
};

export type TBusinessType = {
  label: string;
  value: string;
};

export type TAddress = {
  coordinates: TCoordinates;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
};

type TBaseWorkingHour = {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  _id: string;
};

export type TWorkingHour = 
  | (TBaseWorkingHour & { hasBreak: true; breakStart: string; breakEnd: string; })
  | (TBaseWorkingHour & { hasBreak: false; breakStart?: never; breakEnd?: never; });

export type TLoginCredentials =
  | { email: string; phone?: string; password: string }
  | { phone: string; email?: string; password: string };

export type TLoginResponse = { token: string };

export type TRegisterCustomerCredentials = {
  phone: string;
  verificationCode: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: TRole;
};

export type TRegisterBusinessCredentials = {
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

export type TBusinessProfile = {
  id: string;
  businessName: string;
  businessType: string;
  bookingLink: string;
  phone: string;
  logo: TLogo;
};

export type TUser = {
  id: string;
  email: string;
  role: TRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
  phone: string;
  business?: TBusinessProfile;
};

export type TUpdateProfileForm = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type TUpdatePasswordForm = {
  currentPassword: string;
  newPassword: string;
};

export type TBusinessSettings = {
  allowOnlineBooking: boolean;
  requireApproval: boolean;
  bookingBufferMinutes: boolean;
};

export interface TService {
  _id: string;
  business: string;
  branch: TBranch;
  name: string;
  description: string;
  duration: number;
  isActive: boolean;
  availableForOnlineBooking: boolean;
  timeInterval: number;
  allowSpecificTimes: boolean;
  price: TPrice;
  image: TLogo;
  createdAt: string;
  updatedAt: string;
}

export type TBranch = {
  _id: string;
  business: string;
  address: TAddress;
  phones: string[];
  workingHours: TWorkingHour[];
  isBaseBranch: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TBusiness = {
  id: string;
  logo: TLogo;
  settings: TBusinessSettings;
  rating: TRating;
  owner: string;
  businessName: string;
  businessType: string;
  description: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updated: string;
  bookingLink: string;
  services: (Omit<TService, "branch"> & { branch: string })[];
  specialists: TSpecialist[];
  branches: TBranch[];
};

export type TUpdateBusiness = {
  businessName: string;
  businessType: string;
  description: string;
  phone: string;
  settings?: TBusinessSettings;
};

export type TCreateService = {
  name: string;
  duration: number;
  branch: string;
  price: TPrice;
  description: string;
  timeInterval: number;
  allowSpecificTimes: boolean;
  isActive: boolean;
};

export type TUpdateService = {
  name?: string;
  duration?: number;
  branch?: string;
  price?: TPrice;
  description?: string;
  timeInterval?: number;
  allowSpecificTimes?: boolean;
  isActive?: boolean;
};

export type TSpecialist = {
  photo: TLogo;
  branch: TBranch;
  business: string;
  rating: TRating;
  _id: string;
  name: string;
  specialties: string[];
  services: TService[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TCreateSpecialist = {
  name: string;
  branch: string;
  services: string[];
  isActive: boolean;
};

export type TUpdateSpecialist = {
  name?: string;
  branch?: string;
  services?: string[];
  isActive?: boolean;
};

export type TCustomerInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
};

export type TCreateBooking = {
  businessId: string;
  branchId: string;
  serviceIds: string[];
  serviceId: string;
  specialistId: string[];
  bookingDate: string;
  startTime: string;
  customerInfo: TCustomerInfo;
  verificationCode: string;
  notes?: string;
};

export type TUpdateBooking = Omit<TCreateBooking, 'verificationCode'>

export type TSearchBusinessParams = {
  q?: string;
  city?: string;
  page?: number;
  limit?: number;
  type?: string;
};

export type TSearchBusinessBookingsParams = {
  status?: TBookingStatus;
   date?: string;
   branchId?: string;
   specialistId?: string;
   page?: number;
   limit?: number;
}

export type TSearchMyBookingsParams = {
  status?: TBookingStatus;
  page?: number;
  limit?: number;
}

export type TGetAvailablityParams = {
  specialistId?: string;
  serviceId?: string;
  serviceIds?: string;
  date?: string;
};

export type TValidateCustomTime = {
  specialistId: string;
  serviceId: string; 
  bookingDate: string;
  customStartTime: string;
}

export type TPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export interface TBooking {
  _id: string;
  business: Omit<TBusiness, "services" | "branches" | "specialists">;
  branch: TBranch;
  customer: string;
  services: TService[];
  specialist: Omit<TSpecialist, "branch" | "services"> & {
    branch: string;
    services: string[];
    serviceAvailability: any[];
    unavailability: any[];
    workingHours: any[];
    timeOff: any[];
  };
  totalDuration: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: TBookingStatus;
  customerInfo: TCustomerInfo;
  notes: string;
  price: TPrice;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export type TCreateBranch = {
  address: Omit<TAddress, 'coordinates'>;
  phones: string[];
  workingHours: Omit<TWorkingHour, '_id'>[];
  isBaseBranch: boolean;
};

export type TUpdateBranch = TCreateBranch

export type TMapPoint = {
  id: string;
  lat: number;
  lng: number;
  isBase?: boolean;
  label?: string;
}