// React Router
import {
  createBrowserRouter
} from "react-router"

import {
  HomePage,
  LoginPage,
  SignupPage,
  DashboardPage,
  TasksPage,
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
  {
    path: "/tasks",
    element: <TasksPage />
  },
])

export default router
