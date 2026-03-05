import { Link } from "react-router-dom";
import { User, Briefcase } from "lucide-react";
import { useState } from "react";
import { DividerWithText, Button } from "@/components";
import { PhoneInput } from "@/components/PhoneInput";
import { CustomerStep } from "./CustomerStep";
import { BusinessStep } from "./BusinessStep";
import type { TRole } from "@/types";

type Step = "phone" | "verify";

export function SignUpPage() {
  const [step, setStep] = useState<Step>("phone");
  const [accountType, setAccountType] = useState<TRole>("customer");
  const [phone, setPhone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [showPhoneError, setShowPhoneError] = useState(false);

  // Handle phone change from PhoneInput
  const handlePhoneChange = (value: string | null) => {
    setPhone(value);
    if (showPhoneError && value) {
      setShowPhoneError(false); // hide error if now valid
    }
  };

  const handleNext = () => {
    if (!phone) {
      setShowPhoneError(true); // show error if phone invalid
      return;
    }
    setStep("verify");
  };

  return (
    <div className="h-full grid md:grid-cols-2 overflow-hidden">
      {/* LEFT SIDE */}
      <div className="w-full flex flex-col justify-center items-center p-8 md:p-16">
        <div className="w-full max-w-lg space-y-4">
          <div className="text-center">
            <h2 className="text-liberty">Sign Up</h2>
          </div>

          {step === "phone" && (
            <>
              {/* Account Type */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  Account Type
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAccountType("customer")}
                    className={`rounded-xl border p-5 text-left transition-all
                      ${
                        accountType === "customer"
                          ? "border-liberty bg-liberty/5 shadow-[0_0_0_2px_rgba(99,102,241,0.15)]"
                          : "border-gray-200 hover:border-liberty/40"
                      }`}
                  >
                    <User
                      className={`mb-3 h-6 w-6 ${
                        accountType === "customer"
                          ? "text-liberty"
                          : "text-gray-400"
                      }`}
                    />
                    <p className="font-semibold text-gray-900">Customer</p>
                    <p className="text-sm text-gray-500">
                      Book services & appointments
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType("business")}
                    className={`rounded-xl border p-5 text-left transition-all
                      ${
                        accountType === "business"
                          ? "border-liberty bg-liberty/5 shadow-[0_0_0_2px_rgba(99,102,241,0.15)]"
                          : "border-gray-200 hover:border-liberty/40"
                      }`}
                  >
                    <Briefcase
                      className={`mb-3 h-6 w-6 ${
                        accountType === "business"
                          ? "text-liberty"
                          : "text-gray-400"
                      }`}
                    />
                    <p className="font-semibold text-gray-900">Business</p>
                    <p className="text-sm text-gray-500">
                      Manage services & bookings
                    </p>
                  </button>
                </div>
              </div>

              {/* Phone */}
              <PhoneInput
                label="Phone Number"
                required
                hint="Enter your phone number with country code"
                onChange={handlePhoneChange}
                error={
                  showPhoneError && !phone ? "Phone number is invalid" : ""
                }
              />

              {/* Info */}
              <div className="rounded-xl border border-liberty/30 bg-liberty/5 px-4 py-3">
                <p className="text-sm text-liberty">
                  We&apos;ll send you a verification code via SMS to confirm
                  your phone number.
                </p>
              </div>

              {/* Send Code */}
              <Button
                size="large"
                variant="liberty"
                className="w-full"
                onClick={handleNext}
              >
                Send verification code
              </Button>
            </>
          )}

          {step === "verify" && (
            <>
              {accountType === "customer" ? (
                <CustomerStep
                  phone={phone || ""}
                  code={code}
                  setCode={setCode}
                  onBack={() => setStep("phone")}
                />
              ) : (
                <BusinessStep
                  phone={phone || ""}
                  code={code}
                  setCode={setCode}
                  onBack={() => setStep("phone")}
                />
              )}
            </>
          )}

          <DividerWithText>
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-bold text-liberty hover:underline"
            >
              Sign in
            </Link>
          </DividerWithText>
        </div>
      </div>

      <div className="w-full h-full md:block hidden">
        <div className="fixed w-1/2 h-full top-0 bg-[url(/booking.png)] bg-cover bg-[position:10%_center]"></div>
      </div>
    </div>
  );
}
