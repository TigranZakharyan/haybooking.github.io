import { useState, useMemo } from "react";
import { Button, Input } from "@/components";
import { Edit2 } from "lucide-react";
import { Card } from "../../components/Card";
import { SectionTitle } from "../../components/SectionTitle";
import type { TUpdateProfileForm, TUser } from "@/types";
import { authService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

export function ProfileTab() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth() as { user: TUser; refreshUser: () => void };

  const [formData, setFormData] = useState<TUpdateProfileForm>({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TUpdateProfileForm, string>>>({});

  const handleChange =
    (field: keyof TUpdateProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const hasChanges = useMemo(() => {
    return (
      formData.firstName !== (user.firstName || "") ||
      formData.lastName !== (user.lastName || "") ||
      formData.email !== (user.email || "") ||
      formData.phone !== (user.phone || "")
    );
  }, [formData, user]);

  const validate = () => {
    const newErrors: Partial<Record<keyof TUpdateProfileForm, string>> = {};
    if (!formData.firstName.trim()) newErrors.firstName = t("errors.required");
    if (!formData.lastName.trim()) newErrors.lastName = t("errors.required");
    if (!formData.email.trim()) newErrors.email = t("errors.required");
    if (!formData.phone.trim()) newErrors.phone = t("errors.phoneRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const isValid = validate();
    if (!isValid) return;
    await authService.updateProfile(formData);
    refreshUser();
  };

  const memberSince = "—";

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <SectionTitle
          title={t("settings.personalInformation")}
          subtitle={t("settings.updatePersonalDetails")}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            required
            label={t("settings.firstName")}
            variant="primary"
            value={formData.firstName}
            onChange={handleChange("firstName")}
            error={errors.firstName}
          />
          <Input
            required
            label={t("settings.lastName")}
            variant="primary"
            value={formData.lastName}
            onChange={handleChange("lastName")}
            error={errors.lastName}
          />
        </div>
      </Card>

      <Card>
        <SectionTitle
          title={t("settings.contactInformation")}
          subtitle={t("settings.updateContactDetails")}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            required
            label={t("settings.emailAddress")}
            variant="primary"
            value={formData.email}
            onChange={handleChange("email")}
            error={errors.email}
          />
          <Input
            required
            label={t("settings.phoneNumber")}
            variant="primary"
            value={formData.phone}
            onChange={handleChange("phone")}
            error={errors.phone}
          />
        </div>
      </Card>

      <Card>
        <SectionTitle title={t("settings.accountInformation")} subtitle="" />
        <div className="grid grid-cols-2 gap-6 md:gap-8">
          <div className="bg-primary/5 p-4 rounded-xl flex flex-col">
            <p className="text-sm font-medium mb-1 tracking-wide">{t("settings.role")}</p>
            <p className="text-md font-semibold text-black capitalize">{user.role}</p>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl flex flex-col">
            <p className="text-sm font-medium mb-1 tracking-wide">{t("settings.accountStatus")}</p>
            <p className={`flex items-center gap-2 text-md font-semibold ${user.isActive ? "text-green-600" : "text-red-600"}`}>
              <span className={`w-2 h-2 rounded-full inline-block ${user.isActive ? "bg-green-600" : "bg-red-600"}`} />
              {user.isActive ? t("settings.active") : t("settings.inactive")}
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl flex flex-col">
            <p className="text-sm font-medium mb-1 tracking-wide">{t("settings.memberSince")}</p>
            <p className="text-md font-semibold text-black">{memberSince}</p>
          </div>

          <div className="flex items-end justify-end">
            <Button
              variant={hasChanges ? "default" : "outline"}
              onClick={handleSave}
              className="flex items-center justify-center gap-2"
              disabled={!hasChanges}
            >
              <Edit2 className="w-4 h-4" />
              {t("settings.saveChanges")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}