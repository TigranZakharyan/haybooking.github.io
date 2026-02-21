import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Phone } from "lucide-react";
import { Input, DividerWithText, Tabs, Button } from "@/components";
import { authService } from "@/services/api";
import type { TCredentials, TTabOption } from "@/types";
import { formatPhone, isValidEmail, isValidPhone } from "@/services/validation";
import { useAuth } from "@/context/AuthContext";

type LoginMethod = "email" | "phone";

interface FormErrors {
  email?: string;
  phone?: string;
  password?: string;
}

const tabOptions: TTabOption<LoginMethod>[] = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone Number" },
];

export function SignInPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (loginMethod === "email") {
      if (!email) newErrors.email = "Email is required";
      else if (!isValidEmail(email)) newErrors.email = "Enter a valid email";
    } else {
      if (!phone) newErrors.phone = "Phone number is required";
      else if (!isValidPhone(phone))
        newErrors.phone = "Enter a valid phone number";
    }

    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    const credential: TCredentials =
      loginMethod === "email"
        ? { email, password }
        : { phone: formatPhone(phone), password };

    try {
      setServerError("");
      setLoading(true);
      const response = await authService.login(credential);
      localStorage.setItem("token", response.token);
      auth.refreshUser();
      navigate("/dashboard");
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full grid md:grid-cols-2 overflow-hidden">
      <div className="w-full flex flex-col justify-center items-center p-8 md:p-16">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center">
            <h2 className="text-liberty">Sign In</h2>
            <p className="text-liberty mt-2">Welcome Back!</p>
          </div>

          <Tabs
            tabs={tabOptions}
            activeTab={loginMethod}
            onChange={(id: LoginMethod) => {
              setLoginMethod(id);
              setErrors({});
              setServerError("");
            }}
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginMethod === "email" ? (
              <Input
                label="Email"
                type="email"
                icon={Mail}
                placeholder="Your email"
                value={email}
                error={errors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
              />
            ) : (
              <Input
                label="Phone Number"
                icon={Phone}
                placeholder="+1 (555) 000-0000"
                value={phone}
                error={errors.phone}
                onChange={(e) => {
                  setPhone(formatPhone(e.target.value));
                  setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
              />
            )}

            <Input
              label="Password"
              icon={Lock}
              placeholder="Your password"
              isPassword
              value={password}
              error={errors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
            />

            {/* Backend Error */}
            {serverError && (
              <div className="text-sm text-red-500 text-center">
                {serverError}
              </div>
            )}

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

      <div className="w-full h-full hidden md:block relative">
        <div className="fixed w-1/2 h-full top-0 bg-[url(/booking.jpg)] bg-no-repeat bg-cover bg-center"></div>
      </div>
    </div>
  );
}
