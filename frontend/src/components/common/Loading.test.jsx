import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from './Loading';

describe('Loading', () => {
  it('should render loading spinner', () => {
    render(<Loading />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with fullScreen prop', () => {
    const { container } = render(<Loading fullScreen />);
    const loadingDiv = container.firstChild;
    expect(loadingDiv).toHaveClass('min-h-screen');
  });

  it('should render without fullScreen prop', () => {
    const { container } = render(<Loading />);
    const loadingDiv = container.firstChild;
    expect(loadingDiv).not.toHaveClass('min-h-screen');
  });

  it('should have proper accessibility attributes', () => {
    render(<Loading />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Carregando');
  });
});
