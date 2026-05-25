import { Button } from "@/components/ui/button"

export default function SiteNavbar() {
    return (
        <header className="border-b">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                <a href="/" className="text-sm font-semibold tracking-tight">
                    speed.ai
                </a>
                <nav className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                        <a href="#features">Features</a>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                        <a href="/login">Log in</a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <a href="/signup">Sign up</a>
                    </Button>
                    <Button asChild size="sm">
                        <a href="/dashboard">Open dashboard</a>
                    </Button>
                </nav>
            </div>
        </header>
    )
}
