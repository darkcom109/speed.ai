import SiteNavbar from "@/components/site-navbar"
import {
    SignupLayout, 
    SignupForm
} from "@/app/signup/components/index"


export default function SignupPage() {
  return (
    <SignupLayout>
        <SiteNavbar />
        <SignupForm />
    </SignupLayout>
  )
}
