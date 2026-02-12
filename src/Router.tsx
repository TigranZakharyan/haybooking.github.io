import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserLayout, DashboardLayout } from "@/layouts";
import { HomePage, SignInPage, SignUpPage, FindServicesPage, DashboardPage } from "@/pages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/signin", element: <SignInPage /> },
      { path: "/signup", element: <SignUpPage /> },
      { path: "/findServices", element: <FindServicesPage /> },
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
    ]

  }
]);

export function Router() {
  return <RouterProvider router={router} />;
}
