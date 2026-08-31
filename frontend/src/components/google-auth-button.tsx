import { useEffect, useRef, useState } from "react"
import { GoogleLogin } from "@react-oauth/google"

type GoogleAuthButtonProps = {
  onSuccess: (credential?: string) => void
  onError: () => void
}

export default function GoogleAuthButton({
  onSuccess,
  onError,
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [buttonWidth, setButtonWidth] = useState(320)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const updateButtonWidth = () => {
      const availableWidth = Math.floor(container.getBoundingClientRect().width)

      if (availableWidth > 0) {
        setButtonWidth(Math.min(400, availableWidth))
      }
    }

    updateButtonWidth()

    if (typeof ResizeObserver === "undefined") {
      return
    }

    const resizeObserver = new ResizeObserver(updateButtonWidth)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="flex min-h-10 w-full items-center justify-center overflow-hidden"
    >
      <GoogleLogin
        width={String(buttonWidth)}
        size="large"
        shape="rectangular"
        logo_alignment="left"
        onSuccess={(credentialResponse) => onSuccess(credentialResponse.credential)}
        onError={onError}
      />
    </div>
  )
}
