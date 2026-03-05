import { useState, useMemo, useEffect, type ChangeEvent } from "react";
import { Button, Input, Select } from "@/components";
import { PhoneInput } from "@/components/PhoneInput";
import { Card } from "../../components/Card";
import { SectionTitle } from "../../components/SectionTitle";
import { Edit2, Plus } from "lucide-react";
import { businessService, searchService, uploadService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import type { TBusiness, TBusinessType, TUpdateBusiness } from "@/types";

export function BusinessTab() {
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
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handlePhoneChange = (value: string | null) => {
    setFormData((prev) => ({ ...prev, phone: value || "" }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
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
    if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.businessType.trim()) newErrors.businessType = "Business type is required";
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
        {/* Header row: title + logo upload */}
        <div className="flex justify-between">
          <SectionTitle
            title="Basic Information"
            subtitle="Update your business details and contact information"
          />

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
        </div>

        <div className="flex flex-col gap-4">
          {/* Name + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              required
              label="Business Name"
              variant="primary"
              value={formData.businessName}
              onChange={handleChange("businessName")}
              error={errors.businessName}
            />
            <PhoneInput
              required
              label="Phone"
              variant="primary"
              hint="Main contact number for your business"
              value={formData.phone}
              onChange={handlePhoneChange}
              error={errors.phone}
            />
          </div>

          {/* Business Type */}
          <Select
            required
            label="Business Type"
            variant="primary"
            options={types}
            value={formData.businessType as unknown as string}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, businessType: value }))
            }
            error={errors.businessType}
          />

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={handleChange("description")}
              rows={4}
              placeholder="Tell customers about your business..."
              className="w-full rounded-xl border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none px-3 py-2 text-sm"
            />
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <Button
              variant={hasChanges ? "default" : "outline"}
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}