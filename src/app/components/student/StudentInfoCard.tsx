import { User, Mail, Phone } from "lucide-react";
import { Student } from "../../types";
import { formatCurrency, formatPhoneNumber } from "../../utils/helpers";

interface StudentInfoCardProps {
  student: Student;
}

export function StudentInfoCard({ student }: StudentInfoCardProps) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border space-y-4">
      <h3 className="font-semibold text-lg">Fee Overview</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Monthly Fee</p>
          <p className="text-xl font-semibold">{formatCurrency(student.monthlyFee)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Outstanding</p>
          <p className="text-xl font-semibold text-destructive">
            {formatCurrency(2000)}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">Parent:</span>
          <span className="font-medium">{student.parentName || ''}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">Phone:</span>
          <a
            href={`tel:${student.parentPhone || ''}`}
            className="font-medium text-blue-500 hover:underline"
          >
            {formatPhoneNumber(student.parentPhone || '')}
          </a>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">Email:</span>
          <a
            href={`mailto:${student.parentEmail || ''}`}
            className="font-medium text-blue-500 hover:underline truncate"
          >
            {student.parentEmail || ''}
          </a>
        </div>
      </div>
    </div>
  );
}
