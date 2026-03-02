import { DollarSign } from "lucide-react";
import { Activity } from "../../types";
import { formatCurrency } from "../../utils/helpers";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
        <DollarSign className="w-5 h-5 text-success" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{activity.student}</p>
        <p className="text-xs text-muted-foreground">{activity.date}</p>
      </div>
      <p className="font-semibold text-success">
        +{formatCurrency(activity.amount)}
      </p>
    </div>
  );
}
