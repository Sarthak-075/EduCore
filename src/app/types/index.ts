// Core types for the EduCore application

export type PaymentStatus = "paid" | "partial" | "pending";

export interface Student {
  id: string;
  name: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  monthlyFee: number;
  dueDay: number;
  isActive?: boolean;
  status: PaymentStatus;
  avatar?: string;
}

export interface StudentSummary {
  id: string;
  name: string;
  monthlyFee: number;
  status: PaymentStatus;
  avatar?: string;
  isActive?: boolean;
}

export interface PaymentHistory {
  month: string;
  expected: number;
  paid: number;
  status: PaymentStatus;
  date: string;
}

export interface Payment {
  id: string;
  studentId: string;
  month: number;
  year: number;
  amountPaid: number;
  dateReceived: string;
}

export interface Activity {
  id: number;
  student: string;
  amount: number;
  date: string;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface MonthlyProgress {
  collected: number;
  target: number;
  percentage: number;
}

export interface MonthlySummary {
  totalExpected: number;
  totalCollected: number;
  totalPending: number;
}

export interface PaymentFormData {
  month: string;
  year: string;
  amount: string;
  date: string;
}

export interface StatCardData {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
}
