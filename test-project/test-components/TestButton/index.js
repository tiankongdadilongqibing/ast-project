import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import NewButton from '../../src/components/Button';

describe('NewButton Component', () => {
  it('should render correctly', () => {
    const { getByText } = render(
      <NewButton>Test Button</NewButton>
    );
    
    expect(getByText('Test Button')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    const { getByText } = render(
      <NewButton onClick={handleClick}>Click Me</NewButton>
    );
    
    fireEvent.click(getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should have correct className', () => {
    const { container } = render(
      <NewButton>Test</NewButton>
    );
    
    const button = container.querySelector('button');
    expect(button).toHaveClass('new-button-class');
  });
});
