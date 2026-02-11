import { Container } from "@/components";
import { Link, Outlet } from "react-router-dom";
import { CircleDollarSign, Search, UserCircle2 } from "lucide-react";
import { useLocation } from "react-router-dom";

export function UserLayout() {
  const location = useLocation()
  console.log(location.pathname)
  const titleColor = location.pathname === '/findServices' || location.pathname === "/pricing" ? "text-white!" : "undefined"
  const headerBg = location.pathname === '/findServices' || location.pathname === "/pricing" ? "bg-primary!" : "undefined"
  return (
    <div className="h-full grid grid-rows-[auto_1fr]">
      <header className={`py-8 md:bg-transparent bg-primary ${headerBg}`}>
        <Container className="flex justify-between items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center justify-center gap-3">
            <img src="/logo.png" className="w-10 h-10 md:w-12 md:h-12" alt="Logo" />
            <h1 className={`text-xl font-bold md:text-primary text-white ${titleColor}`}>Haybooking</h1>
          </Link>

          {/* Navigation Links */}
          <nav className="flex gap-4 md:gap-8">
            <Link
              to="/pricing"
              className="relative text-white group flex items-center gap-2"
            >
              <CircleDollarSign className="w-6 h-6 md:hidden" />
              <span className="hidden md:block text-lg font-medium">Pricing</span>
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link
              to="/findServices"
              className="relative text-white group flex items-center gap-2"
            >
              <Search className="w-6 h-6 md:hidden" />
              <span className="hidden md:block text-lg font-medium">Find Service</span>
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link
              to="/signin"
              className="relative text-white group flex items-center gap-2"
            >
              <UserCircle2 className="w-6 h-6 md:hidden" />
              <span className="hidden md:block text-lg font-medium">Sign In/Up</span>
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
        </Container>
      </header>

      <main className="h-full">
        <Outlet />
      </main>
    </div>
  );
}