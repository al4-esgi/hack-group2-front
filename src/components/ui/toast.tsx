import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
        success: "border-green-500 bg-green-50 text-green-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ToastProps extends React.ComponentPropsWithoutRef<"div">, VariantProps<typeof toastVariants> {
  title: string
  description?: string
  action?: React.ReactNode
}

export function Toast({ title, description, action, variant, ...props }: ToastProps) {
  return (
    <div className={toastVariants({ variant })} {...props}>
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {action}
    </div>
  )
}

export interface ToastActionElementProps {
  altText: string
  children: React.ReactNode
}

export const ToastActionElement = ({ altText, children }: ToastActionElementProps) => {
  return (
    <button className="action-element" aria-label={altText}>
      {children}
    </button>
  )
}

export type ToasterToast = {
  id: string
  dismiss?: () => void
  update?: (props: Partial<ToasterToast>) => void
} & ToastProps

const ToasterContext = React.createContext<{
  toasts: ToasterToast[]
  addToast: (toast: Omit<ToasterToast, "id">) => void
  removeToast: (id: string) => void
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([])
  const toastIdRef = React.useRef(0)

  const addToast = React.useCallback((toast: Omit<ToasterToast, "id">) => {
    const id = String(toastIdRef.current++)
    const newToast: ToasterToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast]

    // Auto dismiss after 5 seconds
    if (toast.variant !== "destructive") {
      setTimeout(() => {
        removeToast(id)
      }, 5000)
    }

    return id
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToasterContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast portal */}
      {toasts.length > 0 && (
        <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
          {toasts.map((toast) => (
            <div key={toast.id} className="group relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all">
              <Toast
                {...toast}
                variant={toast.variant}
                className={cn(toast.className)}
              />
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </ToasterContext.Provider>
  )
}

export function clearToasts() {
  // Implement clear toasts logic if needed
}

export const useToast = () => {
  const context = React.useContext(ToasterContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }

  const toast = React.useCallback(
    ({ title, description, variant = "default", action }: Omit<ToasterToast, "id">) => {
      context.addToast({ title, description, variant, action })
    },
    [context]
  )

  return {
    toast,
    dismiss: context.removeToast,
    toasts: context.toasts,
  }
}
