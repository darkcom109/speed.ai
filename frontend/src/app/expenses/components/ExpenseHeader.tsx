import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ExpenseHeader() {
    return (
        <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>
            Your latest finance records.
            </CardDescription>
        </CardHeader>
    )
}