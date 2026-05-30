export default function handleExportNote(title: string, content: string) {
    const fileContent = `
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>${title}</title>
        </head>
        <body>
            ${content}
        </body>
        </html>`
    
    const blob = new Blob([fileContent], {
        type: "text/html",
    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `${title || "note"}.html`
    link.click()

    URL.revokeObjectURL(url)
}