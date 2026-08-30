import { useState } from "react"
import { useNavigate } from "react-router"
import { ArrowRightIcon, PlusIcon, SearchIcon } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import Layout from "@/components/app/Layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useProjects } from "@/app/projects/hooks/use-projects"

function formatProjectDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const {
    projects,
    filteredProjects,
    projectCounts,
    error,
    isLoading,
    isSaving,
    searchTerm,
    setSearchTerm,
    projectFilter,
    setProjectFilter,
    projectFilters,
    projectTitle,
    setProjectTitle,
    projectDescription,
    setProjectDescription,
    projectStatus,
    setProjectStatus,
    handleCreateProject,
  } = useProjects()

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Projects</h2>
            <p className="text-sm text-muted-foreground">
              Plan work, keep tasks moving, and open a project to manage its board.
            </p>
          </div>

          <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="size-4" />
                Create project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader className="pr-8">
                <DialogTitle className="text-lg leading-6">Create project</DialogTitle>
                <DialogDescription>
                  Start a new project and give it a status before you open the board.
                </DialogDescription>
              </DialogHeader>

              <form
                className="grid gap-3"
                onSubmit={async (event) => {
                  const created = await handleCreateProject(event)

                  if (created) {
                    setCreateProjectOpen(false)
                  }
                }}
              >
                <Input
                  id="project-title"
                  value={projectTitle}
                  onChange={(event) => setProjectTitle(event.target.value)}
                  placeholder="Project title"
                  aria-label="Project title"
                  disabled={isSaving}
                />

                <Textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(event) => setProjectDescription(event.target.value)}
                  placeholder="Description"
                  aria-label="Project description"
                  className="min-h-32 resize-y"
                  disabled={isSaving}
                />

                <Select
                  value={projectStatus}
                  onValueChange={(value) => setProjectStatus(value as typeof projectStatus)}
                  disabled={isSaving}
                >
                  <SelectTrigger id="project-status" className="w-full" aria-label="Project status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateProjectOpen(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving || !projectTitle.trim()}
                  >
                    Create project
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {isLoading && <p className="text-sm text-muted-foreground">Loading projects...</p>}

        <section className="space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="space-y-3">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search projects..."
                  className="pl-9"
                  disabled={isSaving}
                />
              </div>

              <Tabs value={projectFilter} onValueChange={(value) => setProjectFilter(value as typeof projectFilter)}>
                <TabsList className="w-full justify-start">
                  {projectFilters.map((filter) => (
                    <TabsTrigger key={filter.value} value={filter.value}>
                      {filter.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{projects.length} total</span>
            <span>-</span>
            <span>{projectCounts.active} active</span>
            <span>-</span>
            <span>{projectCounts.paused} paused</span>
            <span>-</span>
            <span>{projectCounts.done} done</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => {
              const taskCount = project.tasks.length
              const doneCount = project.tasks.filter((task) => task.status === "done").length
              const completion = taskCount === 0 ? 0 : Math.round((doneCount / taskCount) * 100)

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="w-full rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/30"
                  disabled={isSaving}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold">{project.title}</h3>
                        <Badge variant="outline">{project.status}</Badge>
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {project.description || "No description yet."}
                      </p>
                    </div>
                    <ArrowRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {taskCount} task{taskCount === 1 ? "" : "s"}
                    </span>
                    <span>{completion}% done</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge
                      className={
                        project.status === "done"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : project.status === "paused"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "border-primary/20 bg-primary/10 text-primary"
                      }
                    >
                      {project.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Updated {formatProjectDate(project.updatedAt)}
                    </span>
                  </div>
                </button>
              )
            })}

            {!isLoading && filteredProjects.length === 0 && (
              <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                No projects found.
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  )
}
