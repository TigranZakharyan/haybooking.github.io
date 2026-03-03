import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Input, DividerWithText, Button } from "@/components";
import { PhoneInput } from "@/components/PhoneInput";
import { authService } from "@/services/api";
import type { TLoginCredentials } from "@/types";
import { useAuth } from "@/context/AuthContext";


interface FormErrors {
  email?: string;
  phone?: string;
  password?: string;
}

export function SignInPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [phone, setPhone] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!phone) newErrors.phone = "Phone number is required";

    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (value: string | null) => {
    setPhone(value);
    setErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    const credential: TLoginCredentials = { phone: phone!, password }

    try {
      setServerError("");
      setLoading(true);
      const { token } = await authService.login(credential);
      localStorage.setItem("token", token);
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

          <form onSubmit={handleSubmit} className="space-y-4">
              <PhoneInput
                label="Phone Number"
                required
                onChange={handlePhoneChange}
                error={errors.phone}
              />
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