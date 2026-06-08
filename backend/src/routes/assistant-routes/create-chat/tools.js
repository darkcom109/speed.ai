// Assistant related imports
import {
    createFinances,
    createTask,
    getTasks,
    getTasksToday,
    getExpenses,
    getIncomes,
    getSavings,
    updateFinances,
    updateTask,
} from "#assistant/assistant-tools/index.js"

// Available tools for AI assistant 
export const tools = {
    "getTasks": getTasks,
    "getTasksToday": getTasksToday,
    "createTask": createTask,
    "createFinances": createFinances,
    "getExpenses": getExpenses,
    "getIncomes": getIncomes,
    "getSavings":  getSavings,
    "updateTask": updateTask,
    "updateFinances": updateFinances,
}
