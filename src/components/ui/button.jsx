import * as React from "react"

export const Button = React.forwardRef(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    let variantClass = "";
    switch (variant) {
      case "destructive":
        variantClass = "bg-red-600 hover:bg-red-700 text-white";
        break;
      case "outline":
        variantClass = "border border-gray-300 bg-white hover:bg-gray-100";
        break;
      default:
        variantClass = "bg-blue-600 hover:bg-blue-700 text-white";
    }
    let sizeClass = "";
    switch (size) {
      case "sm":
        sizeClass = "px-3 py-1 text-sm";
        break;
      case "lg":
        sizeClass = "px-6 py-3 text-lg";
        break;
      default:
        sizeClass = "px-4 py-2";
    }
    return (
      <button
        ref={ref}
        className={`rounded ${variantClass} ${sizeClass} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
