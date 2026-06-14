import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import AppearanceOptions from "@/app/settings/components/AppearanceOptions"

describe("AppearanceOptions", () => {
  it("changes the selected theme", () => {
    const setTheme = vi.fn()

    render(<AppearanceOptions theme="system" setTheme={setTheme} />)

    fireEvent.click(screen.getByRole("button", { name: "Dark" }))

    expect(setTheme).toHaveBeenCalledWith("dark")
  })
})
