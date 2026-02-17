import { useState, useMemo } from "react";
import { Button, Input } from "@/components";
import { Edit2 } from "lucide-react";
import { Card } from "./ui/Card";
import { SectionTitle } from "./ui/SectionTitle";
import type { TUpdateProfile, TUser } from "@/types";
import { authService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export function ProfileTab({
  user,
}: {
  user: TUser;
}) {
  const { refreshUser } = useAuth()
  const [formData, setFormData] = useState<TUpdateProfile>({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof TUpdateProfile, string>>
  >({});

  const handleChange =
    (field: keyof TUpdateProfile) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
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
    const newErrors: Partial<Record<keyof TUpdateProfile, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const isValid = validate();
    if (!isValid) return;

    await authService.updateProfile(formData)
    refreshUser()
  };

  const memberSince = "—";

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <SectionTitle
          title="Personal Information"
          subtitle="Update your personal details"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            required
            label="First Name"
            variant="primary"
            value={formData.firstName}
            onChange={handleChange("firstName")}
            error={errors.firstName}
          />
          <Input
            required
            label="Last Name"
            variant="primary"
            value={formData.lastName}
            onChange={handleChange("lastName")}
            error={errors.lastName}
          />
        </div>
      </Card>

      <Card>
        <SectionTitle
          title="Contact Information"
          subtitle="Update your contact details"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            required
            label="Email Address"
            variant="primary"
            value={formData.email}
            onChange={handleChange("email")}
            error={errors.email}
          />
          <Input
            required
            label="Phone Number"
            variant="primary"
            value={formData.phone}
            onChange={handleChange("phone")}
            error={errors.phone}
          />
        </div>
      </Card>

      <Card>
        <SectionTitle title="Account Information" subtitle="" />
        <div className="grid grid-cols-2 gap-6 md:gap-8">
          <div className="bg-primary/5 p-4 rounded-xl flex flex-col">
            <p className="text-sm font-medium mb-1 tracking-wide">Role</p>
            <p className="text-md font-semibold text-black capitalize">
              {user.role}
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl flex flex-col">
            <p className="text-sm font-medium mb-1 tracking-wide">
              Account Status
            </p>
            <p
              className={`flex items-center gap-2 text-md font-semibold ${
                user.isActive ? "text-green-600" : "text-red-600"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full inline-block ${
                  user.isActive ? "bg-green-600" : "bg-red-600"
                }`}
              />
              {user.isActive ? "Active" : "Inactive"}
            </p>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl flex flex-col">
            <p className="text-sm font-medium mb-1 tracking-wide">
              Member Since
            </p>
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
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
