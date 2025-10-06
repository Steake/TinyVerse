import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Sidebar from '../lib/components/layout/Sidebar.svelte';

describe('Sidebar', () => {
  it('renders navigation sections', () => {
    render(Sidebar, { props: { activeSection: 'playwright-desk' } });
    
    // Check if main navigation items are present using more specific queries
    expect(screen.getByText("Playwright's Desk")).toBeTruthy();
    expect(screen.getByText("Grand Stage")).toBeTruthy();
    expect(screen.getByText("Critic's Corner")).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
  });

  it('highlights active section', () => {
    const { container } = render(Sidebar, { props: { activeSection: 'playwright-desk' } });
    
    // Check if active class is applied
    const activeElements = container.querySelectorAll('.active');
    expect(activeElements.length).toBeGreaterThan(0);
  });
});
