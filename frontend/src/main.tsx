import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

// React Router
import {
  RouterProvider
} from "react-router"
import router from "./routes"
import { GoogleOAuthProvider } from "@react-oauth/google"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { GlobalAssistantSidebar } from "./components/global-assistant-sidebar"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <RouterProvider router={router}/>
        <GlobalAssistantSidebar />
      </GoogleOAuthProvider>
    </ThemeProvider>
  </StrictMode>
)
