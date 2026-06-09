import {
  ReceiptTextIcon,
  TrendingUpIcon,
  WalletCardsIcon,
} from "lucide-react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { type ExpenseCardsProps } from "../types/expense-cards"

export default function ExpenseCards({
    currencyFormatter,
    totalSpent,
    totalIncome,
    balance
} : ExpenseCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <WalletCardsIcon className="size-5" />
                </div>
                <div>
                  <CardTitle>{currencyFormatter.format(totalSpent)}</CardTitle>
                  <CardDescription>Total spent</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <TrendingUpIcon className="size-5" />
                </div>
                <div>
                  <CardTitle>{currencyFormatter.format(totalIncome)}</CardTitle>
                  <CardDescription>Income</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <ReceiptTextIcon className="size-5" />
                </div>
                <div>
                  <CardTitle>{currencyFormatter.format(balance)}</CardTitle>
                  <CardDescription>Saved</CardDescription>
                </div>
              </CardHeader>
            </Card>
        </div>
    )
}