import { TrendingUp } from "lucide-react";
import { MonthlyProgress as MonthlyProgressType } from "../../types";
import { Progress } from "../ui/progress";
import { formatCurrency } from "../../utils/helpers";

interface MonthlyProgressCardProps {
  progress: MonthlyProgressType;
}

export function MonthlyProgressCard({ progress }: MonthlyProgressCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Monthly Progress</h3>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold">
              {formatCurrency(progress.collected)}
            </span>
            <span className="text-white/80">
              / {formatCurrency(progress.target)}
            </span>
          </div>
          <p className="text-white/80 text-sm">Collected this month</p>
        </div>
        <div className="space-y-2">
          <Progress
            value={progress.percentage}
            className="h-3 bg-white/20"
            indicatorClassName="bg-gradient-to-r from-white to-white/80"
          />
          <p className="text-sm text-white/90">
            {progress.percentage}% of target achieved
          </p>
        </div>
      </div>
    </div>
  );
}
