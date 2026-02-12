import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Phone } from "lucide-react";
import { Input, DividerWithText, Tabs, Button } from "@/components";
import { authService } from "@/services/api";
import type { TCredentials } from "@/types";
import { formatPhone, isValidEmail, isValidPhone } from "@/services/validation";

type LoginMethod = "email" | "phone";

export function SignInPage() {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const tabOptions: { id: LoginMethod; label: string }[] = useMemo(
    () => [
      { id: "email", label: "Email" },
      { id: "phone", label: "Phone Number" },
    ],
    []
  );

  const handleSubmit = async () => {
    // Validation
    if (loginMethod === "email") {
      if (!isValidEmail(email)) {
        alert("Enter a valid email address");
        return;
      }
    } else {
      if (!isValidPhone(phone)) {
        alert("Enter a valid phone number");
        return;
      }
    }

    if (!password) {
      alert("Password cannot be empty");
      return;
    }

    // Prepare login data
    const credential: TCredentials =
      loginMethod === "email"
        ? { email, password }
        : { phone: formatPhone(phone), password };

    try {
      setLoading(true);
      await authService.login(credential);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full grid md:grid-cols-2 overflow-hidden">
      {/* LEFT SIDE: Form Section */}
      <div className="w-full flex flex-col justify-center items-center p-8 md:p-16">
        <div className="w-full max-w-lg space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-liberty">Sign In</h2>
            <p className="text-liberty mt-2">Welcome Back!</p>
          </div>

          {/* Shared Tabs Component */}
          <Tabs
            tabs={tabOptions}
            activeTab={loginMethod}
            onChange={(id) => setLoginMethod(id)}
          />

          {/* Form Fields */}
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {loginMethod === "email" ? (
              <Input
                key="email"
                label="Email"
                icon={Mail}
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            ) : (
              <Input
                key="phone"
                label="Phone Number"
                icon={Phone}
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
              />
            )}

            <Input
              label="Password"
              icon={Lock}
              placeholder="Your password"
              isPassword
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Primary Action */}
            <Button
              type="submit"
              size="large"
              variant="liberty"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <DividerWithText>
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-bold text-liberty hover:underline"
            >
              Sign up
            </Link>
          </DividerWithText>

          {/* Footer Legal */}
          <p className="text-center text-sm text-gray-400 leading-relaxed">
            By signing up to create an account I accept <br />
            Company's{" "}
            <span className="text-liberty underline cursor-pointer">
              Terms of Use
            </span>{" "}
            and{" "}
            <span className="text-liberty underline cursor-pointer">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Visual Section */}
      <div className="w-full h-full hidden md:block relative">
        <div className="fixed w-1/2 h-full top-0 bg-[url(/booking.jpg)] bg-no-repeat bg-cover bg-center"></div>
      </div>
    </div>
  );
}
