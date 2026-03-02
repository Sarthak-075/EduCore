import { cn } from "./ui/utils";

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "default" | "lg";
}

export function GradientButton({ 
  children, 
  className, 
  variant = "primary", 
  size = "default",
  ...props 
}: GradientButtonProps) {
  return (
    <button
      className={cn(
        "rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" && "bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg hover:shadow-xl",
        variant === "secondary" && "bg-card text-card-foreground border border-border hover:bg-accent",
        size === "default" && "px-6 py-3",
        size === "lg" && "px-8 py-4 text-lg",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}