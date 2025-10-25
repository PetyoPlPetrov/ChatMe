import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock components that might cause issues in tests
jest.mock('./components/Login', () => {
  return function MockLogin() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock('./components/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard-page">Dashboard Page</div>;
  };
});

test('renders app without crashing', () => {
  render(<App />);

  // Since the app redirects to login when not authenticated,
  // we should see the login page
  expect(screen.getByTestId('login-page')).toBeInTheDocument();
});
