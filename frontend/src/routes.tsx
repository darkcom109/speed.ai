// React Router
import { createBrowserRouter, Navigate } from "react-router"
import AppLayout from "./AppLayout"

import { redirectAuthenticatedUser } from "@/hooks/use-auth-redirect"

import {
  HomePage,
  LoginPage,
  SignupPage,
  DashboardPage,
  SettingsPage,
  PlanningPage,
  ExpensesPage,
  ForecastPage,
  SavingsPage,
  NotesPage,
  NoteEditorPage,
  ProjectsPage,
  ProjectDetailPage,
  ResearchPage,
  GithubPage,
  TransportPage,
  TransportStationsPage,
} from "@/app/index"

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: redirectAuthenticatedUser,
      },
      {
        path: "login",
        element: <LoginPage />,
        loader: redirectAuthenticatedUser,
      },
      {
        path: "signup",
        element: <SignupPage />,
        loader: redirectAuthenticatedUser,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "planning",
        element: <PlanningPage />,
      },
      {
        path: "tasks",
        element: <Navigate to="/planning" replace />,
      },
      {
        path: "calendar",
        element: <Navigate to="/planning" replace />,
      },
      {
        path: "expenses",
        element: <ExpensesPage />,
      },
      {
        path: "expenses/savings",
        element: <SavingsPage />,
      },
      {
        path: "expenses/forecast",
        element: <ForecastPage />,
      },
      {
        path: "notes/:noteId",
        element: <NoteEditorPage />,
      },
      {
        path: "notes",
        element: <NotesPage />,
      },
      {
        path: "projects",
        element: <ProjectsPage />,
      },
      {
        path: "projects/:projectId",
        element: <ProjectDetailPage />,
      },
      {
        path: "research",
        element: <ResearchPage />,
      },
      {
        path: "github",
        element: <GithubPage />,
      },
      {
        path: "transport",
        element: <TransportPage />,
      },
      {
        path: "transport/status",
        element: <TransportPage />,
      },
      {
        path: "transport/stations",
        element: <TransportStationsPage />,
      },
    ],
  },
])

export default router
