import { Lock, Mail, User, CheckCircle } from "lucide-react";
import { Input, Button } from "@/components";

type CustomerStepProps = {
  phone: string;
  code: string;
  setCode: (v: string) => void;
  onBack: () => void;
};

export function CustomerStep({
  phone,
  code,
  setCode,
  onBack,
}: CustomerStepProps) {
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
        />
      </div>

      {/* Personal Info */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Personal Information</h4>

        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" required icon={User} placeholder="John" />
          <Input label="Last Name" required icon={User} placeholder="Doe" />
        </div>

        <Input
          label="Email (Optional)"
          icon={Mail}
          placeholder="john.doe@example.com"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Password"
            required
            icon={Lock}
            placeholder="Min. 6 characters"
            isPassword
          />
          <Input
            label="Confirm Password"
            required
            icon={Lock}
            placeholder="Repeat password"
            isPassword
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
            type="submit"
          >
            Create Customer Account
          </Button>
        </div>
      </div>
    </>
  );
}
