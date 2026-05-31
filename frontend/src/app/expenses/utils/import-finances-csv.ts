import type { CreateExpensePayload } from "@/app/expenses/types/create-expense-payload"
import type { ExpenseKind } from "@/app/expenses/types/expense"

function parseCsvLine(line: string) {
  const values: string[] = []
  let currentValue = ""
  let isInsideQuotes = false

  for (let index = 0; index < line.length; index++) {
    const character = line[index]
    const nextCharacter = line[index + 1]

    if (character === '"' && nextCharacter === '"') {
      currentValue += '"'
      index++
      continue
    }

    if (character === '"') {
      isInsideQuotes = !isInsideQuotes
      continue
    }

    if (character === "," && !isInsideQuotes) {
      values.push(currentValue.trim())
      currentValue = ""
      continue
    }

    currentValue += character
  }

  values.push(currentValue.trim())

  return values
}

function normalizeHeader(header: string) {
  return header.replace(/^\uFEFF/, "").trim().toLowerCase()
}

function parseFinanceKind(value: string): ExpenseKind {
  const kind = value.trim().toLowerCase()

  if (kind === "expense" || kind === "income") {
    return kind
  }

  throw new Error(`Invalid finance type "${value}". Use expense or income.`)
}

function parseAmount(value: string) {
  const amount = Number(value.replace(/[£,]/g, ""))

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Invalid amount "${value}".`)
  }

  return amount
}

function parseDate(value: string) {
  const date = value.trim()

  if (!date) {
    return undefined
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return `${date}T12:00:00.000Z`
  }

  const britishDate = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)

  if (britishDate) {
    const [, day, month, year] = britishDate

    return `${year}-${month}-${day}T12:00:00.000Z`
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid date "${value}". Use YYYY-MM-DD.`)
  }

  return parsedDate.toISOString()
}

export async function parseFinancesCsv(file: File): Promise<CreateExpensePayload[]> {
  const text = await file.text()
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    throw new Error("CSV must include a header row and at least one finance entry.")
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader)
  const requiredHeaders = ["title", "amount", "type", "category", "date"]

  for (const header of requiredHeaders) {
    if (!headers.includes(header)) {
      throw new Error(`CSV is missing the "${header}" column.`)
    }
  }

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line)
    const row = Object.fromEntries(
      headers.map((header, headerIndex) => [header, values[headerIndex] || ""])
    )
    const title = row.title.trim()

    if (!title) {
      throw new Error(`Row ${index + 2} is missing a title.`)
    }

    return {
      title,
      amount: parseAmount(row.amount),
      kind: parseFinanceKind(row.type),
      category: row.category || undefined,
      spentAt: parseDate(row.date),
    }
  })
}
