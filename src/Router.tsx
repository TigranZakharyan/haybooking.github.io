import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserLayout, DashboardLayout } from "@/layouts";
import { HomePage, SignInPage, SignUpPage, DashboardPage, PricingPage, SettingsPage, AnalyticsPage, SpecialistsPage, ServicesPage, BranchesPage, MyBookingsPage, CustomerSettingsPage } from "@/pages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/signin", element: <SignInPage /> },
      { path: "/signup", element: <SignUpPage /> },
      { path: "/pricing", element: <PricingPage /> },
      { path: "/my-bookings", element: <MyBookingsPage /> },
      { path: "/settings", element: <CustomerSettingsPage /> },
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "services", element: <ServicesPage /> },
      { path: "specialists", element: <SpecialistsPage /> },
      { path: "branches", element: <BranchesPage /> },
    ]

  }
]);

export function Router() {
  return <RouterProvider router={router} />;
}
