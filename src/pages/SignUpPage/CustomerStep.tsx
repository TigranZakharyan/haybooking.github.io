import { useState } from "react";
import { Lock, Mail, User, CheckCircle } from "lucide-react";
import { Input, Button } from "@/components";
import { authService } from "@/services/api";
import { formatPhone, isValidEmail } from "@/services/validation";

type CustomerStepProps = {
  phone: string;
  code: string;
  setCode: (v: string) => void;
  onBack: () => void;
};

export function CustomerStep({ phone, code, setCode, onBack }: CustomerStepProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error state only shown after submit
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const handleRegister = async () => {
    const newErrors: typeof errors = {};

    if (code.length !== 6) newErrors.code = "Verification code must be 6 digits";
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (email.trim() && !isValidEmail(email)) newErrors.email = "Email is invalid";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    // Set errors to show them under inputs
    setErrors(newErrors);

    // Stop if any errors
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const registerData = {
        phone: formatPhone(phone),
        verificationCode: code,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role: "customer" as const,
      };

      await authService.registerCustomer(registerData);
      // TODO: redirect or success state
    } catch (err: any) {
      console.error(err.response?.data || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Verify */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Verify Your Phone
        </div>

        <Input
          label="Verification Code"
          icon={Lock}
          placeholder="Enter 6-digit code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          hint={`Code sent to ${phone}`}
          error={errors.code}
        />
      </div>

      {/* Personal Info */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Personal Information</h4>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            required
            icon={User}
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={errors.firstName}
          />
          <Input
            label="Last Name"
            required
            icon={User}
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={errors.lastName}
          />
        </div>

        <Input
          label="Email (Optional)"
          icon={Mail}
          placeholder="john.doe@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Password"
            required
            icon={Lock}
            placeholder="Min. 6 characters"
            isPassword
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            required
            icon={Lock}
            placeholder="Repeat password"
            isPassword
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="large"
            className="w-full"
            onClick={onBack}
          >
            Back
          </Button>

          <Button
            variant="liberty"
            size="large"
            className="w-full"
            onClick={handleRegister}
            disabled={isSubmitting} // disabled only while submitting
          >
            {isSubmitting ? "Creating..." : "Create Customer Account"}
          </Button>
        </div>
      </div>
    </>
  );
}
