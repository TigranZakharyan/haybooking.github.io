import { Container, ProfileAvatar } from "@/components";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CircleDollarSign, UserCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSelect } from "@/components"; // adjust path as needed

export function UserLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAuthPage =
    location.pathname === "/signin" || location.pathname === "/signup";
  const textColor = isAuthPage ? "text-white" : "text-primary";
  const bgColor = isAuthPage ? "bg-white" : "bg-primary";

  const navLinkClass = "relative group flex items-center gap-2";
  const underlineClass = `absolute left-0 -bottom-1 w-0 h-0.5 ${bgColor} transition-all duration-300 group-hover:w-full`;

  return (
    <div className="min-h-full h-auto grid grid-rows-[auto_1fr_auto] bg-gray-50">
      <header className="py-8 relative z-2">
        <Container className="flex justify-between items-center">
          <Link to="/" className="flex items-center justify-center gap-3">
            <img src="/logo.png" className="w-10 h-10 md:w-12 md:h-12" alt="Logo" />
            <h1 className="text-xl font-bold text-business">Haybooking</h1>
          </Link>

          <nav className={`flex gap-4 md:gap-8 ${textColor}`}>
            <Link to="/pricing" className={navLinkClass}>
              <CircleDollarSign className="w-6 h-6 md:hidden" />
              <span className="hidden md:block text-lg font-medium">
                {t("layout.pricing")}
              </span>
              <span className={underlineClass} />
            </Link>

            {user ? (
              <Link to="/my-bookings" className={navLinkClass}>
                <UserCircle2 className="w-6 h-6 md:hidden" />
                <span className="hidden md:block text-lg font-medium">
                  {t("layout.myBookings")}
                </span>
                <span className={underlineClass} />
              </Link>
            ) : (
              <Link to="/signin" className={navLinkClass}>
                <UserCircle2 className="w-6 h-6 md:hidden" />
                <span className="hidden md:block text-lg font-medium">
                  {t("layout.signInUp")}
                </span>
                <span className={underlineClass} />
              </Link>
            )}

            <LanguageSelect />

            {user?.role === "customer" && (
              <ProfileAvatar
                initials={user.firstName[0].toUpperCase() + user.lastName[0].toUpperCase()}
                onLogoutClick={logout}
                onSettingsClick={() => navigate("/settings")}
              />
            )}

            {user?.role === "business" && (
              <ProfileAvatar
                initials={user.firstName[0].toUpperCase() + user.lastName[0].toUpperCase()}
                link="/dashboard"
              />
            )}
          </nav>
        </Container>
      </header>

      <main className="h-full">
        <Outlet />
      </main>

      <footer className="py-4 bg-gray-100 text-center text-sm text-gray-600 relative z-2">
        {t("layout.footer")}
      </footer>
    </div>
  );
}