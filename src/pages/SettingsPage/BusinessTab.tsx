import { useState, useMemo, useEffect, type ChangeEvent } from "react";
import { Button, Input, Select } from "@/components";
import { PhoneInput } from "@/components/PhoneInput";
import { Card } from "../../components/Card";
import { SectionTitle } from "../../components/SectionTitle";
import { Edit2, Plus } from "lucide-react";
import { businessService, searchService, uploadService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import type { TBusiness, TBusinessType, TUpdateBusiness } from "@/types";
import { useTranslation } from "react-i18next";

export function BusinessTab() {
  const { t } = useTranslation();
  const {
    user: { business },
  } = useAuth() as unknown as { user: { business: TBusiness } };

  const [types, setTypes] = useState<TBusinessType[]>([]);
  const [formData, setFormData] = useState<TBusiness>(() => business);
  const [previewLogo, setPreviewLogo] = useState<{ url: string } | undefined>(
    business.logo,
  );
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [logoLoading, setLogoLoading] = useState(false);

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handlePhoneChange = (value: string | null) => {
    setFormData((prev) => ({ ...prev, phone: value || "" }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const handleLogoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoLoading(true);
    try {
      const payload = new FormData();
      payload.append("logo", file);
      const newLogo = await uploadService.uploadBusinessLogo(payload);
      setPreviewLogo(newLogo);
    } finally {
      setLogoLoading(false);
    }
  };

  const hasChanges = useMemo(() => {
    return (
      formData.businessName !== (business.businessName || "") ||
      formData.phone !== (business.phone || "") ||
      formData.businessType !== (business.businessType || "") ||
      formData.description !== (business.description || "")
    );
  }, [formData, business]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.businessName.trim())
      newErrors.businessName = t("errors.required");
    if (!formData.phone.trim()) newErrors.phone = t("errors.phoneRequired");
    if (!formData.businessType.trim())
      newErrors.businessType = t("errors.required");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const isValid = validate();
    if (!isValid) return;
    const payload: TUpdateBusiness = {
      businessName: formData.businessName,
      phone: formData.phone,
      businessType: formData.businessType,
      description: formData.description || "",
    };
    await businessService.updateMyBusiness(payload);
  };

  useEffect(() => {
    const fetchTypes = async () => {
      const types = await searchService.getBusinessTypes();
      setTypes(types);
    };
    fetchTypes();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="flex justify-between">
          <SectionTitle
            title={t("settings.basicInformation")}
            subtitle={t("settings.updateBusinessDetails")}
          />
          <div className="flex flex-col justify-end items-end">
            <label className="relative cursor-pointer flex-shrink-0">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleLogoChange}
              />
              {previewLogo?.url ? (
                <img
                  src={previewLogo.url}
                  alt="logo"
                  className="w-12 h-12 rounded-full object-cover border"
                />
              ) : (
                <div className="w-12 h-12 rounded-full border border-dashed border-gray-300 bg-white flex items-center justify-center text-gray-400 hover:border-primary hover:bg-primary/5 transition">
                  <Plus className="w-4 h-4" />
                </div>
              )}
              {logoLoading && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                </div>
              )}
            </label>
            <span className="text-xs text-gray-400">
              The photo should be 500x500
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              required
              label={t("settings.businessName")}
              variant="primary"
              value={formData.businessName}
              onChange={handleChange("businessName")}
              error={errors.businessName}
            />
            <PhoneInput
              required
              label={t("settings.phone")}
              variant="primary"
              hint={t("settings.phoneHint")}
              value={formData.phone}
              onChange={handlePhoneChange}
              error={errors.phone}
            />
          </div>

          <Select
            required
            label={t("settings.businessType")}
            variant="primary"
            options={types}
            value={formData.businessType as unknown as string}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, businessType: value }))
            }
            error={errors.businessType}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              {t("settings.description")}{" "}
              <span className="text-gray-400">({t("services.optional")})</span>
            </label>
            <textarea
              value={formData.description}
              onChange={handleChange("description")}
              rows={4}
              placeholder={t("settings.descriptionHint")}
              className="w-full rounded-xl border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant={hasChanges ? "default" : "outline"}
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-2"
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
