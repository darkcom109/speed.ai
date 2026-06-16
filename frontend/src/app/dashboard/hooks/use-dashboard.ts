import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { getDashboardSummary } from "@/app/dashboard/api/dashboard-summary-api"

import { getExpenses } from "@/app/expenses/api/expenses-api"
import type { Expense } from "@/app/expenses/types/expense"
import { getTasks } from "@/app/tasks/api/tasks-api"
import type { Task } from "@/app/tasks/types/task"
import { apiClient } from "@/lib/api-client"
import axios from "axios"

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
            try {
                await apiClient.get("/auth/me")

                loadTasks()
                loadExpenses()
                loadDashboardSummary()
            } 
            catch(error) {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    navigate("/login")
                    return
                }
            }
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