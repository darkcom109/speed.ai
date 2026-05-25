import { useLocation } from "react-router"
import { SiteHeader } from "./components/site-header"

export function App() {
  const applyNavbar = ["/", "/login", "/signup"]
  const location = useLocation()
  const navbar = applyNavbar.includes(location.pathname)

  return navbar ? (
    
  ) : (
    
  )
}

export default App
