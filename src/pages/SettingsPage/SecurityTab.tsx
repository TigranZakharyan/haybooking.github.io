import { useState } from "react";
import { Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { Button, Input } from "@/components";
import { Card } from "../../components/Card";
import { SectionTitle } from "../../components/SectionTitle";
import {
  isValidPasswordLength,
  isValidPasswordMatch,
} from "@/services/validation";
import { authService } from "@/services/api";

export function SecurityTab() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [loading, setLoading] = useState(false);

  const set =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (status.type) setStatus({ type: null, message: "" });
    };

  // ✅ Validation using service
  const isLengthValid = isValidPasswordLength(form.newPassword);
  const isMatchValid = isValidPasswordMatch(
    form.newPassword,
    form.confirmPassword,
  );

  const canSubmit =
    form.currentPassword.trim() !== "" &&
    isLengthValid &&
    isMatchValid &&
    form.confirmPassword.length > 0 &&
    !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
    } catch {
      setStatus({
        type: "error",
        message: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <SectionTitle
          title="Change Password"
          subtitle="Password must be at least 8 characters."
        />

        <div className="flex flex-col gap-4">
          <Input
            label="Current Password"
            value={form.currentPassword}
            onChange={set("currentPassword")}
            variant="primary"
            isPassword
          />

          <Input
            label="New Password"
            value={form.newPassword}
            onChange={set("newPassword")}
            variant="primary"
            isPassword
            error={
              form.newPassword.length > 0 && !isLengthValid
                ? "Password must be at least 8 characters"
                : undefined
            }
          />

          <Input
            label="Confirm New Password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            variant="primary"
            isPassword
            error={!isMatchValid ? "Passwords do not match" : undefined}
          />
        </div>

        {status.type && (
          <StatusBanner type={status.type} message={status.message} />
        )}

        <div className="flex justify-end mt-6">
          <Button
            variant={canSubmit ? "default" : "outline"}
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 min-w-36"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {loading ? "Saving…" : "Update Password"}
          </Button>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Password Tips" subtitle="" />
        <ul className="flex flex-col gap-2">
          {[
            "Use at least 8 characters",
            "Avoid common words",
            "Do not reuse old passwords",
          ].map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-2 text-sm text-text-body/70"
            >
              <ShieldCheck className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function StatusBanner({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  return (
    <div
      className={`mt-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
        type === "success"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      {type === "success" ? (
        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
      )}
      {message}
    </div>
  );
}
