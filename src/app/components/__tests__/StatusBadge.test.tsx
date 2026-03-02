import { render } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders Paid badge', () => {
    const { getByText } = render(<StatusBadge status="paid" />);
    expect(getByText('Paid')).toBeInTheDocument();
  });
  it('renders Partial badge', () => {
    const { getByText } = render(<StatusBadge status="partial" />);
    expect(getByText('Partial')).toBeInTheDocument();
  });
  it('renders Pending badge', () => {
    const { getByText } = render(<StatusBadge status="pending" />);
    expect(getByText('Pending')).toBeInTheDocument();
  });
});
