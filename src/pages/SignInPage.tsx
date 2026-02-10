import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Phone } from "lucide-react";
import { Input, DividerWithText, Tabs, Button } from "@/components";

// Define the available login methods for strict typing
type LoginMethod = "email" | "phone";

export function SignInPage() {
    const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");

    const tabOptions: { id: LoginMethod; label: string }[] = useMemo(() => [
        { id: "email", label: "Email" },
        { id: "phone", label: "Phone Number" }
    ], []);

    return (
        <div className="h-full grid grid-cols-2 md:grid-cols-2 overflow-hidden">
            {/* LEFT SIDE: Form Section */}
            <div className="w-full flex flex-col justify-center items-center p-8 md:p-16 bg-white">
                <div className="w-full max-w-lg space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-liberty">Sign In</h2>
                        <p className="text-liberty mt-2">Welcome Back!</p>
                    </div>

                    {/* Shared Tabs Component */}
                    <Tabs
                        tabs={tabOptions}
                        activeTab={loginMethod}
                        onChange={(id) => setLoginMethod(id)}
                    />

                    {/* Form Fields */}
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        {loginMethod === "email" ? (
                            <Input
                                key="email"
                                label="Email"
                                icon={Mail}
                                placeholder="Your email"
                            />
                        ) : (
                            <Input
                                key="phone"
                                label="Phone Number"
                                icon={Phone}
                                placeholder="+1 (555) 000-0000"
                            />
                        )}

                        <Input
                            label="Password"
                            icon={Lock}
                            placeholder="Your password"
                            isPassword
                        />

                        {/* Primary Action */}
                        <Button type="submit" size="large" variant="liberty" className="w-full">Sign In</Button>
                    </form>

                    <DividerWithText>
                        Don't have an account? <Link to="/signup" className="font-bold text-liberty hover:underline">Sign up</Link>
                    </DividerWithText>

                    {/* Footer Legal */}
                    <p className="text-center text-sm text-gray-400 leading-relaxed">
                        By signing up to create an account I accept <br />
                        Company's <span className="text-liberty underline cursor-pointer">Terms of Use</span> and <span className="text-liberty underline cursor-pointer">Privacy Policy</span>.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE: Visual Section */}
            <div className="w-full h-full">
                <div className="fixed w-1/2 h-full -z-1 top-0 bg-[url(/booking.jpg)] bg-no-repeat bg-cover bg-center"></div>
            </div>
        </div>
    );
}