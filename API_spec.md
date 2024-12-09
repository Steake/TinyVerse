# TinyVerse Stage API Specification

## Overview

The TinyVerse Stage API provides endpoints for managing agents, world elements, and simulation controls in a virtual environment. This RESTful API supports JSON for request and response payloads.

## Base URL

```
/api
```

## Authentication

Authentication details will be added in future versions. Currently, the API operates without authentication for development purposes.

## Common Headers

```
Content-Type: application/json
Accept: application/json
```

## Error Responses

All endpoints may return these error responses:

```json
{
  "code": "ERROR_CODE",
  "message": "Human readable error message",
  "details": {
    "field": "Additional error context"
  }
}
```

Common error codes:
- `400_BAD_REQUEST`: Invalid request parameters
- `404_NOT_FOUND`: Requested resource not found
- `500_SERVER_ERROR`: Internal server error

## Endpoints

### Agents

#### GET /agents
Retrieve all agents with basic information.

Response:
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "age": "number",
      "occupation": "string",
      "emoji": "string",
      "group": "string?",
      "x": "number?",
      "y": "number?"
    }
  ]
}
```

#### GET /agents/{id}
Retrieve detailed information about a specific agent.

Response:
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "age": "number",
    "occupation": "string",
    "occupationDescription": "string",
    "nationality": "string",
    "countryOfResidence": "string",
    "emoji": "string",
    "group": "string?",
    "routines": [
      {
        "id": "string",
        "name": "string",
        "schedule": "string",
        "location": "string",
        "duration": "number"
      }
    ],
    "personalityTraits": ["string"],
    "professionalInterests": ["string"],
    "personalInterests": ["string"],
    "skills": [
      {
        "name": "string",
        "level": "number"
      }
    ],
    "relationships": [
      {
        "targetId": "string",
        "type": "friend|colleague|family|rival",
        "strength": "number",
        "description": "string"
      }
    ],
    "backstory": "string"
  }
}
```

#### POST /agents
Create a new agent.

Request: Same as GET /agents/{id} response without id field
Response: Same as GET /agents/{id}

#### PATCH /agents/{id}
Update an existing agent.

Request: Partial agent object
Response: Updated agent object

#### DELETE /agents/{id}
Delete an agent.

Response: 204 No Content

### World

#### GET /locations
Retrieve all locations.

Response:
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "type": "room|outdoor|special",
      "description": "string",
      "x": "number",
      "y": "number",
      "width": "number",
      "height": "number",
      "image": "string?"
    }
  ]
}
```

#### POST /locations
Create a new location.

Request: Location object without id
Response: Created location object

#### PATCH /locations/{id}
Update an existing location.

Request: Partial location object
Response: Updated location object

#### DELETE /locations/{id}
Delete a location.

Response: 204 No Content

#### GET /connections
Retrieve all connections between locations.

Response:
```json
{
  "data": [
    {
      "id": "string",
      "source": "string",
      "target": "string",
      "type": "path|door|portal"
    }
  ]
}
```

#### POST /connections
Create a new connection.

Request: Connection object without id
Response: Created connection object

#### DELETE /connections/{id}
Delete a connection.

Response: 204 No Content

### Simulation

#### GET /simulation/state
Get current simulation state.

Response:
```json
{
  "data": {
    "isRunning": "boolean",
    "currentTime": "string (ISO 8601)",
    "speed": "number"
  }
}
```

#### POST /simulation/control
Control simulation execution.

Request:
```json
{
  "command": "START|PAUSE|STEP",
  "speed": "number?"
}
```

#### GET /simulation/logs
Retrieve simulation logs.

Query Parameters:
- agentId (string, optional)
- action (string, optional)
- startTime (ISO 8601 string, optional)
- endTime (ISO 8601 string, optional)
- location (string, optional)
- limit (number, optional)
- offset (number, optional)

Response:
```json
{
  "data": [
    {
      "id": "string",
      "timestamp": "string (ISO 8601)",
      "agentId": "string",
      "action": "MOVE|TALK|INTERACT",
      "data": {
        "location": "string?",
        "message": "string?",
        "targetId": "string?"
      }
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "pageSize": "number",
    "totalPages": "number"
  }
}
```

#### POST /simulation/action
Execute a simulation action.

Request:
```json
{
  "type": "MOVE|TALK|INTERACT",
  "agentId": "string",
  "targetId": "string?",
  "data": {
    "location": "string?",
    "message": "string?"
  }
}
```

Response: Created log entry

## Data Models

### Agent
- id: string (UUID)
- name: string
- age: number
- occupation: string
- occupationDescription: string
- nationality: string
- countryOfResidence: string
- emoji: string
- group?: string
- routines: Routine[]
- personalityTraits: string[]
- professionalInterests: string[]
- personalInterests: string[]
- skills: Skill[]
- relationships: Relationship[]
- backstory: string
- x?: number
- y?: number

### Routine
- id: string (UUID)
- name: string
- schedule: string
- location: string
- duration: number

### Skill
- name: string
- level: number (1-5)

### Relationship
- targetId: string (UUID)
- type: "friend" | "colleague" | "family" | "rival"
- strength: number (1-5)
- description: string

### Location
- id: string (UUID)
- name: string
- type: "room" | "outdoor" | "special"
- description: string
- x: number
- y: number
- width: number
- height: number
- image?: string

### Connection
- id: string (UUID)
- source: string (Location UUID)
- target: string (Location UUID)
- type: "path" | "door" | "portal"

### SimulationLog
- id: string (UUID)
- timestamp: string (ISO 8601)
- agentId: string (UUID)
- action: "MOVE" | "TALK" | "INTERACT"
- data: Record<string, any>

## Rate Limiting

Rate limiting details will be added in future versions.

## Versioning

API versioning will be implemented in future releases using URL prefixing (e.g., /api/v1/).

## Pagination

Endpoints that return collections support pagination using the following query parameters:
- page: number (default: 1)
- pageSize: number (default: 20)

Response includes metadata:
```json
{
  "meta": {
    "total": "number",
    "page": "number",
    "pageSize": "number",
    "totalPages": "number"
  }
}
```