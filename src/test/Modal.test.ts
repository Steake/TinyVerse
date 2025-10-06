import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Modal from '../lib/components/common/Modal.svelte';

describe('Modal', () => {
  it('renders when show is true', () => {
    render(Modal, { props: { show: true, title: 'Test Modal' } });
    
    expect(screen.getByText('Test Modal')).toBeTruthy();
  });

  it('does not render when show is false', () => {
    const { container } = render(Modal, { props: { show: false, title: 'Test Modal' } });
    
    const modal = container.querySelector('.modal-open');
    expect(modal).toBeFalsy();
  });

  it('dispatches close event when backdrop is clicked', async () => {
    const { component } = render(Modal, { props: { show: true, title: 'Test Modal' } });
    
    const closeHandler = vi.fn();
    component.$on('close', closeHandler);
    
    const backdrop = screen.getByRole('button', { name: /close modal/i });
    await fireEvent.click(backdrop);
    
    expect(closeHandler).toHaveBeenCalled();
  });

  it('has proper ARIA attributes', () => {
    const { container } = render(Modal, { props: { show: true, title: 'Test Modal' } });
    
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('aria-labelledby')).toBe('modal-title');
  });
});
