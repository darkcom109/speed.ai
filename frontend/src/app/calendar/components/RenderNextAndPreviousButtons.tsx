import { Button } from "@/components/ui/button"

export type RenderNextAndPreviousButtonsProps = {
  goToPreviousMonth: () => void
  currentMonthLabel: string
  goToNextMonth: () => void
}

export default function RenderNextAndPreviousButtons({
    goToPreviousMonth,
    currentMonthLabel,
    goToNextMonth,
} : RenderNextAndPreviousButtonsProps) {
    return (
        <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="outline" onClick={goToPreviousMonth}>
                Previous
            </Button>

            <h3 className="text-base font-semibold">{currentMonthLabel}</h3>

            <Button type="button" variant="outline" onClick={goToNextMonth}>
                Next
            </Button>
        </div>
    )
}