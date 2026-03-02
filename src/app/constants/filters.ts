import { PaymentStatus } from "../types";

export type FilterType = "all" | PaymentStatus;

export interface FilterOption {
  value: FilterType;
  label: string;
}

export const FILTER_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "pending", label: "Pending" },
];
