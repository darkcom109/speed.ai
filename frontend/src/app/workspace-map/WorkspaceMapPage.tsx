import { useEffect, useMemo, useRef, useState } from "react"
import type { PointerEvent, WheelEvent } from "react"
import {
  CircleDollarSignIcon,
  FileTextIcon,
  FolderIcon,
  ListChecksIcon,
  NetworkIcon,
  RotateCcwIcon,
  SearchIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"
import { Link } from "react-router"

import { getExpenses } from "@/app/expenses/api/expenses-api"
import type { Expense } from "@/app/expenses/types/expense"
import { getNotes } from "@/app/notes/api/notes-api"
import type { Note } from "@/app/notes/types/note"
import { getTasks } from "@/app/tasks/api/tasks-api"
import type { Task } from "@/app/tasks/types"
import Layout from "@/components/app/Layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type MapNodeKind = "hub" | "folder" | "note" | "task" | "finance"

type MapNode = {
  id: string
  kind: MapNodeKind
  label: string
  detail: string
  x: number
  y: number
  size: number
  href?: string
  meta?: string
  keywords: string[]
}

type MapEdge = {
  id: string
  from: string
  to: string
  strength: number
  reason: string
}

type NodePositions = Record<string, { x: number; y: number }>

type MapSection = {
  id: string
  label: string
  detail: string
  x: number
  y: number
  radius: number
  color: string
}

const stopWords = new Set([
  "about",
  "after",
  "again",
  "also",
  "and",
  "are",
  "because",
  "before",
  "but",
  "can",
  "for",
  "from",
  "have",
  "how",
  "into",
  "just",
  "like",
  "make",
  "need",
  "not",
  "note",
  "this",
  "that",
  "the",
  "then",
  "there",
  "they",
  "with",
  "your",
])

const nodeLabels: Record<MapNodeKind, string> = {
  hub: "Workspace",
  folder: "Folder",
  note: "Note",
  task: "Task",
  finance: "Finance",
}

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
})

const mapCenter = {
  x: 520,
  y: 340,
}

const workspaceSections: MapSection[] = [
  {
    id: "notes",
    label: "Notes",
    detail: "Folders and documents",
    x: 230,
    y: 300,
    radius: 210,
    color: "#34d399",
  },
  {
    id: "tasks",
    label: "Tasks",
    detail: "Open and completed work",
    x: 805,
    y: 300,
    radius: 215,
    color: "#f59e0b",
  },
  {
    id: "finance",
    label: "Finance",
    detail: "Categories and money movement",
    x: 520,
    y: 555,
    radius: 170,
    color: "#e11d48",
  },
]

const emptyNode: MapNode = {
  id: "empty",
  kind: "hub",
  label: "Workspace Map",
  detail: "No workspace items loaded yet.",
  x: mapCenter.x,
  y: mapCenter.y,
  size: 20,
  keywords: [],
}

const nodeColors: Record<MapNodeKind, { border: string; fill: string; text: string }> = {
  hub: {
    border: "hsl(var(--primary))",
    fill: "hsl(var(--primary))",
    text: "hsl(var(--foreground))",
  },
  folder: {
    border: "#38bdf8",
    fill: "#0f3444",
    text: "#e0f2fe",
  },
  note: {
    border: "#34d399",
    fill: "#123c31",
    text: "#dcfce7",
  },
  task: {
    border: "#f59e0b",
    fill: "#47300d",
    text: "#fef3c7",
  },
  finance: {
    border: "#e11d48",
    fill: "#4a1425",
    text: "#ffe4e6",
  },
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getNodeDimensions(node: MapNode) {
  const labelLength = Math.min(node.label.length, 14)
  const width = clamp(labelLength * 7 + 30, node.kind === "hub" ? 92 : 68, 116)

  return {
    width,
    height: node.kind === "hub" ? 38 : 28,
  }
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ")
}

function getKeywords(value: string, limit = 12) {
  const counts = new Map<string, number>()

  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1))

  return [...counts.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, limit)
    .map(([word]) => word)
}

function overlap(first: string[], second: string[]) {
  const secondSet = new Set(second)

  return first.filter((word) => secondSet.has(word))
}

function pointOnCluster(
  index: number,
  total: number,
  centerX: number,
  centerY: number,
  outerRadiusX: number,
  outerRadiusY: number,
  innerRadiusX: number,
  innerRadiusY: number,
  outerSlots = 8,
  offset = -Math.PI / 2
) {
  const useOuterRing = total <= outerSlots || index < outerSlots
  const ringIndex = useOuterRing ? index : index - outerSlots
  const ringTotal = useOuterRing ? Math.min(total, outerSlots) : total - outerSlots
  const angle =
    offset +
    (Math.PI * 2 * ringIndex) / Math.max(ringTotal, 1) +
    (useOuterRing ? 0 : Math.PI / Math.max(ringTotal, 1))

  return {
    x: centerX + Math.cos(angle) * (useOuterRing ? outerRadiusX : innerRadiusX),
    y: centerY + Math.sin(angle) * (useOuterRing ? outerRadiusY : innerRadiusY),
  }
}

function buildWorkspaceMap(notes: Note[], tasks: Task[], expenses: Expense[]) {
  const nodes: MapNode[] = []
  const edges: MapEdge[] = []
  const [notesSection, tasksSection, financeSection] = workspaceSections

  const visibleNotes = notes.slice(0, 12)
  const visibleTasks = tasks.slice(0, 14)
  const expenseTotals = expenses.reduce<Record<string, number>>((totals, expense) => {
    const multiplier = expense.kind === "income" ? 1 : -1
    totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount * multiplier

    return totals
  }, {})
  const financeCategories = Object.entries(expenseTotals)
    .sort((first, second) => Math.abs(second[1]) - Math.abs(first[1]))
    .slice(0, 8)

  const folders = [...new Set(visibleNotes.map((note) => note.folder || "General"))]

  folders.forEach((folder, index) => {
    const point = pointOnCluster(
      index,
      folders.length,
      notesSection.x,
      notesSection.y,
      92,
      54,
      46,
      30,
      6,
      -Math.PI / 2
    )
    const folderNodeId = `folder:${folder}`

    nodes.push({
      id: folderNodeId,
      kind: "folder",
      label: folder,
      detail: `${visibleNotes.filter((note) => note.folder === folder).length} notes`,
      x: point.x,
      y: point.y,
      size: 18,
      href: "/notes",
      keywords: getKeywords(folder),
    })
  })

  visibleNotes.forEach((note, index) => {
    const point = pointOnCluster(
      index,
      visibleNotes.length,
      notesSection.x,
      notesSection.y,
      185,
      132,
      100,
      72,
      7,
      -2.3
    )
    const noteNodeId = `note:${note.id}`
    const folderNodeId = `folder:${note.folder || "General"}`

    nodes.push({
      id: noteNodeId,
      kind: "note",
      label: note.title || "Untitled note",
      detail: stripHtml(note.content).slice(0, 150).trim() || "No note content yet.",
      x: point.x,
      y: point.y,
      size: 15,
      href: `/notes/${note.id}`,
      meta: note.folder || "General",
      keywords: getKeywords(`${note.title} ${stripHtml(note.content)} ${note.folder}`),
    })
    edges.push({
      id: `${folderNodeId}-${noteNodeId}`,
      from: folderNodeId,
      to: noteNodeId,
      strength: 1,
      reason: `Stored in ${note.folder || "General"}`,
    })
  })

  visibleTasks.forEach((task, index) => {
    const point = pointOnCluster(
      index,
      visibleTasks.length,
      tasksSection.x,
      tasksSection.y,
      220,
      150,
      125,
      82,
      8,
      -0.35
    )
    const taskNodeId = `task:${task.id}`

    nodes.push({
      id: taskNodeId,
      kind: "task",
      label: task.title,
      detail: task.description || (task.completed ? "Completed task" : "Open task"),
      x: point.x,
      y: point.y,
      size: task.completed ? 11 : 15,
      href: "/tasks",
      meta: task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-GB") : "No due date",
      keywords: getKeywords(`${task.title} ${task.description ?? ""}`),
    })
  })

  financeCategories.forEach(([category, total], index) => {
    const point = pointOnCluster(
      index,
      financeCategories.length,
      financeSection.x,
      financeSection.y,
      220,
      92,
      116,
      48,
      8,
      0.9
    )
    const financeNodeId = `finance:${category}`

    nodes.push({
      id: financeNodeId,
      kind: "finance",
      label: category,
      detail: `${currencyFormatter.format(total)} net movement`,
      x: point.x,
      y: point.y,
      size: 12 + Math.min(Math.abs(total) / 40, 12),
      href: "/expenses",
      meta: "Finance category",
      keywords: getKeywords(category),
    })
  })

  const noteNodes = nodes.filter((node) => node.kind === "note")
  const taskNodes = nodes.filter((node) => node.kind === "task")
  const financeNodes = nodes.filter((node) => node.kind === "finance")
  const folderNodes = nodes.filter((node) => node.kind === "folder")

  folderNodes.forEach((folderNode, index) => {
    const nextFolderNode = folderNodes[index + 1]

    if (!nextFolderNode) {
      return
    }

    edges.push({
      id: `${folderNode.id}-${nextFolderNode.id}`,
      from: folderNode.id,
      to: nextFolderNode.id,
      strength: 0.35,
      reason: "Neighboring note folders",
    })
  })

  taskNodes.forEach((taskNode, index) => {
    const nextTaskNode = taskNodes[index + 1]

    if (!nextTaskNode || index % 3 !== 0) {
      return
    }

    edges.push({
      id: `${taskNode.id}-${nextTaskNode.id}`,
      from: taskNode.id,
      to: nextTaskNode.id,
      strength: 0.35,
      reason: "Nearby task cluster",
    })
  })

  financeNodes.forEach((financeNode, index) => {
    const nextFinanceNode = financeNodes[index + 1]

    if (!nextFinanceNode) {
      return
    }

    edges.push({
      id: `${financeNode.id}-${nextFinanceNode.id}`,
      from: financeNode.id,
      to: nextFinanceNode.id,
      strength: 0.45,
      reason: "Finance category cluster",
    })
  })

  taskNodes.forEach((taskNode) => {
    const matches = noteNodes
      .map((noteNode) => ({
        noteNode,
        shared: overlap(taskNode.keywords, noteNode.keywords),
      }))
      .filter((match) => match.shared.length > 0)
      .sort((first, second) => second.shared.length - first.shared.length)
      .slice(0, 2)

    matches.forEach(({ noteNode, shared }) => {
      edges.push({
        id: `${taskNode.id}-${noteNode.id}`,
        from: taskNode.id,
        to: noteNode.id,
        strength: Math.min(1, 0.3 + shared.length * 0.25),
        reason: `Shared terms: ${shared.slice(0, 3).join(", ")}`,
      })
    })
  })

  financeNodes.forEach((financeNode) => {
    noteNodes
      .filter((noteNode) => overlap(financeNode.keywords, noteNode.keywords).length > 0)
      .slice(0, 2)
      .forEach((noteNode) => {
        edges.push({
          id: `${financeNode.id}-${noteNode.id}`,
          from: financeNode.id,
          to: noteNode.id,
          strength: 0.45,
          reason: "Finance category appears in note content",
        })
      })
  })

  return { sections: workspaceSections, nodes, edges }
}

export default function WorkspaceMapPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState("")
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [nodePositions, setNodePositions] = useState<NodePositions>({})
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null)
  const dragRef = useRef({
    pointerId: 0,
    startX: 0,
    startY: 0,
    viewportX: 0,
    viewportY: 0,
    didDrag: false,
  })
  const nodeDragRef = useRef({
    pointerId: 0,
    nodeId: "",
    offsetX: 0,
    offsetY: 0,
    didDrag: false,
  })

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const [loadedNotes, loadedTasks, loadedExpenses] = await Promise.all([
          getNotes(),
          getTasks(),
          getExpenses(),
        ])

        setNotes(loadedNotes)
        setTasks(loadedTasks)
        setExpenses(loadedExpenses)
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unable to load workspace map"
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadWorkspace()
  }, [])

  const map = useMemo(
    () => buildWorkspaceMap(notes, tasks, expenses),
    [expenses, notes, tasks]
  )
  const positionedNodes = useMemo(
    () =>
      map.nodes.map((node) => ({
        ...node,
        x: nodePositions[node.id]?.x ?? node.x,
        y: nodePositions[node.id]?.y ?? node.y,
      })),
    [map.nodes, nodePositions]
  )

  const selectedNode =
    positionedNodes.find((node) => node.id === selectedNodeId) ??
    positionedNodes[0] ??
    emptyNode
  const connectedEdges = map.edges.filter(
    (edge) => edge.from === selectedNode.id || edge.to === selectedNode.id
  )
  const connectedNodeIds = new Set(
    connectedEdges.flatMap((edge) => [edge.from, edge.to])
  )
  const filteredNodes = query.trim()
    ? positionedNodes.filter((node) =>
        `${node.label} ${node.detail} ${node.meta ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : []

  useEffect(() => {
    setNodePositions((currentPositions) => {
      const nextPositions: NodePositions = {}

      map.nodes.forEach((node) => {
        nextPositions[node.id] = currentPositions[node.id] ?? {
          x: node.x,
          y: node.y,
        }
      })

      return nextPositions
    })
  }, [map.nodes])

  function getNode(id: string) {
    return positionedNodes.find((node) => node.id === id)
  }

  function getSvgPoint(
    event: PointerEvent<SVGSVGElement> | WheelEvent<SVGSVGElement>
  ) {
    const rect = event.currentTarget.getBoundingClientRect()

    return {
      x: ((event.clientX - rect.left) / rect.width) * 1040,
      y: ((event.clientY - rect.top) / rect.height) * 680,
    }
  }

  function getSvgPointFromElement(
    event: PointerEvent<SVGGElement>,
    svgElement: SVGSVGElement
  ) {
    const rect = svgElement.getBoundingClientRect()

    return {
      x: ((event.clientX - rect.left) / rect.width) * 1040,
      y: ((event.clientY - rect.top) / rect.height) * 680,
    }
  }

  function getGraphPoint(event: PointerEvent<SVGGElement>) {
    const svgElement = event.currentTarget.ownerSVGElement

    if (!svgElement) {
      return { x: 0, y: 0 }
    }

    const point = getSvgPointFromElement(event, svgElement)

    return {
      x: (point.x - viewport.x) / viewport.scale,
      y: (point.y - viewport.y) / viewport.scale,
    }
  }

  function zoomMap(nextScale: number, origin = mapCenter) {
    setViewport((current) => {
      const scale = clamp(nextScale, 0.6, 2.4)
      const ratio = scale / current.scale

      return {
        scale,
        x: origin.x - (origin.x - current.x) * ratio,
        y: origin.y - (origin.y - current.y) * ratio,
      }
    })
  }

  function focusNode(nodeId: string) {
    const node = getNode(nodeId)

    setSelectedNodeId(nodeId)

    if (!node) {
      return
    }

    setViewport((current) => ({
      ...current,
      x: mapCenter.x - node.x * current.scale,
      y: mapCenter.y - node.y * current.scale,
    }))
  }

  function resetMapView() {
    setSelectedNodeId("")
    setViewport({ x: 0, y: 0, scale: 1 })
    setNodePositions(
      map.nodes.reduce<NodePositions>((positions, node) => {
        positions[node.id] = { x: node.x, y: node.y }

        return positions
      }, {})
    )
  }

  function handleGraphPointerDown(event: PointerEvent<SVGSVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      viewportX: viewport.x,
      viewportY: viewport.y,
      didDrag: false,
    }
    setIsDragging(true)
  }

  function handleGraphPointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!isDragging || dragRef.current.pointerId !== event.pointerId) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const deltaX = ((event.clientX - dragRef.current.startX) / rect.width) * 1040
    const deltaY = ((event.clientY - dragRef.current.startY) / rect.height) * 680

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      dragRef.current.didDrag = true
    }

    setViewport((current) => ({
      ...current,
      x: dragRef.current.viewportX + deltaX,
      y: dragRef.current.viewportY + deltaY,
    }))
  }

  function handleGraphPointerUp(event: PointerEvent<SVGSVGElement>) {
    if (dragRef.current.pointerId === event.pointerId) {
      setIsDragging(false)
    }
  }

  function handleGraphWheel(event: WheelEvent<SVGSVGElement>) {
    event.preventDefault()

    const point = getSvgPoint(event)
    const direction = event.deltaY > 0 ? 0.9 : 1.1

    zoomMap(viewport.scale * direction, point)
  }

  function handleNodePointerDown(
    event: PointerEvent<SVGGElement>,
    node: MapNode
  ) {
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)

    const point = getGraphPoint(event)

    nodeDragRef.current = {
      pointerId: event.pointerId,
      nodeId: node.id,
      offsetX: point.x - node.x,
      offsetY: point.y - node.y,
      didDrag: false,
    }
    setDraggedNodeId(node.id)
    setSelectedNodeId(node.id)
  }

  function handleNodePointerMove(event: PointerEvent<SVGGElement>) {
    if (
      draggedNodeId === null ||
      nodeDragRef.current.pointerId !== event.pointerId
    ) {
      return
    }

    event.stopPropagation()

    const point = getGraphPoint(event)
    const nextX = clamp(point.x - nodeDragRef.current.offsetX, 44, 996)
    const nextY = clamp(point.y - nodeDragRef.current.offsetY, 28, 652)

    nodeDragRef.current.didDrag = true

    setNodePositions((currentPositions) => ({
      ...currentPositions,
      [nodeDragRef.current.nodeId]: {
        x: nextX,
        y: nextY,
      },
    }))
  }

  function handleNodePointerUp(event: PointerEvent<SVGGElement>) {
    if (nodeDragRef.current.pointerId === event.pointerId) {
      event.stopPropagation()
      setDraggedNodeId(null)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <NetworkIcon className="size-5" />
              Workspace Map
            </h2>
            <p className="text-sm text-muted-foreground">
              Explore how your notes, tasks, and finances connect.
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find nodes..."
              className="pl-8"
            />
          </div>
        </div>

        <div className="grid min-h-[42rem] gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <Card className="min-h-[42rem] rounded-lg">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle>Connection Graph</CardTitle>
                  <CardDescription>
                    Hold a node to move it. Drag empty space to pan the board.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Zoom out"
                    title="Zoom out"
                    onClick={() => zoomMap(viewport.scale * 0.85)}
                  >
                    <ZoomOutIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Zoom in"
                    title="Zoom in"
                    onClick={() => zoomMap(viewport.scale * 1.15)}
                  >
                    <ZoomInIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Reset map view"
                    title="Reset view"
                    onClick={resetMapView}
                  >
                    <RotateCcwIcon />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="min-h-0 flex-1">
              {isLoading && (
                <div className="flex h-[34rem] items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
                  Building workspace map...
                </div>
              )}

              {!isLoading && error && (
                <div className="flex h-[34rem] items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive">
                  {error}
                </div>
              )}

              {!isLoading && !error && (
                <div className="h-[34rem] overflow-hidden rounded-lg border bg-background">
                  <style>
                    {`
                      @keyframes workspace-map-dash {
                        to {
                          stroke-dashoffset: -28;
                        }
                      }
                    `}
                  </style>
                  <svg
                    viewBox="0 0 1040 680"
                    role="img"
                    aria-label="Workspace relationship map"
                    onPointerDown={handleGraphPointerDown}
                    onPointerMove={handleGraphPointerMove}
                    onPointerUp={handleGraphPointerUp}
                    onPointerCancel={handleGraphPointerUp}
                    onWheel={handleGraphWheel}
                    className={cn(
                      "h-full w-full touch-none select-none",
                      isDragging ? "cursor-grabbing" : "cursor-grab"
                    )}
                  >
                    <defs>
                      <radialGradient id="workspace-map-bg" cx="50%" cy="45%">
                        <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0" />
                      </radialGradient>
                      <pattern
                        id="workspace-map-grid"
                        width="48"
                        height="48"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 48 0 L 0 0 0 48"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.7"
                          className="text-border"
                          opacity="0.22"
                        />
                      </pattern>
                      <filter id="workspace-map-soft-glow" x="-60%" y="-60%" width="220%" height="220%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feColorMatrix
                          in="blur"
                          type="matrix"
                          values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.45 0"
                          result="glow"
                        />
                        <feMerge>
                          <feMergeNode in="glow" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <linearGradient id="node-hub" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.58" />
                      </linearGradient>
                      <linearGradient id="node-folder" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#0369a1" />
                      </linearGradient>
                      <linearGradient id="node-note" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#047857" />
                      </linearGradient>
                      <linearGradient id="node-task" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                      <linearGradient id="node-finance" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fb7185" />
                        <stop offset="100%" stopColor="#be123c" />
                      </linearGradient>
                    </defs>
                    <rect width="1040" height="680" fill="url(#workspace-map-bg)" />
                    <rect width="1040" height="680" fill="url(#workspace-map-grid)" />

                    <g
                      transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`}
                      style={{
                        transition: isDragging
                          ? "none"
                          : "transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                        transformOrigin: "center",
                      }}
                    >
                      {map.sections.map((section) => (
                        <g key={section.id}>
                          <text
                            x={section.x}
                            y={section.y - 150}
                            textAnchor="middle"
                            paintOrder="stroke"
                            stroke="hsl(var(--background))"
                            strokeWidth="5"
                            strokeLinejoin="round"
                            fill={section.color}
                            className="text-[18px] font-semibold"
                          >
                            {section.label}
                          </text>
                          <text
                            x={section.x}
                            y={section.y - 128}
                            textAnchor="middle"
                            paintOrder="stroke"
                            stroke="hsl(var(--background))"
                            strokeWidth="4"
                            strokeLinejoin="round"
                            className="fill-muted-foreground text-[12px]"
                          >
                            {section.detail}
                          </text>
                        </g>
                      ))}

                      {map.edges.map((edge) => {
                        const from = getNode(edge.from)
                        const to = getNode(edge.to)

                        if (!from || !to) {
                          return null
                        }

                        const isConnected =
                          edge.from === selectedNode.id || edge.to === selectedNode.id
                        const midX = (from.x + to.x) / 2
                        const midY = (from.y + to.y) / 2
                        const curve = Math.min(
                          28,
                          Math.hypot(to.x - from.x, to.y - from.y) / 12
                        )
                        const path = `M ${from.x} ${from.y} Q ${midX} ${midY - curve} ${to.x} ${to.y}`

                        return (
                          <path
                            key={edge.id}
                            d={path}
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth={isConnected ? 2.7 : 1.1 + edge.strength}
                            strokeDasharray={isConnected ? "7 7" : undefined}
                            className={cn(
                              "text-border transition-opacity duration-300",
                              isConnected ? "opacity-90" : "opacity-35"
                            )}
                            style={{
                              animation: isConnected
                                ? "workspace-map-dash 1.8s linear infinite"
                                : undefined,
                            }}
                          />
                        )
                      })}

                      {positionedNodes.map((node) => {
                        const isSelected = node.id === selectedNode.id
                        const isConnected =
                          connectedNodeIds.has(node.id) || selectedNode.id === node.id
                        const isDimmed = Boolean(selectedNodeId) && !isConnected
                        const colors = nodeColors[node.kind]
                        const dimensions = getNodeDimensions(node)
                        const isNodeDragging = draggedNodeId === node.id

                        return (
                          <g
                            key={node.id}
                            role="button"
                            tabIndex={0}
                            transform={`translate(${node.x} ${node.y})`}
                            onPointerDown={(event) =>
                              handleNodePointerDown(event, node)
                            }
                            onPointerMove={handleNodePointerMove}
                            onPointerUp={handleNodePointerUp}
                            onPointerCancel={handleNodePointerUp}
                            onClick={(event) => {
                              if (
                                dragRef.current.didDrag ||
                                nodeDragRef.current.didDrag
                              ) {
                                event.preventDefault()
                                dragRef.current.didDrag = false
                                nodeDragRef.current.didDrag = false
                                return
                              }

                              setSelectedNodeId(node.id)
                            }}
                            onDoubleClick={() => focusNode(node.id)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                focusNode(node.id)
                              }
                            }}
                            className={cn(
                              "outline-none transition-opacity duration-300",
                              isNodeDragging ? "cursor-grabbing" : "cursor-grab",
                              isDimmed && "opacity-25"
                            )}
                          >
                            <rect
                              x={-dimensions.width / 2}
                              y={-dimensions.height / 2}
                              width={dimensions.width}
                              height={dimensions.height}
                              rx={dimensions.height / 2}
                              fill={colors.border}
                              opacity={isSelected ? 0.22 : 0}
                            />
                            <rect
                              x={-dimensions.width / 2}
                              y={-dimensions.height / 2}
                              width={dimensions.width}
                              height={dimensions.height}
                              rx={dimensions.height / 2}
                              fill={colors.fill}
                              stroke={colors.border}
                              strokeWidth={isSelected ? 2.5 : 1.5}
                              opacity="1"
                            />
                            <rect
                              x={-dimensions.width / 2 + 10}
                              y={-dimensions.height / 2 + 6}
                              width={Math.max(18, dimensions.width * 0.26)}
                              height={4}
                              rx={2}
                              fill="white"
                              opacity="0.18"
                            />
                            <text
                              x="0"
                              y="4"
                              textAnchor="middle"
                              paintOrder="stroke"
                              stroke="hsl(var(--background))"
                              strokeWidth="3"
                              strokeLinejoin="round"
                              className="pointer-events-none text-[13px] font-semibold"
                              fill={colors.text}
                            >
                              {node.label.length > 14
                                ? `${node.label.slice(0, 14)}...`
                                : node.label}
                            </text>
                          </g>
                        )
                      })}
                    </g>
                  </svg>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="rounded-lg">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{selectedNode.label}</CardTitle>
                    <CardDescription>{selectedNode.detail}</CardDescription>
                  </div>
                  <Badge variant="outline">{nodeLabels[selectedNode.kind]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedNode.meta && (
                  <p className="text-sm text-muted-foreground">
                    {selectedNode.meta}
                  </p>
                )}

                {selectedNode.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.keywords.slice(0, 8).map((keyword) => (
                      <Badge key={keyword} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}

                {selectedNode.href && (
                  <Button asChild variant="outline" className="w-full">
                    <Link to={selectedNode.href}>Open source</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Connected Items</CardTitle>
                <CardDescription>
                  Why this node is linked to nearby workspace data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {connectedEdges.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No connections found yet.
                  </p>
                )}

                <div className="space-y-3">
                  {connectedEdges.slice(0, 8).map((edge) => {
                    const otherNode = getNode(
                      edge.from === selectedNode.id ? edge.to : edge.from
                    )

                    if (!otherNode) {
                      return null
                    }

                    return (
                      <button
                        key={edge.id}
                        type="button"
                        onClick={() => setSelectedNodeId(otherNode.id)}
                        className="flex w-full items-start gap-3 rounded-lg border bg-background p-3 text-left transition-colors hover:bg-muted/50"
                      >
                        <NodeIcon kind={otherNode.kind} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {otherNode.label}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {edge.reason}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {filteredNodes.length > 0 && (
              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filteredNodes.slice(0, 6).map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
                    >
                      <NodeIcon kind={node.kind} />
                      <span className="truncate">{node.label}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function NodeIcon({ kind }: { kind: MapNodeKind }) {
  const className = "size-4 shrink-0 text-muted-foreground"

  if (kind === "folder") {
    return <FolderIcon className={className} />
  }

  if (kind === "note") {
    return <FileTextIcon className={className} />
  }

  if (kind === "task") {
    return <ListChecksIcon className={className} />
  }

  if (kind === "finance") {
    return <CircleDollarSignIcon className={className} />
  }

  return <NetworkIcon className={className} />
}
