import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppLayout } from '../../../../components/layout/AppLayout';

describe('AppLayout', () => {
  const defaultProps = {
    children: <div data-testid="test-content">Test Content</div>
  };

  it('renders with default props', () => {
    render(<AppLayout {...defaultProps} />);
    
    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    expect(screen.getByTestId('title-bar')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    const customTitle = 'Custom App Title';
    render(<AppLayout {...defaultProps} title={customTitle} />);
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });

  it('renders default title when no title prop provided', () => {
    render(<AppLayout {...defaultProps} />);
    
    expect(screen.getByText('BeepMyPhone')).toBeInTheDocument();
  });

  it('shows title bar when showTitleBar is true (default)', () => {
    render(<AppLayout {...defaultProps} />);
    
    expect(screen.getByTestId('title-bar')).toBeInTheDocument();
  });

  it('shows title bar when showTitleBar is explicitly true', () => {
    render(<AppLayout {...defaultProps} showTitleBar={true} />);
    
    expect(screen.getByTestId('title-bar')).toBeInTheDocument();
  });

  it('hides title bar when showTitleBar is false', () => {
    render(<AppLayout {...defaultProps} showTitleBar={false} />);
    
    expect(screen.queryByTestId('title-bar')).not.toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('passes children to MainContent', () => {
    const testChild = <div data-testid="child-component">Child Content</div>;
    render(<AppLayout>{testChild}</AppLayout>);
    
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('has correct CSS classes for layout structure', () => {
    render(<AppLayout {...defaultProps} />);
    
    const layout = screen.getByTestId('app-layout');
    expect(layout).toHaveClass('h-screen', 'flex', 'flex-col', 'bg-gray-50');
  });

  it('renders multiple children correctly', () => {
    const multipleChildren = (
      <>
        <div data-testid="child-1">First Child</div>
        <div data-testid="child-2">Second Child</div>
      </>
    );
    
    render(<AppLayout>{multipleChildren}</AppLayout>);
    
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('combines all props correctly', () => {
    const customTitle = 'Full Test Title';
    const testContent = <span data-testid="full-test">Full test content</span>;
    
    render(
      <AppLayout title={customTitle} showTitleBar={true}>
        {testContent}
      </AppLayout>
    );
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByTestId('title-bar')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByTestId('full-test')).toBeInTheDocument();
  });

  it('renders without title bar and custom title still works for accessibility', () => {
    const customTitle = 'Hidden Title';
    render(
      <AppLayout title={customTitle} showTitleBar={false}>
        {defaultProps.children}
      </AppLayout>
    );
    
    expect(screen.queryByTestId('title-bar')).not.toBeInTheDocument();
    expect(screen.queryByText(customTitle)).not.toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });
});