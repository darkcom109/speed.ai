import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import FinanceSnapshotCard from "@/app/dashboard/components/FinanceSnapshotCard"
import type { Expense } from "@/app/expenses/types/expense"

function createExpense(overrides: Partial<Expense>): Expense {
  return {
    id: "expense-1",
    title: "Finance",
    amount: 0,
    kind: "expense",
    category: "General",
    spentAt: "2026-06-19T10:00:00.000Z",
    createdAt: "2026-06-19T10:00:00.000Z",
    updatedAt: "2026-06-19T10:00:00.000Z",
    userId: "user-1",
    ...overrides,
  }
}

describe("FinanceSnapshotCard", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 19, 12))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("calculates this month's balance and top spending category", () => {
    render(
      <FinanceSnapshotCard
        expenses={[
          createExpense({ id: "income", amount: 1000, kind: "income" }),
          createExpense({ id: "food", amount: 300, category: "Food" }),
          createExpense({ id: "travel", amount: 100, category: "Travel" }),
          createExpense({
            id: "old",
            amount: 900,
            spentAt: "2026-05-19T10:00:00.000Z",
          }),
        ]}
        error=""
        isLoading={false}
      />
    )

    expect(screen.getByText("£600")).toBeInTheDocument()
    expect(screen.getByText("£1,000")).toBeInTheDocument()
    expect(screen.getByText("£400")).toBeInTheDocument()
    expect(screen.getByText("Food")).toBeInTheDocument()
  })
})
