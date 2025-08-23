import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

// Mock the hooks and dependencies
jest.mock('~/hooks', () => ({
  useLocalize: () => (key: string) => key,
}));

jest.mock('~/data-provider', () => ({
  useConversationsInfiniteQuery: () => ({
    data: {
      pages: [
        {
          conversations: [
            { id: '1', title: 'Test Conversation 1' },
            { id: '2', title: 'Test Conversation 2' },
          ],
        },
      ],
    },
  }),
}));

jest.mock('~/store', () => ({
  default: {
    useClearConvoState: () => jest.fn(),
  },
}));

const renderSidebar = () => {
  return render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>
  );
};

describe('Sidebar Component', () => {
  beforeEach(() => {
    // Mock window.innerWidth for responsive testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('renders without crashing', () => {
    renderSidebar();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('has correct initial collapsed width', () => {
    renderSidebar();
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toHaveClass('w-20');
  });

  it('expands on hover', () => {
    renderSidebar();
    const sidebar = screen.getByRole('navigation');
    
    fireEvent.mouseEnter(sidebar);
    
    // Should expand to full width
    expect(sidebar).toHaveClass('w-64');
  });

  it('shows navigation items when expanded', () => {
    renderSidebar();
    const sidebar = screen.getByRole('navigation');
    
    fireEvent.mouseEnter(sidebar);
    
    // Should show text labels
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('New Chat')).toBeInTheDocument();
    expect(screen.getByText('Conversations')).toBeInTheDocument();
  });

  it('shows conversation count badge', () => {
    renderSidebar();
    const sidebar = screen.getByRole('navigation');
    
    fireEvent.mouseEnter(sidebar);
    
    // Should show conversation count
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('has correct CSS classes', () => {
    renderSidebar();
    const sidebar = screen.getByRole('navigation');
    
    expect(sidebar).toHaveClass('sidebar-container');
    expect(sidebar).toHaveClass('fixed');
    expect(sidebar).toHaveClass('left-0');
    expect(sidebar).toHaveClass('top-0');
  });

  it('handles mobile responsive layout', () => {
    // Mock mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    renderSidebar();
    const sidebar = screen.getByRole('navigation');
    
    // Should still have basic classes
    expect(sidebar).toHaveClass('sidebar-container');
  });

  it('has proper accessibility attributes', () => {
    renderSidebar();
    const sidebar = screen.getByRole('navigation');
    
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveAttribute('aria-label');
  });

  it('shows logo when expanded', () => {
    renderSidebar();
    const sidebar = screen.getByRole('navigation');
    
    fireEvent.mouseEnter(sidebar);
    
    // Should show ShopMind logo
    expect(screen.getByText('ShopMind')).toBeInTheDocument();
  });

  it('has smooth transitions', () => {
    renderSidebar();
    const sidebar = screen.getByRole('navigation');
    
    expect(sidebar).toHaveClass('transition-all');
    expect(sidebar).toHaveClass('duration-300');
  });
});
