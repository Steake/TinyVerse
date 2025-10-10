import type { Action } from 'svelte/action';
import { runFieldAutofill } from '../stores/autofill';
import type { AutofillScope } from '../stores/autofill';

type AutofillElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
type Seed = Record<string, unknown> | (() => Record<string, unknown> | undefined) | undefined;

const BUTTON_IDLE_TEXT = '✨ Autofill';
const DEFAULT_HINT = 'Uses the global prompt when left blank.';

const SCOPES: ReadonlySet<string> = new Set(['agent', 'location', 'environment', 'story', 'generic']);

export interface AutofillOptions {
  scope?: AutofillScope;
  field?: string;
  seed?: Seed;
  prompt?: string;
  onValue?: (value: any) => void;
  hint?: string;
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

export const autofill: Action<AutofillElement, AutofillOptions | undefined> = (node, opts) => {
  let options: AutofillOptions = { ...opts };
  let loading = false;
  let feedbackTimer: number | undefined;

  node.classList.add('autofill-target');

  const panel = document.createElement('div');
  panel.className = 'autofill-panel';

  const controls = document.createElement('div');
  controls.className = 'autofill-controls';

  const promptInput = document.createElement('input');
  promptInput.type = 'text';
  promptInput.className = 'input input-bordered input-sm autofill-prompt';
  promptInput.placeholder = 'Custom prompt (optional)';
  if (options.prompt) {
    promptInput.value = options.prompt;
  }

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'btn btn-sm btn-secondary autofill-trigger';
  trigger.setAttribute('aria-label', 'Autofill this field');
  trigger.textContent = BUTTON_IDLE_TEXT;

  const status = document.createElement('div');
  status.className = 'autofill-status';
  status.textContent = 'Generating suggestion…';
  status.dataset.visible = 'false';

  const hint = document.createElement('div');
  hint.className = 'autofill-hint';
  hint.textContent = options.hint ?? DEFAULT_HINT;

  controls.appendChild(promptInput);
  controls.appendChild(trigger);
  panel.appendChild(controls);
  panel.appendChild(status);
  panel.appendChild(hint);

  node.insertAdjacentElement('afterend', panel);

  function showStatus(message: string, durationMs?: number) {
    status.textContent = message;
    status.dataset.visible = 'true';
    if (feedbackTimer !== undefined) {
      window.clearTimeout(feedbackTimer);
      feedbackTimer = undefined;
    }
    if (durationMs && durationMs > 0) {
      feedbackTimer = window.setTimeout(() => {
        status.dataset.visible = 'false';
        feedbackTimer = undefined;
      }, durationMs);
    }
  }

  function setLoading(state: boolean) {
    loading = state;
    panel.dataset.loading = state ? 'true' : 'false';
    if (state) {
      node.setAttribute('aria-busy', 'true');
      node.dataset.autofillLoading = 'true';
      trigger.replaceChildren();
      const spinner = document.createElement('span');
      spinner.className = 'loading loading-xs';
      spinner.setAttribute('aria-hidden', 'true');
      trigger.appendChild(spinner);
      trigger.appendChild(document.createTextNode(' Generating…'));
      showStatus('Generating suggestion…');
    } else {
      node.removeAttribute('aria-busy');
      delete node.dataset.autofillLoading;
      trigger.replaceChildren(document.createTextNode(BUTTON_IDLE_TEXT));
    }
    trigger.toggleAttribute('disabled', state);
    promptInput.toggleAttribute('disabled', state);
  }

  function resolveSeed(): Record<string, unknown> | undefined {
    const seedVal = typeof options.seed === 'function' ? options.seed() : options.seed;
    if (!seedVal || typeof seedVal !== 'object') return seedVal ?? undefined;
    return seedVal as Record<string, unknown>;
  }

  async function handleAutofill() {
    if (loading) return;
    const field = resolveField(node, options);
    if (!field) return;

    setLoading(true);
    try {
      const scope = resolveScope(node, options);
      const seedVal = resolveSeed();
      const overridePrompt = promptInput.value.trim() || undefined;
      const value = await runFieldAutofill(scope, field, seedVal, overridePrompt);
      if (options.onValue) {
        options.onValue(value);
      } else {
        applyValue(node, value);
      }
      showStatus(value === undefined ? 'No suggestion returned.' : 'Suggestion applied.', 3000);
    } catch (err: any) {
      const message = err?.message ?? 'Autofill failed.';
      showStatus(message, 4000);
      console.error('[autofill action]', message);
    } finally {
      setLoading(false);
    }
  }

  function handlePromptKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAutofill();
    }
  }

  trigger.addEventListener('click', handleAutofill);
  promptInput.addEventListener('keydown', handlePromptKeydown);

  return {
    update(newOpts) {
      options = { ...options, ...newOpts };
      if (options.prompt !== undefined) {
        promptInput.value = options.prompt;
      }
      hint.textContent = options.hint ?? DEFAULT_HINT;
    },
    destroy() {
      trigger.removeEventListener('click', handleAutofill);
      promptInput.removeEventListener('keydown', handlePromptKeydown);
      if (feedbackTimer !== undefined) {
        window.clearTimeout(feedbackTimer);
      }
      panel.remove();
      node.classList.remove('autofill-target');
      delete node.dataset.autofillLoading;
      node.removeAttribute('aria-busy');
    }
  };
};
