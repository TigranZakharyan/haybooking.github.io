import { useState } from "react";
import {
    Lock,
    User,
    Mail,
    Briefcase,
    Phone,
    CheckCircle,
    Plus,
    Trash2,
} from "lucide-react";
import { Button, Input, Select } from "@/components";
import { nanoid } from "nanoid";
import { categories, cities, countries } from "@/constants";
import { formatPhone, isValidPhone, isValidEmail } from "@/services/validation";
import { authService } from "@/services/api";
import type { TBranch } from "@/types";
import { useNavigate } from "react-router-dom";

/* ================= TYPES ================= */
type BusinessStepProps = {
    phone: string;
    code: string;
    setCode: (v: string) => void;
    onBack: () => void;
};

type Step = "personal" | "business" | "locations";

// Internal branch type that extends TBranch with a local UI id
type TBranchLocal = TBranch & { id: string };

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

// Errors mirror the shape of TBranch fields we validate
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
            coordinates: { latitude: "", longitude: "" },
        },
        phones: [""],
        workingHours: [],
    };
}

/* ================= COMPONENT ================= */
export function BusinessStep({ phone, code, setCode, onBack }: BusinessStepProps) {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>("personal");

    /* -------- Personal Info -------- */
    const [personal, setPersonal] = useState<PersonalState>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [personalErrors, setPersonalErrors] = useState<PersonalErrors>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        code: "",
    });

    /* -------- Business Info -------- */
    const [business, setBusiness] = useState<BusinessState>({
        businessName: "",
        businessType: "",
        description: "",
    });

    const [businessErrors, setBusinessErrors] = useState<BusinessErrors>({
        name: "",
        type: "",
    });

    /* -------- Locations -------- */
    const initialBranch = makeBranch();
    const [branches, setBranches] = useState<TBranchLocal[]>([initialBranch]);
    const [expandedBranchId, setExpandedBranchId] = useState<string | null>(initialBranch.id);
    const [branchErrors, setBranchErrors] = useState<Record<string, BranchFieldErrors>>({});
    const [submitError, setSubmitError] = useState<string>("");

    /* ================= VALIDATION ================= */
    const nextPersonalStep = () => {
        const errors: PersonalErrors = {
            firstName: personal.firstName ? "" : "Required",
            lastName: personal.lastName ? "" : "Required",
            email: personal.email && !isValidEmail(personal.email) ? "Invalid email" : "",
            password: personal.password.length >= 6 ? "" : "Password must be at least 6 chars",
            confirmPassword:
                personal.password === personal.confirmPassword ? "" : "Passwords do not match",
            code: code.length === 6 ? "" : "Enter 6-digit code",
        };
        setPersonalErrors(errors);
        if (!Object.values(errors).some(Boolean)) setStep("business");
    };

    const nextBusinessStep = () => {
        const errors: BusinessErrors = {
            name: business.businessName ? "" : "Required",
            type: business.businessType ? "" : "Required",
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
        setBranchErrors((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
        if (expandedBranchId === id) setExpandedBranchId(null);
    };

    const updateAddress = (
        id: string,
        field: keyof TBranch["address"],
        value: string
    ) => {
        setBranches((prev) =>
            prev.map((b) =>
                b.id === id ? { ...b, address: { ...b.address, [field]: value } } : b
            )
        );
        setBranchErrors((prev) => ({
            ...prev,
            [id]: { ...prev[id], [field]: "" },
        }));
    };

    /* ---- Phone helpers ---- */
    const addPhone = (branchId: string) => {
        setBranches((prev) =>
            prev.map((b) =>
                b.id === branchId ? { ...b, phones: [...b.phones, ""] } : b
            )
        );
    };

    const updatePhone = (branchId: string, phoneIndex: number, value: string) => {
        const formatted = formatPhone(value);
        setBranches((prev) =>
            prev.map((b) => {
                if (b.id !== branchId) return b;
                const phones = b.phones.map((p, i) => (i === phoneIndex ? formatted : p));
                return { ...b, phones };
            })
        );
        setBranchErrors((prev) => ({
            ...prev,
            [branchId]: { ...prev[branchId], phones: "" },
        }));
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

    /* ---- Validate all branches ---- */
    const validateBranches = (): boolean => {
        const errors: Record<string, BranchFieldErrors> = {};
        branches.forEach((b) => {
            const e: BranchFieldErrors = {};
            if (!b.address.street) e.street = "Required";
            if (!b.address.country) e.country = "Required";
            if (!b.address.city) e.city = "Required";
            const hasValidPhone = b.phones.some((p) => p && isValidPhone(p));
            if (!hasValidPhone) e.phones = "At least one valid phone required";
            errors[b.id] = e;
        });
        setBranchErrors(errors);
        return !Object.values(errors).some((e) => Object.keys(e).length > 0);
    };

    /* ================= SUBMIT ================= */
    const handleCreateAccount = async () => {
        setSubmitError("");
        if (!validateBranches()) return;

        const addresses: TBranch[] = branches.map(({ id: _id, ...rest }) => rest);

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
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? "Registration failed";
            setSubmitError(message);
        }
    };

    /* ================= RENDER ================= */
    return (
        <div className="space-y-4">
            {/* ================= STEP: PERSONAL ================= */}
            {step === "personal" && (
                <>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" /> Verify Your Phone
                    </h4>
                    <Input
                        label="Verification Code"
                        required
                        icon={Lock}
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        error={personalErrors.code}
                    />

                    <h4 className="font-semibold text-gray-900">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            required
                            icon={User}
                            value={personal.firstName}
                            placeholder="John"
                            onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })}
                            error={personalErrors.firstName}
                        />
                        <Input
                            label="Last Name"
                            required
                            icon={User}
                            value={personal.lastName}
                            placeholder="Doe"
                            onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })}
                            error={personalErrors.lastName}
                        />
                    </div>

                    <Input
                        label="Email (Optional)"
                        icon={Mail}
                        value={personal.email}
                        placeholder="john.doe@example.com"
                        onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                        error={personalErrors.email}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Password"
                            required
                            icon={Lock}
                            isPassword
                            value={personal.password}
                            placeholder="*********"
                            onChange={(e) => setPersonal({ ...personal, password: e.target.value })}
                            error={personalErrors.password}
                        />
                        <Input
                            label="Confirm Password"
                            required
                            icon={Lock}
                            isPassword
                            value={personal.confirmPassword}
                            placeholder="*********"
                            onChange={(e) =>
                                setPersonal({ ...personal, confirmPassword: e.target.value })
                            }
                            error={personalErrors.confirmPassword}
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" size="large" className="w-full" onClick={onBack}>
                            Back
                        </Button>
                        <Button
                            variant="liberty"
                            size="large"
                            className="w-full"
                            onClick={nextPersonalStep}
                        >
                            Continue
                        </Button>
                    </div>
                </>
            )}

            {/* ================= STEP: BUSINESS ================= */}
            {step === "business" && (
                <>
                    <h4 className="font-semibold text-gray-900">Business Information</h4>
                    <Input
                        label="Business Name"
                        required
                        icon={Briefcase}
                        value={business.businessName}
                        placeholder="Your business name"
                        onChange={(e) => setBusiness({ ...business, businessName: e.target.value })}
                        error={businessErrors.name}
                    />
                    <Select
                        options={categories}
                        label="Business Type"
                        required
                        value={business.businessType}
                        placeholder="Select Type"
                        onChange={(e) => setBusiness({ ...business, businessType: e.target.value })}
                        error={businessErrors.type}
                    />
                    <textarea
                        className="w-full rounded-xl border p-4 text-sm"
                        placeholder="Brief description of your business"
                        value={business.description}
                        onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                    />

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            size="large"
                            className="w-full"
                            onClick={() => setStep("personal")}
                        >
                            Back
                        </Button>
                        <Button
                            variant="liberty"
                            size="large"
                            className="w-full"
                            onClick={nextBusinessStep}
                        >
                            Continue
                        </Button>
                    </div>
                </>
            )}

            {/* ================= STEP: LOCATIONS ================= */}
            {step === "locations" && (
                <>
                    <h4 className="font-semibold text-gray-900">Contact & Locations</h4>

                    {branches.map((branch, index) => {
                        const isOpen = branch.id === expandedBranchId;
                        const errors = branchErrors[branch.id] ?? {};

                        return (
                            <div key={branch.id} className="rounded-xl border p-4 space-y-3">
                                {/* ---- Header (collapse toggle + remove) ---- */}
                                <div className="flex items-center justify-between">
                                    <div
                                        className="flex items-center gap-2 cursor-pointer flex-1"
                                        onClick={() =>
                                            setExpandedBranchId(isOpen ? null : branch.id)
                                        }
                                    >
                                        <p className="font-medium">
                                            {isOpen
                                                ? `Location ${index + 1}`
                                                : branch.address.street || `Location ${index + 1}`}
                                        </p>
                                        <span className="text-gray-400 text-lg leading-none">
                                            {isOpen ? "−" : "+"}
                                        </span>
                                    </div>

                                    {branches.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeBranch(branch.id)}
                                            className="text-red-400 hover:text-red-600 p-1 ml-2"
                                            aria-label="Remove location"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {/* ---- Expanded fields ---- */}
                                {isOpen && (
                                    <div className="space-y-3 mt-2">
                                        <Input
                                            label="Street Address"
                                            required
                                            value={branch.address.street}
                                            placeholder="123 Main St"
                                            onChange={(e) =>
                                                updateAddress(branch.id, "street", e.target.value)
                                            }
                                            error={errors.street}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <Select
                                                onChange={(e) =>
                                                    updateAddress(branch.id, "country", e.target.value)
                                                }
                                                value={branch.address.country}
                                                options={countries}
                                                label="Country"
                                                placeholder="Select Country"
                                                error={errors.country}
                                            />
                                            <Select
                                                onChange={(e) =>
                                                    updateAddress(branch.id, "city", e.target.value)
                                                }
                                                value={branch.address.city}
                                                options={
                                                    branch.address.country
                                                        ? cities[branch.address.country]
                                                        : []
                                                }
                                                label="City"
                                                placeholder="Select City"
                                                error={errors.city}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="State / Province"
                                                value={branch.address.state}
                                                placeholder="NY"
                                                onChange={(e) =>
                                                    updateAddress(branch.id, "state", e.target.value)
                                                }
                                            />
                                            <Input
                                                label="ZIP / Postal Code"
                                                value={branch.address.zipCode}
                                                placeholder="10001"
                                                onChange={(e) =>
                                                    updateAddress(branch.id, "zipCode", e.target.value)
                                                }
                                            />
                                        </div>

                                        {/* ---- Phone Numbers ---- */}
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-700">
                                                Phone Numbers <span className="text-red-500">*</span>
                                            </p>

                                            {branch.phones.map((phoneValue, phoneIndex) => (
                                                <div
                                                    key={phoneIndex}
                                                    className="flex items-center gap-2"
                                                >
                                                    <div className="flex-1">
                                                        <Input
                                                            icon={Phone}
                                                            value={phoneValue}
                                                            placeholder="+1 555 123 4567"
                                                            onChange={(e) =>
                                                                updatePhone(
                                                                    branch.id,
                                                                    phoneIndex,
                                                                    e.target.value
                                                                )
                                                            }
                                                            error={
                                                                phoneIndex === 0
                                                                    ? errors.phones
                                                                    : undefined
                                                            }
                                                        />
                                                    </div>

                                                    {branch.phones.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removePhone(branch.id, phoneIndex)
                                                            }
                                                            className="text-red-400 hover:text-red-600 p-1 mt-1 shrink-0"
                                                            aria-label="Remove phone"
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
                                                <Plus className="h-4 w-4" /> Add Phone Number
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
                        <Plus className="h-4 w-4" /> Add Another Location / Branch
                    </Button>

                    {submitError && (
                        <p className="text-sm text-red-500 text-center px-1">{submitError}</p>
                    )}

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            size="large"
                            className="w-full"
                            onClick={() => setStep("business")}
                        >
                            Back
                        </Button>
                        <Button
                            variant="liberty"
                            size="large"
                            className="w-full"
                            onClick={handleCreateAccount}
                        >
                            Create Business Account
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}