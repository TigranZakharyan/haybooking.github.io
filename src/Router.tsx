import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserLayout } from "@/layouts";
import { HomePage, SignInPage, SignUpPage } from "@/pages";

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
    ],
  },
]);

export function Router() {
    return <RouterProvider router={router} />
}