// React Router
import {
  createBrowserRouter
} from "react-router"

import HomePage from "@/app/home/HomePage"

const router = createBrowserRouter([
  {
    path: "/",
    element: < HomePage/>
  },
  /*

  FUTURE REFERENCE:
  - Login Page
  - Signup Page
  - Dashboard Page

  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/signup",
    element: <Signup />
  },
  {
    path: "/dashboard",
    element: <Dashboard />
  },
  */
])

export default router