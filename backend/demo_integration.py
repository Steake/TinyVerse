#!/usr/bin/env python3
"""
TinyTroupe Integration Demo Script

This script demonstrates the TinyTroupe integration by:
1. Creating agents
2. Running a simulation
3. Retrieving simulation state and logs

Run this script with the backend server running to see the integration in action.
"""
import asyncio
import httpx
import json
from typing import Dict, Any

API_BASE_URL = "http://localhost:8000/api"


async def create_agent(client: httpx.AsyncClient, agent_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create an agent via the API."""
    response = await client.post(f"{API_BASE_URL}/agents", json=agent_data)
    response.raise_for_status()
    return response.json()


async def list_agents(client: httpx.AsyncClient):
    """List all agents."""
    response = await client.get(f"{API_BASE_URL}/agents")
    response.raise_for_status()
    return response.json()


async def control_simulation(client: httpx.AsyncClient, action: str, steps: int = 1):
    """Control the simulation."""
    response = await client.post(
        f"{API_BASE_URL}/simulation/control",
        json={"action": action, "steps": steps}
    )
    response.raise_for_status()
    return response.json()


async def get_simulation_state(client: httpx.AsyncClient):
    """Get current simulation state."""
    response = await client.get(f"{API_BASE_URL}/simulation/state")
    response.raise_for_status()
    return response.json()


async def get_simulation_logs(client: httpx.AsyncClient, limit: int = 50):
    """Get simulation logs."""
    response = await client.get(f"{API_BASE_URL}/simulation/logs?limit={limit}")
    response.raise_for_status()
    return response.json()


async def main():
    """Run the demo."""
    print("=" * 60)
    print("TinyTroupe Integration Demo")
    print("=" * 60)
    print()

    async with httpx.AsyncClient() as client:
        # Step 1: Create agents
        print("1. Creating agents...")
        print("-" * 60)
        
        agents_data = [
            {
                "name": "Alice Johnson",
                "age": 32,
                "occupation": "Software Engineer",
                "personality_traits": ["curious", "analytical", "creative"],
                "professional_interests": ["AI", "Machine Learning", "Python"],
                "backstory": "Alice is a senior software engineer with a passion for AI."
            },
            {
                "name": "Bob Smith",
                "age": 28,
                "occupation": "Product Manager",
                "personality_traits": ["organized", "strategic", "collaborative"],
                "professional_interests": ["Product Strategy", "User Research", "Agile"],
                "backstory": "Bob leads product development with a focus on user needs."
            }
        ]
        
        created_agents = []
        for agent_data in agents_data:
            agent = await create_agent(client, agent_data)
            created_agents.append(agent)
            print(f"  ✓ Created agent: {agent['name']} (ID: {agent['id'][:8]}...)")
        
        print()

        # Step 2: List all agents
        print("2. Listing all agents...")
        print("-" * 60)
        agents = await list_agents(client)
        print(f"  Total agents in simulation: {len(agents)}")
        for agent in agents:
            print(f"  - {agent['name']}, {agent['age']}, {agent['occupation']}")
        print()

        # Step 3: Check initial simulation state
        print("3. Checking initial simulation state...")
        print("-" * 60)
        state = await get_simulation_state(client)
        print(f"  Running: {state['is_running']}")
        print(f"  Current step: {state['current_step']}")
        print(f"  Agents count: {state['agents_count']}")
        print()

        # Step 4: Run simulation
        print("4. Running simulation (3 steps)...")
        print("-" * 60)
        result = await control_simulation(client, "start", steps=3)
        print(f"  {result['message']}")
        
        state = await get_simulation_state(client)
        print(f"  Current step after run: {state['current_step']}")
        print()

        # Step 5: Get simulation logs
        print("5. Retrieving simulation logs...")
        print("-" * 60)
        logs = await get_simulation_logs(client)
        print(f"  Total events logged: {len(logs)}")
        print()
        print("  Recent events:")
        for log in logs[-10:]:  # Show last 10 events
            print(f"    [{log['type']}] {log['timestamp']}")
            if 'agent_name' in log.get('data', {}):
                print(f"      Agent: {log['data']['agent_name']}")
            elif 'steps' in log.get('data', {}):
                print(f"      Steps: {log['data']['steps']}")
        print()

        # Step 6: Pause simulation
        print("6. Pausing simulation...")
        print("-" * 60)
        result = await control_simulation(client, "pause")
        print(f"  {result['message']}")
        
        state = await get_simulation_state(client)
        print(f"  Running: {state['is_running']}")
        print()

        # Step 7: Summary
        print("=" * 60)
        print("Demo completed successfully!")
        print("=" * 60)
        print()
        print("Summary:")
        print(f"  - Created {len(created_agents)} agents")
        print(f"  - Ran {state['current_step']} simulation steps")
        print(f"  - Logged {len(logs)} events")
        print()
        print("Next steps:")
        print("  - Connect to WebSocket at ws://localhost:8000/ws for real-time updates")
        print("  - View API docs at http://localhost:8000/docs")
        print("  - Run tests with: cd backend && pytest tests/ -v")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except httpx.ConnectError:
        print("Error: Could not connect to backend server.")
        print("Please ensure the backend is running:")
        print("  cd backend && uvicorn app.main:app --reload")
    except Exception as e:
        print(f"Error: {e}")
