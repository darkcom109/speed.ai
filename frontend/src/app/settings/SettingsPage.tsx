import useSettings from "@/app/settings/hooks/useSettings"
import Layout from "@/components/app/Layout"
import {
  AppearanceOptions,
  SettingsHeader,
  AccountOptions,
} from "@/app/settings/components"

/**
 * Renders appearance and account options
 *
 * @returns The settings page layout
 */
export default function SettingsPage() {
  const { user, error, theme, setTheme, handleLogout, handleDeleteAccount } =
    useSettings()

  return (
    <Layout>
      <SettingsHeader />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
        <AppearanceOptions theme={theme} setTheme={setTheme} />

        <AccountOptions
          user={user}
          handleLogout={handleLogout}
          handleDeleteAccount={handleDeleteAccount}
        />
      </div>
    </Layout>
  )
}
