import { Link } from "react-router";
import { Student } from "../../types";
import { StatusBadge } from "../StatusBadge";
import { formatCurrency } from "../../utils/helpers";
import { CheckCircle, Circle } from "lucide-react";

interface StudentCardProps {
  student: Student;
}

export function StudentCard({ student }: StudentCardProps) {
  return (
    <Link
      to={`/students/${student.id}`}
      className="block p-4 bg-card rounded-xl border border-border hover:border-blue-500 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {student.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{student.name}</p>
            <div title={student.isActive ? "Active" : "Inactive"}>
              {student.isActive ? (
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {student.parentName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">
              {formatCurrency(student.monthlyFee)}/mo
            </p>
            <span className="text-xs text-muted-foreground">•</span>
            <p className="text-xs text-muted-foreground">
              Due: {student.dueDay}th
            </p>
          </div>
        </div>
        <StatusBadge status={student.status} />
      </div>
    </Link>
  );
}
