// React Router
import {
  createBrowserRouter
} from "react-router"

import {
  HomePage,
  LoginPage,
  SignupPage,
  DashboardPage,
  TasksPage,
  CalendarPage,
  NotesPage,
  NoteEditorPage,
  AssistantPage,
  GithubPage,
  TransportPage,
  TransportStationsPage,
} from "@/app/index"

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/signup",
    element: <SignupPage />
  },
  {
    path: "/dashboard",
    element: <DashboardPage />
  },
  {
    path: "/tasks",
    element: <TasksPage />
  },
  {
    path: "/calendar",
    element: <CalendarPage />
  },
  {
    path: "/notes/:noteId",
    element: <NoteEditorPage />
  },
  {
    path: "/notes",
    element: <NotesPage />
  },
  {
    path: "/assistant",
    element: <AssistantPage />
  },
  {
    path: "/github",
    element: <GithubPage />
  },
  {
    path: "/transport",
    element: <TransportPage />
  },
  {
    path: "/transport/status",
    element: <TransportPage />
  },
  {
    path: "/transport/stations",
    element: <TransportStationsPage />
  },
])

export default router
