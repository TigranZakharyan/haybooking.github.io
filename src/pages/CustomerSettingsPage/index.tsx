import { useState, useMemo } from "react";
import { Button, Container, Input } from "@/components";
import { Edit2, Lock } from "lucide-react";
import { Card } from "@/components/Card";
import { SectionTitle } from "@/components/SectionTitle";
import type { TUpdatePasswordForm, TUpdateProfileForm, TUser } from "@/types";
import { authService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import {
  isValidPasswordMatch,
  isValidPasswordLength,
} from "@/services/validation";

type TPasswordErrors = { [K in keyof TUpdatePasswordForm]: string | undefined };

export function CustomerSettingsPage() {
  const { user, refreshUser } = useAuth() as {
    user: TUser;
    refreshUser: () => void;
  };

  if (!user) return null;

  const [formData, setFormData] = useState<TUpdateProfileForm>({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof TUpdateProfileForm, string>>
  >({});

  const [isEditing, setIsEditing] = useState(false);

  const [passwordData, setPasswordData] = useState<TUpdatePasswordForm>({
    currentPassword: "",
    newPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState<TPasswordErrors>({
    currentPassword: undefined,
    newPassword: undefined,
  });

  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const handleChange =
    (field: keyof TUpdateProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handlePasswordChange =
    (field: "currentPassword" | "newPassword") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      setPasswordData((prev) => ({ ...prev, [field]: value }));
      if (passwordErrors[field]) {
        setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
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

  const hasPasswordChanges = useMemo(() => {
    return (
      passwordData.currentPassword !== "" || 
      passwordData.newPassword !== ""
    );
  }, [passwordData]);

  const validate = () => {
    const newErrors: Partial<Record<keyof TUpdateProfileForm, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: TPasswordErrors = {
      currentPassword: undefined,
      newPassword: undefined,
    };

    // Validate current password
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    } else if (!isValidPasswordLength(passwordData.currentPassword)) {
      newErrors.currentPassword = "Password must be at least 8 characters";
    }

    // Validate new password
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (!isValidPasswordLength(passwordData.newPassword)) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (passwordData.newPassword === passwordData.currentPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    setPasswordErrors(newErrors);

    return Object.values(newErrors).every(error => error === undefined);
  };

  const handleSave = async () => {
    const isValid = validate();
    if (!isValid) return;

    await authService.updateProfile(formData);
    refreshUser();
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  const handlePasswordSave = async () => {
    const isValid = validatePassword();
    if (!isValid) return;

    try {
      await authService.changePassword(passwordData);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
      });
      setPasswordErrors({
        currentPassword: undefined,
        newPassword: undefined,
      });
      setIsEditingPassword(false);
    } catch {
    }
  };

  const handlePasswordCancel = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
    });
    setPasswordErrors({
      currentPassword: undefined,
      newPassword: undefined,
    });
    setIsEditingPassword(false);
  };

  return (
    <Container className="flex flex-col gap-5">
      <h2 className="uppercase">My Bookings</h2>
      {/* Personal Information */}
      <Card>
        <div className="flex justify-between items-center">
          <SectionTitle
            title="Personal Information"
            subtitle="Update your personal details"
          />
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {isEditing ? (
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
            <Input
              required
              label="Email Address"
              type="email"
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">First Name</p>
              <p className="font-medium">{user.firstName}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Last Name</p>
              <p className="font-medium">{user.lastName}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium">{user.phone || "Not provided"}</p>
            </div>
          </div>
        )}
        {isEditing && (
          <div className="flex justify-end gap-3 mt-6 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
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
        )}
      </Card>

      {/* Security */}
      <Card>
        <div className="flex justify-between items-center">
          <SectionTitle title="Security" subtitle="Update your password" />
          {!isEditingPassword && (
            <Button
              variant="outline"
              onClick={() => setIsEditingPassword(true)}
              className="flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </Button>
          )}
        </div>

        {isEditingPassword ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              required
              label="Current Password"
              type="password"
              isPassword
              placeholder="********"
              variant="primary"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange("currentPassword")}
              error={passwordErrors.currentPassword}
            />
            <Input
              required
              label="New Password"
              type="password"
              isPassword
              placeholder="********"
              variant="primary"
              value={passwordData.newPassword}
              onChange={handlePasswordChange("newPassword")}
              error={passwordErrors.newPassword}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Password</p>
              <p className="font-medium">••••••••</p>
            </div>
          </div>
        )}
        {isEditingPassword && (
          <div className="flex justify-end gap-3 mt-6 pt-4">
            <Button variant="outline" onClick={handlePasswordCancel}>
              Cancel
            </Button>
            <Button
              variant={hasPasswordChanges ? "default" : "outline"}
              onClick={handlePasswordSave}
              className="flex items-center justify-center gap-2"
              disabled={!hasPasswordChanges}
            >
              <Lock className="w-4 h-4" />
              Update Password
            </Button>
          </div>
        )}
      </Card>
    </Container>
  );
}