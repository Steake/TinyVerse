# Simulation Setup Wizard Design

## Goals
- Replace call-center specific onboarding terminology with a generic simulation setup flow.
- Collect a single high-level prompt that seeds the simulation blueprint, agents, locations, and narrative timeline.
- Provide optional advanced controls for batch sizes and scoped prompts without forcing users through underlying forms.
- Trigger the first-pass generation automatically and hand off to existing editors (World Builder, Casting Call, etc.) for refinement.

## User Flow
1. **Welcome**
   - Explain that TinyVerse can bootstrap an entire scenario from one prompt.
   - Offer quick-start templates (e.g., "Corporate Heist", "Hospital Night Shift") to demonstrate possibilities.
   - Primary action: "Generate from my idea" opens the prompt step.

2. **Blueprint Prompt**
   - Large textarea for the simulation concept.
   - Optional sliders/toggles:
     - Desired number of agents.
     - Number of locations / complexity.
     - Enable narrative timeline (auto-populate story beats).
   - Show a live preview of the master blueprint prompt that will be saved into the prompt store.

3. **Generation Progress**
   - On submit, disable navigation and show a progress tracker:
     - Blueprint creation.
     - Agent batch generation (stream newly created agents into Casting Call list UI).
     - Location batch generation.
     - Narrative timeline construction.
   - Each stage displays partial results as soon as they arrive.

4. **Review & Customise**
   - Once generation finishes, show summary cards with counts and quick links:
     - "Review agents" opens Casting Call filtered to newly generated personas.
     - "Refine locations" opens World Builder with generated nodes highlighted.
     - "Adjust storyline" opens new Narrative Timeline view (see below).
   - Also surface the prompt hierarchy using the existing popover component for transparency.

## Architecture Changes
- New store: `setupWizardStore` with properties:
  - `isOpen`, `currentStep`, `prompt`, `agentCount`, `locationCount`, `includeNarrative`, `status`, `errors`, `results`.
- New component: `SimulationWizard.svelte` mounted above the Playwright Desk when `setupWizardStore.isOpen` is true.
- Integrate with existing prompt store by calling `setMasterPrompt` and `setPromptById` after blueprint confirmation.
- Trigger batch generation by invoking a new orchestrator in `autofill.ts`:
  - `runScenarioBootstrap({ agentCount, locationCount, includeNarrative, seedPrompt })`.
  - This orchestrator will:
    1. Persist prompts.
    2. Call combined LLM endpoint to request multiple agents/locations in a single response.
    3. Parse results and dispatch to `agentStore` and `worldStore` sequentially to support streaming UI updates.

## Narrative Timeline Support (Preview)
- Introduce `timelineStore` with story beats (id, title, description, trigger conditions, UI blocking hints).
- Generation stage above will populate initial beats.
- Grand Stage will read from `timelineStore` to guide the simulation walkthrough.

## UX Integration
- The wizard opens automatically on first load if there are no agents or locations.
- Users can relaunch it later from a "New Scenario" button in the header (replaces call-center specific actions).
- After completion, the wizard closes and the user lands on a guided checklist highlighting each editor.

## Next Steps
1. Build `setupWizardStore` and `SimulationWizard.svelte` scaffolding.
2. Update `App.svelte` to render the wizard overlay.
3. Implement orchestrated batch generation with unique-name handling and streaming updates.
4. Wire narrative timeline store and integrate with Grand Stage UI.
5. Update documentation and remove remaining call-center language in UI copies.
