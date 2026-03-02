import {
  formatCurrency,
  formatCurrencyCompact,
  calculateRemaining,
  calculatePercentage,
  getInitials,
  getCurrentDate,
  formatPhoneNumber,
} from '../helpers';

describe('helpers', () => {
  test('formatCurrency undefined returns ₹0', () => {
    expect(formatCurrency(undefined)).toBe('₹0');
  });

  test('formatCurrency works with number', () => {
    expect(formatCurrency(12345)).toBe('₹12,345');
  });

  test('formatCurrencyCompact thousands', () => {
    expect(formatCurrencyCompact(5000)).toBe('₹5K');
    expect(formatCurrencyCompact(5500)).toBe('₹5.5K');
  });

  test('calculateRemaining and percentage', () => {
    expect(calculateRemaining(1000, 200)).toBe(800);
    expect(calculateRemaining(500, 600)).toBe(0);
    expect(calculatePercentage(50, 200)).toBe(25);
    expect(calculatePercentage(0, 0)).toBe(0);
  });

  test('getInitials', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Single')).toBe('S');
  });

  test('getCurrentDate returns iso date', () => {
    const date = getCurrentDate();
    expect(/\d{4}-\d{2}-\d{2}/.test(date)).toBe(true);
  });

  test('formatPhoneNumber', () => {
    expect(formatPhoneNumber('9876543210')).toBe('98765 43210');
    expect(formatPhoneNumber('123')).toBe('123');
  });
});
