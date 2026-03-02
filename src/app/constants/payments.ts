import { PaymentHistory } from "../types";

export const PAYMENT_HISTORY: PaymentHistory[] = [
  {
    month: "February 2026",
    expected: 5000,
    paid: 5000,
    status: "paid",
    date: "Feb 5, 2026",
  },
  {
    month: "January 2026",
    expected: 5000,
    paid: 5000,
    status: "paid",
    date: "Jan 5, 2026",
  },
  {
    month: "December 2025",
    expected: 5000,
    paid: 3000,
    status: "partial",
    date: "Dec 8, 2025",
  },
  {
    month: "November 2025",
    expected: 5000,
    paid: 5000,
    status: "paid",
    date: "Nov 5, 2025",
  },
  {
    month: "October 2025",
    expected: 5000,
    paid: 0,
    status: "pending",
    date: "-",
  },
];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const YEARS = ["2026", "2025", "2024"];
