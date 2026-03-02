import { useState } from "react";
import React from "react";
import { ArrowLeft, DollarSign, Edit } from "lucide-react";
import { MobileContainer } from "../components/MobileContainer";
import { StatusBadge } from "../components/StatusBadge";
import { GradientButton } from "../components/GradientButton";
import { StudentInfoCard } from "../components/student/StudentInfoCard";
import { PaymentHistoryCard } from "../components/payment/PaymentHistoryCard";
import { useNavigate, useParams, Link } from "react-router";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { useGetStudentsQuery, useAddPaymentMutation } from "../api/students";
import { PAYMENT_HISTORY, MONTHS, YEARS } from "../constants/payments";
import { PaymentFormData } from "../types";
import { getCurrentDate, formatCurrency } from "../utils/helpers";

export function StudentProfileScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    amount: "",
    date: getCurrentDate(),
  });

  const { data: students = [], isLoading } = useGetStudentsQuery();
  const [addPayment, { isLoading: isPaymentLoading }] = useAddPaymentMutation();
  const student = React.useMemo(() => students.find((s) => s.id === id), [students, id]);

  if (isLoading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </MobileContainer>
    );
  }

  if (!student) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Student not found</p>
        </div>
      </MobileContainer>
    );
  }

  const handleRecordPayment = async () => {
    if (!paymentData.amount) {
      toast.error("Please enter payment amount");
      return;
    }
    if (!student) {
      toast.error("Student not found");
      return;
    }
    try {
      const monthNum = parseInt(paymentData.month) || (new Date().getMonth() + 1);
      const yearNum = parseInt(paymentData.year) || new Date().getFullYear();
      await addPayment({
        id: student.id,
        month: monthNum,
        year: yearNum,
        amountPaid: parseFloat(paymentData.amount),
        dateReceived: paymentData.date,
      }).unwrap();
      toast.success("Payment recorded successfully");
      setIsPaymentSheetOpen(false);
      setPaymentData({
        month: String(new Date().getMonth() + 1),
        year: String(new Date().getFullYear()),
        amount: "",
        date: getCurrentDate(),
      });
    } catch (err) {
      toast.error("Failed to record payment");
    }
  };

  const remainingAmount = student.monthlyFee - (parseInt(paymentData.amount) || 0);

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link
              to={`/students/edit/${id}`}
              className="w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80"
            >
              <Edit className="w-5 h-5" />
            </Link>
          </div>

          {/* Student Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
              {student.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{student.name}</h1>
              <StatusBadge status={student.status} className="mt-1" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Fee Overview Card */}
          <StudentInfoCard student={student} />

          {/* Payment History */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Payment History</h3>
            <div className="space-y-3">
              {PAYMENT_HISTORY.map((payment, index) => (
                <PaymentHistoryCard key={index} payment={payment} />
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Button */}
        <div className="border-t border-border bg-card px-6 py-4">
          <Sheet open={isPaymentSheetOpen} onOpenChange={setIsPaymentSheetOpen}>
            <SheetTrigger asChild>
              <GradientButton className="w-full h-12 flex items-center justify-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Record Payment
              </GradientButton>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh]">
              <SheetHeader>
                <SheetTitle>Record Payment</SheetTitle>
                <SheetDescription>
                  Record fee payment for {student.name}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {/* Month & Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select
                      value={paymentData.month}
                      onValueChange={(value) =>
                        setPaymentData({ ...paymentData, month: value })
                      }
                    >
                      <SelectTrigger id="month" className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select
                      value={paymentData.year}
                      onValueChange={(value) =>
                        setPaymentData({ ...paymentData, year: value })
                      }
                    >
                      <SelectTrigger id="year" className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount Paid (₹)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="5000"
                      value={paymentData.amount}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, amount: e.target.value })
                      }
                      className="pl-10 h-12 rounded-xl bg-input-background border-transparent focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Payment Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={paymentData.date}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, date: e.target.value })
                    }
                    className="h-12 rounded-xl bg-input-background border-transparent focus:border-blue-500"
                  />
                </div>

                {/* Preview */}
                {paymentData.amount && (
                  <div className="p-4 bg-accent rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Fee:</span>
                      <span className="font-medium">
                        {formatCurrency(student.monthlyFee)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paying:</span>
                      <span className="font-medium">
                        {formatCurrency(parseInt(paymentData.amount))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border">
                      <span className="text-muted-foreground">Remaining:</span>
                      <span
                        className={
                          remainingAmount > 0
                            ? "font-semibold text-destructive"
                            : "font-semibold text-success"
                        }
                      >
                        {formatCurrency(Math.abs(remainingAmount))}
                      </span>
                    </div>
                  </div>
                )}

                <GradientButton
                  onClick={handleRecordPayment}
                  className="w-full h-12 mt-6"
                  disabled={!paymentData.amount}
                >
                  Confirm Payment
                </GradientButton>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </MobileContainer>
  );
}