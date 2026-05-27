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
])

export default router
