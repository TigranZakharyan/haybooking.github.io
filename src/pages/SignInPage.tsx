import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Input, DividerWithText, Button } from "@/components";
import { PhoneInput } from "@/components/PhoneInput";
import { authService } from "@/services/api";
import type { TLoginCredentials } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

interface FormErrors {
  phone?: string;
  password?: string;
}

export function SignInPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();
  const [phone, setPhone] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!phone) newErrors.phone = t("errors.phoneRequired");
    if (!password) newErrors.password = t("errors.passwordRequired");
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

    const credential: TLoginCredentials = { phone: phone!, password };

    try {
      setLoading(true);
      const { token } = await authService.login(credential);
      localStorage.setItem("token", token);
      auth.refreshUser();
      navigate("/dashboard");
    } catch (err: any) {
      setServerError(err.response?.data?.message || t("errors.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full grid md:grid-cols-2 overflow-hidden">
      <div className="w-full flex flex-col justify-center items-center p-8 md:p-16">
        <div className="w-full max-w-lg space-y-8">
          <div className="text-center">
            <h2 className="text-liberty">{t("signIn.title")}</h2>
            <p className="text-liberty mt-2">{t("signIn.welcome")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <PhoneInput
              label={t("settings.phoneNumber")}
              required
              onChange={handlePhoneChange}
              error={errors.phone}
            />
            <Input
              label={t("settings.currentPassword")}
              icon={Lock}
              placeholder={t("signIn.passwordPlaceholder")}
              isPassword
              value={password}
              error={errors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
            />

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
              {loading ? t("signIn.signingIn") : t("signIn.submit")}
            </Button>
          </form>

          <DividerWithText>
            {t("signIn.noAccount")}{" "}
            <Link to="/signup" className="font-bold text-liberty hover:underline">
              {t("signIn.signUp")}
            </Link>
          </DividerWithText>

          <p className="text-center text-sm text-gray-400 leading-relaxed">
            {t("signIn.termsPrefix")} <br />
            {t("signIn.companys")}{" "}
            <span className="text-liberty underline cursor-pointer">
              {t("signIn.termsOfUse")}
            </span>{" "}
            {t("signIn.and")}{" "}
            <span className="text-liberty underline cursor-pointer">
              {t("signIn.privacyPolicy")}
            </span>
            .
          </p>
        </div>
      </div>

      <div className="w-full h-full md:block hidden">
        <div className="fixed w-1/2 h-full top-0 bg-[url(/booking.png)] bg-cover bg-[position:10%_center]" />
      </div>
    </div>
  );
}