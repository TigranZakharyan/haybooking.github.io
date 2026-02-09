import { Container } from "@/components";
import { Link, Outlet } from "react-router-dom";

export function UserLayout() {
    return (
        <div className="h-full grid grid-rows-[auto_1fr]">
            <header className="py-8">
                <Container className="flex justify-between items-center">
                    <a href="/" className="flex items-center justify-center gap-3">
                        <img src="/public/logo.png" className="w-12 h-12" />
                        <h2 className="">Haybooking</h2>
                    </a>
                    <div className="flex gap-6">
                        <Link
                            to="#"
                            className="relative text-white text-lg font-medium transition-all group"
                        >
                            Pricing
                            {/* The Animated Line */}
                            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                        </Link>

                        <Link
                            to="#"
                            className="relative text-white text-lg font-medium transition-all group"
                        >
                            Find Service
                            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                        </Link>

                        <Link
                            to="#"
                            className="relative text-white text-lg font-medium transition-all group"
                        >
                            Sign In/Up
                            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    </div>
                </Container>
            </header>
            <Outlet />
        </div>
    )
}