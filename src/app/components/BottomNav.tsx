import { Link, useLocation } from "react-router";
import { Home, Users, BarChart3, User } from "lucide-react";
import { cn } from "./ui/utils";

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/students", icon: Users, label: "Students" },
    { path: "/summary", icon: BarChart3, label: "Summary" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/students" && location.pathname.startsWith("/students"));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center min-w-[60px] h-full transition-colors",
                isActive ? "text-blue-500" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-current")} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}