import { type Expense } from "../types/expense"
import React from "react"

export type RenderPaginationProps = {
    firstVisibleEntry: number
    lastVisibleEntry: number
    filteredExpenses: Expense[]
    currentPage: number
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>
    pageCount: number
}