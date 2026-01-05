import { Toaster as Sonner, toast } from "sonner"
import { useMemo } from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

// Constants cho configuration để dễ bảo trì
const TOAST_BASE_CLASSES = "toaster group"
const DEFAULT_THEME = "dark" as const

const TOAST_CLASS_NAMES = {
  toast:
    "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
  description: "group-[.toast]:text-muted-foreground",
  actionButton:
    "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
  cancelButton:
    "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
} as const

/**
 * Toaster component với theme support
 * Sử dụng theme cố định để tránh lỗi build trên Netlify
 * 
 * Note: Có thể cải thiện sau để sync với ThemeProvider
 */
const Toaster = (props: ToasterProps) => {
  // Memoize toast options để tránh unnecessary re-creation
  const toastOptions = useMemo(() => ({
    classNames: TOAST_CLASS_NAMES,
  }), [])

  return (
    <Sonner
      theme={DEFAULT_THEME}
      className={TOAST_BASE_CLASSES}
      toastOptions={toastOptions}
      {...props}
    />
  )
}

export { Toaster, toast }