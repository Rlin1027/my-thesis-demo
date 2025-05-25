import * as React from "react"

export const Input = React.forwardRef(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";
