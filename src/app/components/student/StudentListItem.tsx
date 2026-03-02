import { Link } from "react-router";
import { StudentSummary } from "../../types";
import { StatusBadge } from "../StatusBadge";
import { formatCurrency } from "../../utils/helpers";
import { CheckCircle, Circle } from "lucide-react";

interface StudentListItemProps {
  student: StudentSummary;
}

export function StudentListItem({ student }: StudentListItemProps) {
  return (
    <Link
      to={`/students/${student.id}`}
      className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-blue-500 transition-colors"
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-semibold">
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
        <p className="text-sm text-muted-foreground">
          {formatCurrency(student.monthlyFee)}/month
        </p>
      </div>
      <StatusBadge status={student.status} />
    </Link>
  );
}
