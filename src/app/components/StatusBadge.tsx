import { cn } from "./ui/utils";

interface StatusBadgeProps {
  status: "paid" | "partial" | "pending";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        status === "paid" && "bg-success/10 text-success",
        status === "partial" && "bg-warning/10 text-warning",
        status === "pending" && "bg-destructive/10 text-destructive",
        className
      )}
    >
      {status === "paid" && "Paid"}
      {status === "partial" && "Partial"}
      {status === "pending" && "Pending"}
    </span>
  );
}