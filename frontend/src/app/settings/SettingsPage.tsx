import useSettings from "@/app/settings/hooks/useSettings"
import Layout from "@/components/app/Layout"
import {
  SettingsHeader,
  AccountOptions,
  NotificationOptions,
} from "@/app/settings/components"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Renders appearance and account options
 *
 * @returns The settings page layout
 */
export default function SettingsPage() {
  const { user, error, isLoading, handleLogout, handleDeleteAccount } =
    useSettings()

  return (
    <Layout>
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <SettingsHeader />

        {error && <p className="text-sm text-destructive">{error}</p>}

        {isLoading ? (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid gap-4">
            <Card>
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-2/3" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          </div>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid gap-4">
            <NotificationOptions />
          </div>

          <AccountOptions
            user={user}
            handleLogout={handleLogout}
            handleDeleteAccount={handleDeleteAccount}
          />
          </div>
        )}
      </div>
    </Layout>
  )
}
