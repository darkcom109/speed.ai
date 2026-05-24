// React Router
import {
  createBrowserRouter
} from "react-router"

import App from "./App.tsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
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