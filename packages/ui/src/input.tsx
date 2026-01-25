import * as React from "react";

import { cn } from "./utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      className={cn(
        "flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 text-sm shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-gray-400 hover:border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50",
        className
      )}
      ref={ref}
      type={type}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
