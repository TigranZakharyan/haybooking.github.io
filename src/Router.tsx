import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserLayout } from "@/layouts";
import { HomePage, SignInPage, SignUpPage, FindServicesPage } from "@/pages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    // errorElement: <NotFound />, 
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/signin',
        element: <SignInPage />,
      },
      {
        path: '/signup',
        element: <SignUpPage />,
      },
      {
        path: '/findServices',
        element: <FindServicesPage />,
      },
    ],
  },
]);

export function Router() {
    return <RouterProvider router={router} />
}