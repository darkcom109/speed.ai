# speed.ai

speed.ai is a full-stack personal productivity workspace that combines task
management, finances, savings forecasts, notes, live transport information,
and a persistent AI assistant in one application.

## Features

- Email/password and Google authentication using secure cookies
- Dashboard with task, finance, savings, and AI-generated summaries
- Task management with due dates, completion tracking, notifications, and a
  calendar view
- Expense and income tracking with categories, filtering, editing, and
  pagination
- Savings accounts with targets and progress visualisation
- Financial forecasting using damped-trend exponential smoothing
- Rich-text notes with checklist support
- Persistent AI chat history and compacted conversation memory
- AI tools for reading, creating, and updating tasks and finances
- GitHub profile lookup
- Live TfL line status, station search, and arrival information
- Command palette and global assistant sidebar

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui and Radix UI
- Recharts
- TipTap
- Vitest and React Testing Library

### Backend

- Node.js
- Express 5
- Prisma ORM
- PostgreSQL
- JSON Web Tokens
- Argon2 and bcrypt
- Zod
- Google OAuth
- Ollama-compatible AI API

## Project Structure

```text
speed.ai/
|-- backend/
|   |-- prisma/                 # Schema, migrations, and Prisma client
|   |-- src/
|   |   |-- assistant/          # Prompts, memory, and assistant tools
|   |   |-- middleware/         # Authentication middleware
|   |   |-- routes/             # Feature-based Express routes
|   |   |-- schemas/            # Request validation schemas
|   |   `-- utils/              # Shared backend utilities
|   `-- server.js
|-- frontend/
|   |-- src/
|   |   |-- app/                # Feature pages, hooks, APIs, and components
|   |   |-- components/         # Shared application and UI components
|   |   |-- test/               # Shared Vitest setup
|   |   `-- routes.tsx
|   `-- vite.config.ts
`-- README.md
```

## Prerequisites

- Node.js 22
- npm
- PostgreSQL
- Google OAuth credentials for Google sign-in
- A TfL API key for transport features
- Access to an Ollama-compatible hosted API for AI features

The application can still be developed without every external integration, but
the related feature will not work until its environment variables are set.

## Installation

Clone the repository and install the frontend and backend dependencies:

```bash
git clone <repository-url>
cd speed.ai

cd backend
npm install

cd ../frontend
npm install
```

## Environment Variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="replace-with-a-long-random-secret"

GOOGLE_CLIENT_ID="your-google-client-id"

TFL_APP_KEY="your-tfl-api-key"
GITHUB_TOKEN="your-optional-github-token"

OLLAMA_URL="your-ollama-compatible-api-url"
OLLAMA_API_KEY="your-ollama-api-key"
OLLAMA_MODEL="your-model-name"
RESEARCH_FETCH_TIMEOUT_MS="12000"

PORT=3001
CORS_ORIGINS="http://localhost:5173"
```

Create `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID="your-google-client-id"
```

The frontend and backend Google client IDs must refer to the same OAuth
application.

## Database Setup

Run Prisma commands from the `backend` directory:

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

Optional database tools:

```bash
npx prisma studio
npx prisma migrate status
```

The forecast feature requires finance records for each of the previous three
complete months before it can produce a regression-based projection.

## Running Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Development URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Health check: `http://localhost:3001/api/health`

The current development configuration expects the frontend and backend to use
these ports.

## Production Deployment

### Deploy on Vercel

The root `vercel.json` deploys the frontend and backend together with Vercel
Services. Requests under `/api` go to Express, while all other requests go to
the Vite frontend. The frontend service also includes an SPA fallback so direct
links such as `/dashboard` and `/planning` work correctly.

1. Push the repository to GitHub.
2. Import the repository in Vercel and leave the Root Directory at the
   repository root.
3. Select the **Services** application preset. Vercel will detect the root
   `vercel.json`, the Vite frontend, and the Express backend.
4. Add these environment variables for Production and Preview deployments:

```env
DATABASE_URL="your-pooled-postgresql-connection-string"
JWT_SECRET="a-long-random-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
VITE_GOOGLE_CLIENT_ID="the-same-google-client-id"
TFL_APP_KEY="your-tfl-api-key"
OLLAMA_URL="your-public-ollama-compatible-api-url"
OLLAMA_API_KEY="your-ollama-api-key"
OLLAMA_MODEL="your-model-name"
GITHUB_TOKEN="your-optional-github-token"
RESEARCH_FETCH_TIMEOUT_MS="12000"
```

5. Create a PostgreSQL database using the Vercel Marketplace or another hosted
   provider. Use its pooled connection string for `DATABASE_URL`.
6. Apply the production migrations before opening the application:

```powershell
cd backend
$env:DATABASE_URL="your-production-connection-string"
npm run db:deploy
```

7. Add the Vercel production URL, such as `https://speed-ai.vercel.app`, to the
   Google OAuth client's authorized JavaScript origins.
8. Deploy the project. Trigger a new deployment after changing a build-time
   variable such as
   `VITE_GOOGLE_CLIENT_ID`.

The Ollama-compatible endpoint must be reachable from the public internet.
An endpoint hosted only on `localhost` will not be available to Vercel.

Vercel runs the Express backend as a managed service with function limits.
Long-running research requests must finish within the duration available on
the selected Vercel plan.

### Deploy on Render

The repository also retains a `render.yaml` Blueprint as an alternative. It
creates a Node.js web service and managed PostgreSQL database, serves the
compiled frontend through Express, runs Prisma migrations during startup, and
checks `/api/health`.

The included database plan is persistent and paid because free Render
PostgreSQL instances are temporary and do not include recovery. Review the
selected Render plans before applying the Blueprint if you want to adjust the
cost or capacity.

## Available Scripts

### Frontend

```bash
npm run dev        # Start the Vite development server
npm run build      # Type-check and create a production build
npm run lint       # Run ESLint
npm run format     # Format TypeScript and TSX files with Prettier
npm run typecheck  # Run TypeScript without emitting files
npm run test       # Run Vitest in watch mode
npm run test:run   # Run Vitest once
```

### Backend

```bash
npm run dev        # Start the backend with Nodemon
npm start          # Start the backend with Node.js
npm run lint       # Run ESLint
```

## Testing

Frontend tests use Vitest, jsdom, and React Testing Library.

Run all frontend tests:

```bash
cd frontend
npm run test:run
```

Run a specific feature:

```bash
npm run test:run -- src/app/transport
```

Backend automated tests have not yet been configured.

## Core API Areas

The Express application mounts feature routers under:

```text
/api/auth
/api/tasks
/api/notes
/api/notifications
/api/expenses
/api/savings
/api/assistant
/api/github
/api/tfl
/api/prediction
```

Protected routes use the authenticated user ID from the JWT cookie, ensuring
that user-owned tasks, notes, finances, savings, messages, and assistant memory
remain isolated.

## Current Status

This is an actively developed solo project. The main workflows are implemented,
while backend automated test coverage remains an area for further work.
