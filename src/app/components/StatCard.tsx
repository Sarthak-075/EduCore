import { cn } from "./ui/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  gradient?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon, gradient, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl p-4 shadow-sm border border-border/50",
        gradient && "bg-gradient-to-br from-blue-500 to-teal-500 text-white border-none",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <p className={cn("text-sm", gradient ? "text-white/80" : "text-muted-foreground")}>
          {title}
        </p>
        {icon && <div className={cn(gradient ? "text-white/80" : "text-muted-foreground")}>{icon}</div>}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}