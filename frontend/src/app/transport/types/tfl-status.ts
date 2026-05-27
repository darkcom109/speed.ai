export type TflLineStatus = {
  id: string
  name: string
  modeName: string
  status: string
  statusSeverity: number
  reason: string | null
}

export type TflStatusData = {
  lines: TflLineStatus[]
}
