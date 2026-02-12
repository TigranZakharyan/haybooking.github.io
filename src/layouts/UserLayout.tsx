import { Container } from "@/components";
import { Link, Outlet, useLocation } from "react-router-dom";
import { CircleDollarSign, Search, UserCircle2 } from "lucide-react";

export function UserLayout() {
  const location = useLocation()
  const textColor = location.pathname === '/signin' || location.pathname === "/signup" ? "text-white" : 'text-primary'
  const bgColor = location.pathname === '/signin' || location.pathname === "/signup" ? "bg-white" : 'bg-primary'
  return (
    <div className="h-full grid grid-rows-[auto_1fr_auto] bg-gray-50">
      {/* Header */}
      <header className="py-8 relative z-2">
        <Container className="flex justify-between items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center justify-center gap-3">
            <img src="/logo.png" className="w-10 h-10 md:w-12 md:h-12" alt="Logo" />
            <h1 className="text-xl font-bold md:text-primary">Haybooking</h1>
          </Link>

          {/* Navigation Links */}
          <nav className={`flex gap-4 md:gap-8 ${textColor}`}>
            <Link to="/pricing" className="relative group flex items-center gap-2">
              <CircleDollarSign className="w-6 h-6 md:hidden" />
              <span className="hidden md:block text-lg font-medium">Pricing</span>
              <span className={`absolute left-0 -bottom-1 w-0 h-0.5 ${bgColor} transition-all duration-300 group-hover:w-full`}></span>
            </Link>

            <Link to="/findServices" className="relative group flex items-center gap-2">
              <Search className="w-6 h-6 md:hidden" />
              <span className="hidden md:block text-lg font-medium">Find Service</span>
              <span className={`absolute left-0 -bottom-1 w-0 h-0.5 ${bgColor} transition-all duration-300 group-hover:w-full`}></span>
            </Link>

            <Link to="/signin" className="relative group flex items-center gap-2">
              <UserCircle2 className="w-6 h-6 md:hidden" />
              <span className="hidden md:block text-lg font-medium">Sign In/Up</span>
              <span className={`absolute left-0 -bottom-1 w-0 h-0.5 ${bgColor} transition-all duration-300 group-hover:w-full`}></span>
            </Link>
          </nav>
        </Container>
      </header>

      {/* Main Content */}
      <main className="h-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-4 bg-gray-100 text-center text-sm text-gray-600 relative z-2">
        © 2026 Haybooking. All rights reserved. Licensed under MIT License.
      </footer>
    </div>
  );
}
