// Helper function to clean assistant response
export function cleanJsonResponse(content) {
    return content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
}