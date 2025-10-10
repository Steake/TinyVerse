<script lang="ts">
  import { api } from '../../api';

  const SAMPLE_STORY = {
    id: 'sample-story',
    title: 'New Story',
    synopsis: 'Auto-generated sample story'
  } as const;

  async function createStory(payload: Omit<typeof SAMPLE_STORY, 'id'>) {
    const response = await api?.story?.createStory?.(payload);
    return response ?? null;
  }

  async function updateStory(id: string, payload: Omit<typeof SAMPLE_STORY, 'id'>) {
    const response = await api?.story?.updateStory?.(id, payload);
    return response ?? null;
  }

  async function listStories() {
    const response = await api?.story?.getStories?.();
    return response ?? [];
  }

  async function handleCreate() {
    try {
  await createStory({ title: SAMPLE_STORY.title, synopsis: SAMPLE_STORY.synopsis });
    } catch (error) {
      console.error('Error creating story:', error);
    }
  }

  async function handleUpdate() {
    try {
  await updateStory(SAMPLE_STORY.id, { title: SAMPLE_STORY.title, synopsis: SAMPLE_STORY.synopsis });
    } catch (error) {
      console.error('Error updating story:', error);
    }
  }

  async function handleList() {
    try {
      await listStories();
    } catch (error) {
      console.error('Error listing stories:', error);
    }
  }
</script>

<div class="flex gap-2">
  <button type="button" class="btn btn-primary" on:click={handleCreate}>
    Create Story
  </button>
  <button type="button" class="btn btn-secondary" on:click={handleUpdate}>
    Update Story
  </button>
  <button type="button" class="btn" on:click={handleList}>
    List Stories
  </button>
</div>
