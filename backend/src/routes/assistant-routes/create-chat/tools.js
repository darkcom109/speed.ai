// Assistant related imports
import {
    createFinances,
    createTask,
    getTasks,
    getTasksToday,
    getExpenses,
    getIncomes,
    getSavings,
} from "#assistant/assistant-tools/index.js"

// Available tools for AI assistant 
export const tools = {
    "getTasks": getTasks,
    "getTasksToday": getTasksToday,
    "createTask": createTask,
    "createFinances": createFinances,
    "getExpenses": getExpenses,
    "getIncomes": getIncomes,
    "getSavings":  getSavings
}