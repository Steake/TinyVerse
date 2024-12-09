// Import necessary components and APIs
import { api } from '../../../api';

// Define the StoryManager component
<script lang="ts">
  async function createStory(story: any) {
    try {
      const response = await api.story.createStory(story);
      return response.data;
    } catch (error) {
      console.error('Error creating story:', error);
      throw new Error('Failed to create story. Please try again later.');
    }
  }

  async function updateStory(story: any) {
    try {
      const response = await api.story.updateStory(story);
      return response.data;
    } catch (error) {
      console.error('Error updating story:', error);
      throw new Error('Failed to update story. Please try again later.');
    }
  }

  async function listStories() {
    try {
      const response = await api.story.listStories();
      return response.data;
    } catch (error) {
      console.error('Error listing stories:', error);
      throw new Error('Failed to list stories. Please try again later.');
    }
  }
</script>

<button on:click={createStory}>Create Story</button>
<button on:click={updateStory}>Update Story</button>
<button on:click={listStories}>List Stories</button>
