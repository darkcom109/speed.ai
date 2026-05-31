export default function handleExportNote(title: string, content: string) {
  const printWindow = window.open("", "_blank")

  if (!printWindow) {
    return
  }

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 760px;
            margin: 40px auto;
            line-height: 1.6;
          }

          h1 {
            font-size: 32px;
          }

          h2 {
            font-size: 26px;
          }

          h3 {
            font-size: 22px;
          }

          h4 {
            font-size: 18px;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${content}
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}