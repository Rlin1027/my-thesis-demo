import * as React from "react"

export const Card = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={
        "rounded-xl border bg-white text-black shadow " +
        (className || "")
      }
      {...props}
    />
  )
)
Card.displayName = "Card"

export const CardContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={"p-6 " + (className || "")}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"
