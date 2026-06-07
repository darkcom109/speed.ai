const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
})

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function getExpenseDate(date: string) {
  return new Date(date)
}

export { currencyFormatter, dateFormatter, getExpenseDate }