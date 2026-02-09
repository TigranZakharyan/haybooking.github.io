import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserLayout } from "@/layouts";
import { HomePage } from "@/pages";

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
    ],
  },
]);

export function Router() {
    return <RouterProvider router={router} />
}