import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { getDashboardSummary } from "@/app/dashboard/api/dashboard-summary-api"

import { getExpenses } from "@/app/expenses/api/expenses-api"
import type { Expense } from "@/app/expenses/types/expense"
import { getTasks } from "@/app/tasks/api/tasks-api"
import type { Task } from "@/app/tasks/types/task"

export default function useDashboard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [tasksError, setTasksError] = useState("")
    const [isTasksLoading, setIsTasksLoading] = useState(true)
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [expensesError, setExpensesError] = useState("")
    const [isExpensesLoading, setIsExpensesLoading] = useState(true)
    const [dashboardSummary, setDashboardSummary] = useState("")
    const [dashboardSummaryError, setDashboardSummaryError] = useState("")
    const [isDashboardSummaryLoading, setIsDashboardSummaryLoading] = useState(true)

    const navigate = useNavigate()

    async function loadTasks() {
        try {
        const tasks = await getTasks()

        setTasks(tasks)
        } catch {
        setTasksError("Unable to load tasks")
        } finally {
        setIsTasksLoading(false)
        }
    }

    async function loadExpenses() {
        try {
            const expenses = await getExpenses()

            setExpenses(expenses)
        } catch {
            setExpensesError("Unable to load finances")
        } finally {
            setIsExpensesLoading(false)
        }
    }

    async function loadDashboardSummary() {
        try {
        setDashboardSummaryError("")
        setIsDashboardSummaryLoading(true)

        const summary = await getDashboardSummary()

        setDashboardSummary(summary)
        } catch (error) {
        setDashboardSummaryError(
            error instanceof Error
            ? error.message
            : "Unable to load dashboard summary"
        )
        } finally {
        setIsDashboardSummaryLoading(false)
        }
    }

    useEffect(() => {
        async function checkAuth() {
        const response = await fetch("http://localhost:3001/api/auth/me", {
            credentials: "include",
        })

        if (!response.ok) {
            navigate("/login")
            return
        }

        loadTasks()
        loadExpenses()
        loadDashboardSummary()
        }

        checkAuth()
    }, [navigate])

    useEffect(() => {
        function handleTasksUpdated() {
        void loadTasks()
        void loadDashboardSummary()
        }

        function handleFinancesUpdated() {
        void loadExpenses()
        void loadDashboardSummary()
        }

        window.addEventListener("tasks-updated", handleTasksUpdated)
        window.addEventListener("finances-updated", handleFinancesUpdated)

        return () => {
        window.removeEventListener("tasks-updated", handleTasksUpdated)
        window.removeEventListener("finances-updated", handleFinancesUpdated)
        }
    }, [])

    return {
        tasks,
        tasksError,
        isTasksLoading,
        expenses,
        expensesError,
        isExpensesLoading,
        dashboardSummary,
        dashboardSummaryError,
        isDashboardSummaryLoading,
    }
}