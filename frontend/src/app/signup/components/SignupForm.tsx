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
import { useNavigate } from "react-router"
import { useState } from "react"
import { signupUser } from "../api/signup-api"

export default function SignupForm() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmitSignup(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        const name = formData.get('name')
        const email = formData.get("email")
        const password = formData.get("password")

        try {
            setIsSubmitting(true)
            setError("")

            if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
                setError("Email and password are required")
                return
            }

            await signupUser({ name, email, password})

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
                    <CardTitle>Create your account</CardTitle>
                    <CardDescription>
                        Start tracking your team&apos;s work in speed.ai.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmitSignup}>
                        <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Alex Garcia"
                            autoComplete="name"
                            required
                        />
                        </div>

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
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                        />
                        </div>

                        <div className="flex items-start gap-2">
                        <Checkbox id="terms" className="mt-0.5" />
                        <Label
                            htmlFor="terms"
                            className="text-sm leading-5 font-normal text-muted-foreground"
                        >
                            I agree to the terms and privacy policy.
                        </Label>
                        </div>

                        {error && (
                            <p className="text-sm text-center text-destructive">
                                {error}
                            </p>
                        )}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Creating Account..." : "Create account"}
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
                        Already have an account?{" "}
                        <Link
                        to="/login"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                        Sign in
                        </Link>
                    </p>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}