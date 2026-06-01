// React Router
import {
  createBrowserRouter,
  Outlet,
} from "react-router"
import { GlobalAssistantSidebar } from "@/components/global-assistant-sidebar"

import {
  HomePage,
  LoginPage,
  SignupPage,
  DashboardPage,
  SettingsPage,
  TasksPage,
  CalendarPage,
  ExpensesPage,
  NotesPage,
  NoteEditorPage,
  GithubPage,
  TransportPage,
  TransportStationsPage,
} from "@/app/index"

function AppLayout() {
  return (
    <>
      <Outlet />
      <GlobalAssistantSidebar />
    </>
  )
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "login",
        element: <LoginPage />
      },
      {
        path: "signup",
        element: <SignupPage />
      },
      {
        path: "dashboard",
        element: <DashboardPage />
      },
      {
        path: "settings",
        element: <SettingsPage />
      },
      {
        path: "tasks",
        element: <TasksPage />
      },
      {
        path: "calendar",
        element: <CalendarPage />
      },
      {
        path: "expenses",
        element: <ExpensesPage />
      },
      {
        path: "notes/:noteId",
        element: <NoteEditorPage />
      },
      {
        path: "notes",
        element: <NotesPage />
      },
      {
        path: "github",
        element: <GithubPage />
      },
      {
        path: "transport",
        element: <TransportPage />
      },
      {
        path: "transport/status",
        element: <TransportPage />
      },
      {
        path: "transport/stations",
        element: <TransportStationsPage />
      },
    ]
  },
])

export default router
