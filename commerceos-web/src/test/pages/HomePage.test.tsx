import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import HomePage from '../../pages/HomePage';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'rajesh', email: 'rajesh@example.com', roles: ['ADMIN'] },
    logout: vi.fn(),
  }),
}));

describe('HomePage', () => {
  it('renders welcome message with user name', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText(/rajesh/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome back to CommerceOS/i)).toBeInTheDocument();
  });

  it('renders core modules section', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Inventory Management')).toBeInTheDocument();
    expect(screen.getByText('Supplier Network')).toBeInTheDocument();
    expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Purchase Orders')).toBeInTheDocument();
    expect(screen.getByText('Approval Queue')).toBeInTheDocument();
  });
});
