import { LogOutIcon, Trash2Icon, UserRoundIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type AccountOptionsProps = {
  user: { name: string; email: string } | null
  handleLogout: () => Promise<void>
  handleDeleteAccount: () => Promise<void>
}

export default function AccountOptions({
  user,
  handleLogout,
  handleDeleteAccount,
}: AccountOptionsProps) {
  return (
    <Card className="lg:sticky lg:top-4">
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Signed-in profile details for this workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <UserRoundIcon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{user?.name || "Loading..."}</p>
            <p className="truncate text-sm text-muted-foreground">
              {user?.email || "Fetching account details"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          <Button
            type="button"
            variant="outline"
            className="justify-start"
            onClick={handleLogout}
          >
            <LogOutIcon />
            Log out
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" className="w-full justify-start">
                <Trash2Icon />
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive">
                  <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and all related
                  tasks and notes. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleDeleteAccount}
                >
                  Delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
