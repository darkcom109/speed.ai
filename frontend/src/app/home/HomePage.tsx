import SiteNavbar from "@/components/site-navbar"
import { HomeHero, HomeLayout } from "@/app/home/components/index"

export default function HomePage() {
  return (
    <HomeLayout>
      <SiteNavbar />
      <HomeHero />
    </HomeLayout>
  )
}
