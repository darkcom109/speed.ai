import { Link } from "react-router"

import { Button } from "@/components/ui/button"

export default function SiteNavbar() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="text-sm font-semibold tracking-tight">
          speed.ai
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/signup">Sign up</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
