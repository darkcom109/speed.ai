import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

// React Router
import {
  RouterProvider
} from "react-router"
import router from "./routes"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router}/>
    </ThemeProvider>
  </StrictMode>
)
