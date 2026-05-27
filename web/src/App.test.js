import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page', () => {
  render(<App />);
  const loginText = screen.getByText(/login page/i);
  expect(loginText).toBeInTheDocument();
});