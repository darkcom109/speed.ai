import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SavingAccountFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactNode
  title: string
  description: string
  submitLabel: string
  name: string
  currentAmount: string
  targetAmount: string
  setName: Dispatch<SetStateAction<string>>
  setCurrentAmount: Dispatch<SetStateAction<string>>
  setTargetAmount: Dispatch<SetStateAction<string>>
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onCancel: () => void
  error?: string
  isSubmitting?: boolean
}

export default function SavingAccountFormDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  submitLabel,
  name,
  currentAmount,
  targetAmount,
  setName,
  setCurrentAmount,
  setTargetAmount,
  onSubmit,
  onCancel,
  error,
  isSubmitting = false,
}: SavingAccountFormDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 grid w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <div>
            <DialogPrimitive.Title className="font-heading text-base font-medium">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          </div>

          <form onSubmit={onSubmit} className="grid gap-3">
            <div className="space-y-2">
              <Label htmlFor="saving-account-name">Name</Label>
              <Input
                id="saving-account-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Emergency fund"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="saving-account-current">Current amount</Label>
              <Input
                id="saving-account-current"
                type="number"
                min="0"
                step="0.01"
                value={currentAmount}
                onChange={(event) => setCurrentAmount(event.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="saving-account-target">Target amount</Label>
              <Input
                id="saving-account-target"
                type="number"
                min="0"
                step="0.01"
                value={targetAmount}
                onChange={(event) => setTargetAmount(event.target.value)}
                placeholder="1000"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving" : submitLabel}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
