import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="text-sm font-semibold tracking-tight">
            speed.ai
          </a>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href="#features">Features</a>
            </Button>
            <Button asChild size="sm">
              <a href="/dashboard">Open dashboard</a>
            </Button>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div>
          <Badge variant="secondary">Dashboard workspace</Badge>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Monitor work, performance, and team activity in one place.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Speed.ai gives your team a focused operational dashboard for
            tracking important records, reviewing activity, and moving faster
            from signal to decision.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="/dashboard">View dashboard</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#features">See features</a>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Today at a glance</CardTitle>
            <CardDescription>
              A simple preview of the workspace your dashboard opens into.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-semibold">128</p>
                <p className="text-sm text-muted-foreground">Active records</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">94%</p>
                <p className="text-sm text-muted-foreground">Reviewed</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Pending review</span>
                <span className="font-medium">18 items</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Completed today</span>
                <span className="font-medium">42 items</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Team members</span>
                <span className="font-medium">12 online</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
