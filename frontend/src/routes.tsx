// React Router
import {
  createBrowserRouter
} from "react-router"

import {
  HomePage,
  LoginPage,
  SignupPage,
  DashboardPage,
} from "@/app/index"

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/signup",
    element: <SignupPage />
  },
  {
    path: "/dashboard",
    element: <DashboardPage />
  },
])

export default router