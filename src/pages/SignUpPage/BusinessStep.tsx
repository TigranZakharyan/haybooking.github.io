import { useState } from "react";
import {
    Lock,
    User,
    Mail,
    Briefcase,
    Phone,
    CheckCircle,
    Plus,
} from "lucide-react";
import { Button, Input, Select } from "@/components";
import { nanoid } from "nanoid";
import { cities, countries } from "@/constants";

/* ================= TYPES ================= */

type BusinessStepProps = {
    phone: string;
    code: string;
    setCode: (v: string) => void;
    onBack: () => void;
};

type Step = "personal" | "business" | "locations";

type Branch = {
    id: string;
    address: string;
    country: string;
    city: string;
    state: string;
    phone: string;
};

/* ================= COMPONENT ================= */

export function BusinessStep({
    phone,
    code,
    setCode,
    onBack,
}: BusinessStepProps) {
    const [step, setStep] = useState<Step>("personal");

    /* -------- Personal Info -------- */
    const [personal, setPersonal] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    /* -------- Business Info -------- */
    const [business, setBusiness] = useState({
        name: "",
        type: "",
        description: "",
    });

    /* -------- Locations -------- */
    const [branches, setBranches] = useState<Branch[]>([
        {
            id: nanoid(),
            address: "",
            country: "",
            city: "",
            state: "",
            phone: "",
        },
    ]);

    const [expandedBranchId, setExpandedBranchId] = useState<string | null>(
        branches[0]?.id || null
    );

    /* ================= HELPERS ================= */

    const next = () => {
        if (step === "personal") setStep("business");
        else if (step === "business") setStep("locations");
    };

    const back = () => {
        if (step === "locations") setStep("business");
        else if (step === "business") setStep("personal");
        else onBack();
    };

    const addBranch = () => {
        const newBranch = {
            id: nanoid(),
            address: "",
            country: "",
            city: "",
            state: "",
            phone: "",
        };
        setBranches((prev) => [...prev, newBranch]);
        setExpandedBranchId(newBranch.id); // Open new branch
    };

    const updateBranch = (id: string, field: keyof Branch, value: string) => {
        setBranches((prev) =>
            prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
        );
    };

    /* ================= UI ================= */

    return (
        <div className="space-y-4">
            {/* ================= STEP: PERSONAL ================= */}
            {step === "personal" && (
                <>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Verify Your Phone
                    </h4>

                    <Input
                        label="Verification Code"
                        required
                        icon={Lock}
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                    />

                    <h4 className="font-semibold text-gray-900">Personal Information</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            required
                            icon={User}
                            value={personal.firstName}
                            placeholder="John"
                            onChange={(e) =>
                                setPersonal({ ...personal, firstName: e.target.value })
                            }
                        />
                        <Input
                            label="Last Name"
                            required
                            icon={User}
                            value={personal.lastName}
                            placeholder="Doe"
                            onChange={(e) =>
                                setPersonal({ ...personal, lastName: e.target.value })
                            }
                        />
                    </div>

                    <Input
                        label="Email (Optional)"
                        icon={Mail}
                        value={personal.email}
                        placeholder="john.doe@example.com"
                        onChange={(e) =>
                            setPersonal({ ...personal, email: e.target.value })
                        }
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Password"
                            required
                            icon={Lock}
                            isPassword
                            value={personal.password}
                            placeholder="*********"
                            onChange={(e) =>
                                setPersonal({ ...personal, password: e.target.value })
                            }
                        />
                        <Input
                            label="Confirm Password"
                            required
                            icon={Lock}
                            isPassword
                            value={personal.confirmPassword}
                            placeholder="*********"
                            onChange={(e) =>
                                setPersonal({
                                    ...personal,
                                    confirmPassword: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" size="large" className="w-full" onClick={back}>
                            Back
                        </Button>
                        <Button variant="liberty" size="large" className="w-full" onClick={next}>
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
                        value={business.name}
                        placeholder="Your business name"
                        onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                    />

                    <Input
                        label="Business Type"
                        required
                        value={business.type}
                        onChange={(e) => setBusiness({ ...business, type: e.target.value })}
                        placeholder="Salon, Clinic, Gym, etc."
                    />

                    <textarea
                        className="w-full rounded-xl border p-4 text-sm"
                        placeholder="Brief description of your business"
                        value={business.description}
                        onChange={(e) =>
                            setBusiness({ ...business, description: e.target.value })
                        }
                    />

                    <div className="flex gap-3">
                        <Button variant="outline" size="large" className="w-full" onClick={back}>
                            Back
                        </Button>
                        <Button variant="liberty" size="large" className="w-full" onClick={next}>
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

                        return (
                            <div
                                key={branch.id}
                                className="rounded-xl border p-4 space-y-3 cursor-pointer"
                            >
                                {/* Header */}
                                <div
                                    className="flex items-center justify-between"
                                    onClick={() => setExpandedBranchId(isOpen ? null : branch.id)}
                                >
                                    <p className="font-medium">
                                        {isOpen
                                            ? `Location ${index + 1}`
                                            : branch.address || `Location ${index + 1}`}
                                    </p>
                                    <span className="text-gray-400">{isOpen ? "−" : "+"}</span>
                                </div>

                                {/* Expanded content */}
                                {isOpen && (
                                    <div className="space-y-3 mt-2">
                                        <Input
                                            label="Street Address"
                                            required
                                            value={branch.address}
                                            placeholder="123 Main St"
                                            onChange={(e) =>
                                                updateBranch(branch.id, "address", e.target.value)
                                            }
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <Select
                                                onChange={(e) =>
                                                    updateBranch(branch.id, "country", e.target.value)
                                                }
                                                value={branch.country}
                                                options={countries}
                                                label="Country"
                                                placeholder="Select Country"
                                            />
                                            <Select
                                                onChange={(e) =>
                                                    updateBranch(branch.id, "city", e.target.value)
                                                }
                                                value={branch.city}
                                                options={branch.country ? cities[branch.country] : []}
                                                label="City"
                                                placeholder="Select City"
                                            />
                                        </div>

                                        <Input
                                            label="State / Province"
                                            value={branch.state}
                                            placeholder="NY"
                                            onChange={(e) =>
                                                updateBranch(branch.id, "state", e.target.value)
                                            }
                                        />

                                        <Input
                                            label="Phone Number"
                                            required
                                            icon={Phone}
                                            value={branch.phone}
                                            placeholder="+1 555 123 4567"
                                            onChange={(e) =>
                                                updateBranch(branch.id, "phone", e.target.value)
                                            }
                                        />
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
                        <Plus className="h-4 w-4" />
                        Add Another Location / Branch
                    </Button>

                    <div className="flex gap-3">
                        <Button variant="outline" size="large" className="w-full" onClick={back}>
                            Back
                        </Button>
                        <Button
                            variant="liberty"
                            size="large"
                            className="w-full"
                            onClick={() => console.log({ phone, personal, business, branches })}
                        >
                            Create Business Account
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
