<script lang="ts">
  import API from '../../api';

  var api = API

  // Define the WorldBuilder component
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
      const response = await api.story.getStories();
      return response.data;
    } catch (error) {
      console.error('Error listing stories:', error);
      throw new Error('Failed to list stories. Please try again later.');
    }
  }

  async function startSimulation() {
    try {
      const response = await api.controlSimulation({ action: 'start' });
      return response.data;
    } catch (error) {
      console.error('Error starting simulation:', error);
      throw new Error('Failed to start simulation. Please try again later.');
    }
  }

  async function stopSimulation() {
    try {
      const response = await api.controlSimulation({ action: 'stop' });
      return response.data;
    } catch (error) {
      console.error('Error stopping simulation:', error);
      throw new Error('Failed to stop simulation. Please try again later.');
    }
  }

  async function pauseSimulation() {
    try {
      const response = await api.controlSimulation({ action: 'pause' });
      return response.data;
    } catch (error) {
      console.error('Error pausing simulation:', error);
      throw new Error('Failed to pause simulation. Please try again later.');
    }
  }

  // Add event handlers for simulation control buttons
  function handleStartSimulation() {
    startSimulation();
  }

  function handleStopSimulation() {
    stopSimulation();
  }

  function handlePauseSimulation() {
    pauseSimulation();
  }
</script>

<button on:click={handleStartSimulation}>Start Simulation</button>
<button on:click={handleStopSimulation}>Stop Simulation</button>
<button on:click={handlePauseSimulation}>Pause Simulation</button>
