import SiteNavbar from "@/components/site-navbar"
import { LoginForm, LoginLayout } from "@/app/login/components/index"

export default function LoginPage() {
  return (
    <LoginLayout>
      <SiteNavbar />
      <LoginForm />
    </LoginLayout>
  )
}
