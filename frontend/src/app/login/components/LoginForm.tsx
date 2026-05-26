import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router"
import { loginUser } from "../api/login-api"

export default function LoginForm() {
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault()

      const formData = new FormData(event.currentTarget)

      const email = formData.get("email")
      const password = formData.get("password")

      try {
        setIsSubmitting(true)
        setError("")

        if (typeof email !== "string" || typeof password !== "string") {
          setError("Name, email and password are required")
          return
        }

        await loginUser({email, password})

        navigate("/dashboard")
      }
      catch(error) {
        setError(error instanceof Error ? error.message : "Unable to sign in")
        console.log(error)
      }
      finally {
        setIsSubmitting(false)
      }
  }

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Sign in to continue to your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal text-muted-foreground"
                >
                  Remember me
                </Label>
              </div>
              
              {error && (
                <p className="text-sm text-center text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <Button type="button" variant="outline" className="w-full">
              Continue with Google
            </Button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
