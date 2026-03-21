import { useEffect, useState } from "react";
import { Lock, User, Mail, Briefcase, CheckCircle, Trash2 } from "lucide-react";
import { Button, Input, Select } from "@/components";
import { PhoneInput } from "@/components/PhoneInput";
import { nanoid } from "nanoid";
import { cities, countries } from "@/constants";
import { isValidPhone, isValidEmail, isValidPasswordLength, isValidPasswordMatch } from "@/services/validation";
import { authService, searchService } from "@/services/api";
import type { TBranch, TBusinessType } from "@/types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* ================= TYPES ================= */
type BusinessStepProps = {
  phone: string;
  code: string;
  setCode: (v: string) => void;
  onBack: () => void;
};

type Step = "personal" | "business" | "locations";
type TBranchLocal = Omit<TBranch, '_id' | 'business' | 'isBaseBranch' | 'isActive' | 'updatedAt' | 'createdAt'> & { id: string };

type PersonalState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type PersonalErrors = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
};

type BusinessState = {
  businessName: string;
  businessType: string;
  description: string;
};

type BusinessErrors = {
  name: string;
  type: string;
};

type BranchFieldErrors = {
  street?: string;
  country?: string;
  city?: string;
  phones?: string;
};

/* ================= HELPERS ================= */
function makeBranch(): TBranchLocal {
  return {
    id: nanoid(),
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      coordinates: { latitude: 0, longitude: 0 },
    },
    phones: [""],
    workingHours: [],
  };
}

/* ================= COMPONENT ================= */
export function BusinessStep({ phone, code, setCode, onBack }: BusinessStepProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("personal");
  const [types, setTypes] = useState<TBusinessType[]>([]);

  const [personal, setPersonal] = useState<PersonalState>({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
  });

  const [personalErrors, setPersonalErrors] = useState<PersonalErrors>({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "", code: "",
  });

  const [business, setBusiness] = useState<BusinessState>({
    businessName: "", businessType: "", description: "",
  });

  const [businessErrors, setBusinessErrors] = useState<BusinessErrors>({
    name: "", type: "",
  });

  const initialBranch = makeBranch();
  const [branches, setBranches] = useState<TBranchLocal[]>([initialBranch]);
  const [expandedBranchId, setExpandedBranchId] = useState<string | null>(initialBranch.id);
  const [branchErrors, setBranchErrors] = useState<Record<string, BranchFieldErrors>>({});
  const [submitError, setSubmitError] = useState<string>("");

  /* ================= VALIDATION ================= */
  const nextPersonalStep = () => {
    const errors: PersonalErrors = {
      firstName: personal.firstName ? "" : t("errors.required"),
      lastName: personal.lastName ? "" : t("errors.required"),
      email: personal.email && !isValidEmail(personal.email) ? t("errors.emailInvalid") : "",
      password: isValidPasswordLength(personal.password) ? "" : t("errors.passwordLength"),
      confirmPassword: isValidPasswordMatch(personal.password, personal.confirmPassword) ? "" : t("errors.passwordMatch"),
      code: code.length === 6 ? "" : t("errors.codeLength"),
    };
    setPersonalErrors(errors);
    if (!Object.values(errors).some(Boolean)) setStep("business");
  };

  const nextBusinessStep = () => {
    const errors: BusinessErrors = {
      name: business.businessName ? "" : t("errors.required"),
      type: business.businessType ? "" : t("errors.required"),
    };
    setBusinessErrors(errors);
    if (!Object.values(errors).some(Boolean)) setStep("locations");
  };

  /* ================= BRANCH HELPERS ================= */
  const addBranch = () => {
    const newBranch = makeBranch();
    setBranches((prev) => [...prev, newBranch]);
    setExpandedBranchId(newBranch.id);
  };

  const removeBranch = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
    setBranchErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });
    if (expandedBranchId === id) setExpandedBranchId(null);
  };

  const updateAddress = (id: string, field: keyof TBranch["address"], value: string) => {
    setBranches((prev) =>
      prev.map((b) => b.id === id ? { ...b, address: { ...b.address, [field]: value } } : b)
    );
    setBranchErrors((prev) => ({ ...prev, [id]: { ...prev[id], [field]: "" } }));
  };

  const addPhone = (branchId: string) => {
    setBranches((prev) =>
      prev.map((b) => b.id === branchId ? { ...b, phones: [...b.phones, ""] } : b)
    );
  };

  const updatePhone = (branchId: string, phoneIndex: number, value: string | null) => {
    setBranches((prev) =>
      prev.map((b) => {
        if (b.id !== branchId) return b;
        const phones = b.phones.map((p, i) => (i === phoneIndex ? (value || "") : p));
        return { ...b, phones };
      })
    );
    setBranchErrors((prev) => ({ ...prev, [branchId]: { ...prev[branchId], phones: "" } }));
  };

  const removePhone = (branchId: string, phoneIndex: number) => {
    setBranches((prev) =>
      prev.map((b) => {
        if (b.id !== branchId) return b;
        const phones = b.phones.filter((_, i) => i !== phoneIndex);
        return { ...b, phones: phones.length > 0 ? phones : [""] };
      })
    );
  };

  const validateBranches = (): boolean => {
    const errors: Record<string, BranchFieldErrors> = {};
    branches.forEach((b) => {
      const e: BranchFieldErrors = {};
      if (!b.address.street) e.street = t("errors.required");
      if (!b.address.country) e.country = t("errors.required");
      if (!b.address.city) e.city = t("errors.required");
      const hasValidPhone = b.phones.some((p) => p && isValidPhone(p));
      if (!hasValidPhone) e.phones = t("errors.phoneAtLeastOne");
      errors[b.id] = e;
    });
    setBranchErrors(errors);
    return !Object.values(errors).some((e) => Object.keys(e).length > 0);
  };

  /* ================= SUBMIT ================= */
  const handleCreateAccount = async () => {
    setSubmitError("");
    if (!validateBranches()) return;

    const addresses = branches.map(({ id: _id, ...rest }) => rest);
    try {
      await authService.registerBusiness({
        phone,
        verificationCode: code,
        firstName: personal.firstName,
        lastName: personal.lastName,
        email: personal.email,
        password: personal.password,
        confirmPassword: personal.confirmPassword,
        role: "business",
        businessName: business.businessName,
        businessType: business.businessType,
        description: business.description,
        addresses,
      });
      navigate("/signin");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? t("errors.registrationFailed");
      setSubmitError(message);
    }
  };

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    const res = await searchService.getBusinessTypes();
    setTypes(res);
  };

  /* ================= RENDER ================= */
  return (
    <div className="space-y-4">
      {/* ================= STEP: PERSONAL ================= */}
      {step === "personal" && (
        <>
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {t("signUp.verifyPhone")}
          </h4>
          <Input
            label={t("signUp.verificationCode")}
            required
            icon={Lock}
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("signUp.codePlaceholder")}
            error={personalErrors.code}
          />

          <h4 className="font-semibold text-gray-900">{t("signUp.personalInfo")}</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("settings.firstName")}
              required
              icon={User}
              value={personal.firstName}
              placeholder="John"
              onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })}
              error={personalErrors.firstName}
            />
            <Input
              label={t("settings.lastName")}
              required
              icon={User}
              value={personal.lastName}
              placeholder="Doe"
              onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })}
              error={personalErrors.lastName}
            />
          </div>

          <Input
            label={t("signUp.emailOptional")}
            icon={Mail}
            value={personal.email}
            placeholder="john.doe@example.com"
            onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
            error={personalErrors.email}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("settings.newPassword")}
              required
              icon={Lock}
              isPassword
              value={personal.password}
              placeholder={t("signUp.passwordPlaceholder")}
              onChange={(e) => setPersonal({ ...personal, password: e.target.value })}
              error={personalErrors.password}
            />
            <Input
              label={t("settings.confirmNewPassword")}
              required
              icon={Lock}
              isPassword
              value={personal.confirmPassword}
              placeholder={t("signUp.passwordPlaceholder")}
              onChange={(e) => setPersonal({ ...personal, confirmPassword: e.target.value })}
              error={personalErrors.confirmPassword}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="large" className="w-full" onClick={onBack}>
              {t("signUp.back")}
            </Button>
            <Button variant="liberty" size="large" className="w-full" onClick={nextPersonalStep}>
              {t("signUp.continue")}
            </Button>
          </div>
        </>
      )}

      {/* ================= STEP: BUSINESS ================= */}
      {step === "business" && (
        <>
          <h4 className="font-semibold text-gray-900">{t("signUp.businessInfo")}</h4>
          <Input
            label={t("settings.businessName")}
            required
            icon={Briefcase}
            value={business.businessName}
            placeholder={t("signUp.businessNamePlaceholder")}
            onChange={(e) => setBusiness({ ...business, businessName: e.target.value })}
            error={businessErrors.name}
          />
          <Select
            options={types}
            label={t("settings.businessType")}
            required
            value={business.businessType}
            placeholder={t("signUp.selectType")}
            onChange={(value) => setBusiness({ ...business, businessType: value })}
            error={businessErrors.type}
          />
          <textarea
            className="w-full rounded-xl border p-4 text-sm"
            placeholder={t("signUp.businessDescPlaceholder")}
            value={business.description}
            onChange={(e) => setBusiness({ ...business, description: e.target.value })}
          />

          <div className="flex gap-3">
            <Button variant="outline" size="large" className="w-full" onClick={() => setStep("personal")}>
              {t("signUp.back")}
            </Button>
            <Button variant="liberty" size="large" className="w-full" onClick={nextBusinessStep}>
              {t("signUp.continue")}
            </Button>
          </div>
        </>
      )}

      {/* ================= STEP: LOCATIONS ================= */}
      {step === "locations" && (
        <>
          <h4 className="font-semibold text-gray-900">{t("signUp.contactLocations")}</h4>

          {branches.map((branch, index) => {
            const isOpen = branch.id === expandedBranchId;
            const errors = branchErrors[branch.id] ?? {};

            return (
              <div key={branch.id} className="rounded-xl border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-2 cursor-pointer flex-1"
                    onClick={() => setExpandedBranchId(isOpen ? null : branch.id)}
                  >
                    <p className="font-medium">
                      {isOpen
                        ? t("signUp.locationIndex", { index: index + 1 })
                        : branch.address.street || t("signUp.locationIndex", { index: index + 1 })}
                    </p>
                    <span className="text-gray-400 text-lg leading-none">{isOpen ? "−" : "+"}</span>
                  </div>

                  {branches.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBranch(branch.id)}
                      className="text-red-400 hover:text-red-600 p-1 ml-2"
                      aria-label={t("signUp.removeLocation")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="space-y-3 mt-2">
                    <Input
                      label={t("branches.streetAddress")}
                      required
                      value={branch.address.street}
                      placeholder="123 Main St"
                      onChange={(e) => updateAddress(branch.id, "street", e.target.value)}
                      error={errors.street}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        onChange={(value) => updateAddress(branch.id, "country", value)}
                        value={branch.address.country}
                        options={countries}
                        label={t("branches.country")}
                        placeholder={t("signUp.selectCountry")}
                        error={errors.country}
                      />
                      <Select
                        onChange={(value) => updateAddress(branch.id, "city", value)}
                        value={branch.address.city}
                        options={branch.address.country ? cities[branch.address.country] : []}
                        label={t("branches.city")}
                        placeholder={t("signUp.selectCity")}
                        error={errors.city}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label={t("branches.stateProvince")}
                        value={branch.address.state}
                        placeholder="NY"
                        onChange={(e) => updateAddress(branch.id, "state", e.target.value)}
                      />
                      <Input
                        label={t("branches.zipCode")}
                        value={branch.address.zipCode}
                        placeholder="10001"
                        onChange={(e) => updateAddress(branch.id, "zipCode", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        {t("branches.phones")} <span className="text-red-500">*</span>
                      </p>

                      {branch.phones.map((_phoneValue, phoneIndex) => (
                        <div key={phoneIndex} className="flex items-start gap-2">
                          <div className="flex-1">
                            <PhoneInput
                              onChange={(value) => updatePhone(branch.id, phoneIndex, value)}
                              error={phoneIndex === 0 ? errors.phones : undefined}
                            />
                          </div>
                          {branch.phones.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePhone(branch.id, phoneIndex)}
                              className="text-red-400 hover:text-red-600 p-1 mt-1 shrink-0"
                              aria-label={t("signUp.removePhone")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addPhone(branch.id)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        {t("signUp.addPhone")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <Button
            variant="outline"
            size="medium"
            className="w-full flex items-center justify-center gap-2"
            onClick={addBranch}
          >
            {t("signUp.addBranch")}
          </Button>

          {submitError && (
            <p className="text-sm text-red-500 text-center px-1">{submitError}</p>
          )}

          <div className="flex gap-3">
            <Button variant="outline" size="large" className="w-full" onClick={() => setStep("business")}>
              {t("signUp.back")}
            </Button>
            <Button variant="liberty" size="large" className="w-full" onClick={handleCreateAccount}>
              {t("signUp.createBusinessAccount")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}