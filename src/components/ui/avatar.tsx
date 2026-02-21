"use client"

import * as React from "react"

export const AvatarContext = React.createContext<{
  status: "loading" | "loaded" | "error"
  setStatus: React.Dispatch<React.SetStateAction<"loading" | "loaded" | "error">>
} | null>(null)

const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading")

  return (
    <AvatarContext.Provider value={{ status, setStatus }}>
      <span
        ref={ref}
        className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className || ""}`}
        {...props}
      />
    </AvatarContext.Provider>
  )
})
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, ...props }, ref) => {
  const ctx = React.useContext(AvatarContext)

  React.useEffect(() => {
    if (!ctx) return
    const { setStatus } = ctx

    if (!src) {
      setStatus("error")
      return
    }

    const img = new Image()
    img.src = src as string
    img.onload = () => setStatus("loaded")
    img.onerror = () => setStatus("error")

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, ctx])

  if (ctx && ctx.status === "error") {
    return null
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      className={`aspect-square h-full w-full ${className || ""}`}
      {...props}
      alt={props.alt || ""}
    />
  )
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const ctx = React.useContext(AvatarContext)

  if (ctx && ctx.status === "loaded") {
    return null
  }

  return (
    <span
      ref={ref}
      className={`flex h-full w-full items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 ${className || ""}`}
      {...props}
    />
  )
})
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }