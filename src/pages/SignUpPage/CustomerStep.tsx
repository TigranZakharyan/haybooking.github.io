import { useState } from "react";
import { Lock, Mail, User, CheckCircle } from "lucide-react";
import { Input, Button } from "@/components";
import { authService } from "@/services/api";
import { isValidEmail } from "@/services/validation";
import { useNavigate } from "react-router-dom";
import type { TRegisterCustomerCredentials } from "@/types";
import { formatPhone } from "@/services/format";
import { useTranslation } from "react-i18next";

type CustomerStepProps = {
  phone: string;
  code: string;
  setCode: (v: string) => void;
  onBack: () => void;
};

export function CustomerStep({ phone, code, setCode, onBack }: CustomerStepProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const handleRegister = async () => {
    const newErrors: typeof errors = {};

    if (code.length !== 6) newErrors.code = t("errors.codeLength");
    if (!firstName.trim()) newErrors.firstName = t("errors.required");
    if (!lastName.trim()) newErrors.lastName = t("errors.required");
    if (email.trim() && !isValidEmail(email)) newErrors.email = t("errors.emailInvalid");
    if (password.length < 8) newErrors.password = t("errors.passwordLength");
    if (password !== confirmPassword) newErrors.confirmPassword = t("errors.passwordMatch");

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const registerData: TRegisterCustomerCredentials = {
        phone: formatPhone(phone),
        verificationCode: code,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role: "customer",
      };
      await authService.registerCustomer(registerData);
      navigate("/signin");
    } catch (err: any) {
      console.error(err.response?.data || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <CheckCircle className="h-5 w-5 text-green-500" />
          {t("signUp.verifyPhone")}
        </div>

        <Input
          label={t("signUp.verificationCode")}
          icon={Lock}
          placeholder={t("signUp.codePlaceholder")}
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          hint={t("signUp.codeSentTo", { phone })}
          error={errors.code}
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">{t("signUp.personalInfo")}</h4>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t("settings.firstName")}
            required
            icon={User}
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={errors.firstName}
          />
          <Input
            label={t("settings.lastName")}
            required
            icon={User}
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={errors.lastName}
          />
        </div>

        <Input
          label={t("signUp.emailOptional")}
          icon={Mail}
          placeholder="john.doe@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t("settings.newPassword")}
            required
            icon={Lock}
            placeholder={t("signUp.passwordPlaceholder")}
            isPassword
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <Input
            label={t("settings.confirmNewPassword")}
            required
            icon={Lock}
            placeholder={t("signUp.repeatPassword")}
            isPassword
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="large" className="w-full" onClick={onBack}>
            {t("signUp.back")}
          </Button>
          <Button
            variant="liberty"
            size="large"
            className="w-full"
            onClick={handleRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? t("signUp.creating") : t("signUp.createCustomerAccount")}
          </Button>
        </div>
      </div>
    </>
  );
}