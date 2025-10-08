<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import Placeholder from '@tiptap/extension-placeholder';

  export let content = '';
  export let placeholder = 'Start writing...';

  let element: HTMLDivElement;
  let editor: Editor;

  onMount(() => {
    editor = new Editor({
      element,
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder,
          emptyEditorClass: 'is-editor-empty',
        }),
      ],
      content,
      editorProps: {
        attributes: {
          class: 'prose prose-sm max-w-none min-h-[150px] focus:outline-none'
        }
      },
      onUpdate: ({ editor }) => {
        content = editor.getHTML();
      }
    });
  });

  // Keep the editor in sync when parent updates `content` programmatically
  $: if (editor && typeof content === 'string') {
    try {
      const current = editor.getHTML();
      if (content !== current) {
        editor.commands.setContent(content, false);
      }
    } catch (e) {
      // ignore lifecycle races
    }
  }

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });
</script>

<div class="border rounded-lg p-4">
  <div bind:this={element} />
</div>

<style>
  :global(.ProseMirror p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    float: left;
    color: #adb5bd;
    pointer-events: none;
    height: 0;
  }
</style>