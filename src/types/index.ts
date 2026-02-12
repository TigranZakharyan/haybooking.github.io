export type TOption = { label: string; value: string }

export type TCredentials =
  | { email: string; phone?: string; password: string }  // email is required
  | { phone: string; email?: string; password: string }; // phone is required
