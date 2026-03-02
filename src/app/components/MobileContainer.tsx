import { cn } from "./ui/utils";

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  withBottomNav?: boolean;
}

export function MobileContainer({ children, className, withBottomNav }: MobileContainerProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className={cn(
        "w-full max-w-md bg-background min-h-screen relative overflow-hidden",
        withBottomNav && "pb-16",
        className
      )}>
        {children}
      </div>
    </div>
  );
}