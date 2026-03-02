import { PaymentHistory } from "../../types";
import { StatusBadge } from "../StatusBadge";
import { formatCurrency, calculateRemaining } from "../../utils/helpers";

interface PaymentHistoryCardProps {
  payment: PaymentHistory;
}

export function PaymentHistoryCard({ payment }: PaymentHistoryCardProps) {
  const remainingAmount = calculateRemaining(payment.expected, payment.paid);

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium">{payment.month}</p>
        <StatusBadge status={payment.status} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground">
            Expected: {formatCurrency(payment.expected)}
          </p>
          <p className="text-muted-foreground">Date: {payment.date}</p>
        </div>
        <div className="text-right">
          <p
            className={
              payment.status === "paid"
                ? "text-success font-semibold"
                : "text-foreground font-semibold"
            }
          >
            {formatCurrency(payment.paid)}
          </p>
          {payment.status === "partial" && (
            <p className="text-xs text-destructive">
              Due: {formatCurrency(remainingAmount)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
