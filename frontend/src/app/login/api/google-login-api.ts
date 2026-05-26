export async function loginWithGoogle(credential: string) {
    const response = await fetch("http://localhost:3001/api/auth/google", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            credential
        })
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || "Unable to sign in with Google")
    }

    return data
}