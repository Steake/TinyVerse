import type { Action } from 'svelte/action';
import { runFieldAutofill } from '../stores/autofill';
import type { AutofillScope } from '../stores/autofill';

type AutofillElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type Seed = Record<string, unknown> | (() => Record<string, unknown> | undefined) | undefined;

const SCOPES: ReadonlySet<string> = new Set(['agent', 'location', 'environment', 'story', 'generic']);

export interface AutofillOptions {
  scope?: AutofillScope;
  field?: string;
  seed?: Seed;
  prompt?: string;
  onValue?: (value: any) => void;
  hint?: string;
  icon?: string;
}

function resolveScope(node: AutofillElement, options: AutofillOptions): AutofillScope {
  if (options.scope) return options.scope;
  const attr =
    node.dataset.autofillScope ||
    node.closest<HTMLElement>('[data-autofill-scope]')?.dataset.autofillScope;
  return (attr && SCOPES.has(attr) ? attr : 'generic') as AutofillScope;
}

function normaliseLabel(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function resolveField(node: AutofillElement, options: AutofillOptions): string | undefined {
  if (options.field) return options.field;
  if (node.dataset.autofillField) return node.dataset.autofillField;
  if (node.name) return node.name;
  if (node.id) return node.id;
  const aria = node.getAttribute('aria-label');
  if (aria) return normaliseLabel(aria);
  const label =
    node instanceof HTMLElement
      ? node.closest('label')?.textContent ?? undefined
      : undefined;
  return label ? normaliseLabel(label) : undefined;
}

function applyValue(node: AutofillElement, value: any) {
  if (value === undefined) return;
  if (node instanceof HTMLSelectElement) {
    node.value = String(value);
  } else if (node instanceof HTMLInputElement) {
    if (node.type === 'number' || node.type === 'range') {
      const n = Number(value);
      if (Number.isFinite(n)) {
        node.value = String(n);
      }
    } else {
      node.value = String(value);
    }
  } else if (node instanceof HTMLTextAreaElement) {
    node.value = String(value);
  }
  node.dispatchEvent(new Event('input', { bubbles: true }));
  node.dispatchEvent(new Event('change', { bubbles: true }));
}

const SUCCESS_RESET_MS = 2400;

export const autofill: Action<AutofillElement, AutofillOptions | undefined> = (node, opts) => {
  let options: AutofillOptions = { ...opts };
  let loading = false;
  let resetTimer: number | undefined;

  const originalParent = node.parentNode as Node | null;
  const originalNextSibling = node.nextSibling;

  const baseIcon = () => options.icon ?? '✨';

  const wrapper = document.createElement('div');
  wrapper.className = 'autofill-wrapper';
  if (node instanceof HTMLTextAreaElement) {
    wrapper.classList.add('autofill-wrapper--textarea');
  }

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'autofill-chip';
  trigger.dataset.state = 'idle';
  trigger.textContent = baseIcon();

  const status = document.createElement('span');
  status.className = 'autofill-status';
  status.setAttribute('aria-live', 'polite');
  status.textContent = '';

  node.classList.add('autofill-input');
  if (node instanceof HTMLTextAreaElement) {
    node.classList.add('autofill-input--textarea');
  }
  wrapper.appendChild(node);
  wrapper.appendChild(trigger);
  wrapper.appendChild(status);

  if (originalParent) {
    originalParent.insertBefore(wrapper, originalNextSibling ?? null);
  }

  function resolveSeed(): Record<string, unknown> | undefined {
    const seedVal = typeof options.seed === 'function' ? options.seed() : options.seed;
    if (!seedVal || typeof seedVal !== 'object') return seedVal ?? undefined;
    return seedVal as Record<string, unknown>;
  }

  function setStatusMessage(message: string) {
    status.textContent = message;
  }

  function setButtonState(state: 'idle' | 'loading' | 'success' | 'error') {
    trigger.dataset.state = state;
    const icon =
      state === 'loading' ? '⏳' : state === 'success' ? '✅' : state === 'error' ? '⚠️' : baseIcon();
    trigger.textContent = icon;
  }

  function setLoading(state: boolean) {
    loading = state;
    trigger.toggleAttribute('disabled', state);
    if (state) {
      node.setAttribute('aria-busy', 'true');
      node.dataset.autofillLoading = 'true';
      setButtonState('loading');
      setStatusMessage('Generating suggestion…');
    } else {
      node.removeAttribute('aria-busy');
      delete node.dataset.autofillLoading;
    }
  }

  function scheduleReset() {
    if (resetTimer !== undefined) {
      window.clearTimeout(resetTimer);
    }
    resetTimer = window.setTimeout(() => {
      setButtonState('idle');
      setStatusMessage('');
      resetTimer = undefined;
    }, SUCCESS_RESET_MS);
  }

  function updateAriaLabel() {
    const field = resolveField(node, options) ?? 'field';
    const pretty = field.replace(/[_-]+/g, ' ');
    const label = options.hint ? `${options.hint}` : `Autofill ${pretty}`;
    trigger.setAttribute('aria-label', label.trim());
    trigger.setAttribute('title', label.trim());
  }

  async function handleAutofill() {
    if (loading) return;
    const field = resolveField(node, options);
    if (!field) return;

    setLoading(true);
    try {
      const scope = resolveScope(node, options);
      const seedVal = resolveSeed();
      const value = await runFieldAutofill(scope, field, seedVal, undefined);
      if (options.onValue) {
        options.onValue(value);
      } else {
        applyValue(node, value);
      }
      setButtonState(value === undefined ? 'error' : 'success');
      const message = value === undefined ? 'No suggestion returned.' : 'Suggestion applied.';
      setStatusMessage(message);
      scheduleReset();
    } catch (err: any) {
      const message = err?.message ?? 'Autofill failed.';
      console.error('[autofill action]', message);
      setButtonState('error');
      setStatusMessage(message);
      scheduleReset();
    } finally {
      setLoading(false);
    }
  }

  trigger.addEventListener('click', handleAutofill);
  updateAriaLabel();

  return {
    update(newOpts) {
      options = { ...options, ...newOpts };
      updateAriaLabel();
      setButtonState('idle');
    },
    destroy() {
      trigger.removeEventListener('click', handleAutofill);
      if (resetTimer !== undefined) {
        window.clearTimeout(resetTimer);
      }
      if (wrapper.parentNode) {
        wrapper.removeChild(node);
        wrapper.remove();
      }
      if (originalParent) {
        if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
          originalParent.insertBefore(node, originalNextSibling);
        } else {
          originalParent.appendChild(node);
        }
      }
      node.classList.remove('autofill-input');
      node.classList.remove('autofill-input--textarea');
      delete node.dataset.autofillLoading;
      node.removeAttribute('aria-busy');
    }
  };
};
