// Utility functions for the EduCore application

/**
 * Format a number as Indian Rupee currency
 */
export const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${amount.toLocaleString()}`;
};

/**
 * Format a number as currency with 'K' suffix for thousands
 */
export const formatCurrencyCompact = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return '₹0';
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  }
  return formatCurrency(amount);
};

/**
 * Calculate remaining amount for partial payments
 */
export const calculateRemaining = (expected: number, paid: number): number => {
  return Math.max(0, expected - paid);
};

/**
 * Calculate collection percentage
 */
export const calculatePercentage = (collected: number, target: number): number => {
  if (target === 0) return 0;
  return Math.round((collected / target) * 100);
};

/**
 * Get initials from a name
 */
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Get current date in YYYY-MM-DD format
 */
export const getCurrentDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  // Indian phone number format: 98765 43210
  if (phone.length === 10) {
    return `${phone.slice(0, 5)} ${phone.slice(5)}`;
  }
  return phone;
};
