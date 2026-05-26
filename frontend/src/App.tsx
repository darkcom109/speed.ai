import { useLocation } from "react-router"
import { SiteHeader } from "./components/site-header"

export function App() {
  const applyNavbar = ["/", "/login", "/signup"]
  const location = useLocation()
  const navbar = applyNavbar.includes(location.pathname)

  return navbar ? (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      
    </main>
  ) : (
    <>
    
    </>
  )
}

export default App
