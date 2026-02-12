export type TOption = { label: string; value: string }

export interface TTabOption<T extends string> {
  id: T;
  label: string;
}

export type TCredentials =
  | { email: string; phone?: string; password: string }  // email is required
  | { phone: string; email?: string; password: string }; // phone is required

export type TRole = "customer" | "business"

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
    }
  },
  phones: Array<string>,
  workingHours: []
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
}

export type TRegisterCustomerCreds = {
  phone: string;
  verificationCode: string;
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: TRole,
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

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
  business?: BusinessProfile; // optional, only for business users
}
