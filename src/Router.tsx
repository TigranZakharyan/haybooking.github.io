import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserLayout } from "@/layouts";
import { HomePage, SignInPage } from "@/pages";

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
    ],
  },
]);

export function Router() {
    return <RouterProvider router={router} />
}