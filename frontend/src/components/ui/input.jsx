import * as React from "react"

import { cn } from "@/lib/utils"
function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // base
        "w-full rounded-md border px-3 py-2 text-sm outline-none transition-all duration-200",

        // dark base
        "bg-neutral-900 border-neutral-700 text-white placeholder:text-gray-500",

        // aesthetic blue focus ✨
        "focus-visible:border-blue-400/80",
        "focus-visible:ring-2 focus-visible:ring-blue-400/20",
        "focus-visible:ring-offset-0",

        // smoothness
        "focus-visible:shadow-[0_0_0_1px_rgba(96,165,250,0.15)]",

        // disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",

        className
      )}
      {...props}
    />
  )
}


export { Input }
