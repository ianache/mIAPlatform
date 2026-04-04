# Google ADK Skills System

This module provides dynamic skill loading and integration with Google ADK (Agent Development Kit) for the Orchestra platform.

## Architecture

### Skills Structure

Skills follow the **Anthropic Standard** and are organized as follows:

```
SKILLS_PATH/
├── skill-name/
│   ├── SKILL.md           # Skill definition with YAML frontmatter (Anthropic standard)
│   ├── skills.json        # Tool definitions in Anthropic format
│   └── scripts/           # Python tool implementations (Anthropic standard)
│       ├── tool1.py       # Each tool has an execute() function
│       └── tool2.py
```

### Components

1. **Skills Loader** (`loader.py`): Dynamically loads skills from filesystem, parses YAML frontmatter
2. **ADK Agent** (`adk_agent.py`): Google ADK integration with loaded skills
3. **Chat Integration** (`api/chat.py`): Uses ADK agent for streaming responses

## Configuration

Add to your `.env`:

```env
SKILLS_PATH=./skills
GOOGLE_API_KEY=your-google-api-key
GOOGLE_MODEL=gemini-3.0-flash
```

## Creating a New Skill

### 1. Create Directory Structure

```bash
mkdir -p skills/my-skill/logic
```

### 2. Create SKILL.md (Anthropic Standard Format)

Following the [Anthropic Skill Specification](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf), SKILL.md must include a YAML frontmatter section delimited by `---`:

```markdown
---
name: my-skill-name
description: What it does. Use when user asks to [specific phrases].
version: 1.0.0
author: Your Name
---

# My Skill Name

## Description
Brief description of what this skill does.

## Capabilities
- **tool1**: Description of tool1
- **tool2**: Description of tool2
```

**Required YAML Frontmatter Fields:**
- `name`: Skill identifier (kebab-case recommended)
- `description`: When to use this skill. Should include trigger phrases.
- `version`: Semantic version (e.g., 1.0.0)
- `author`: Creator name

**Optional Fields:**
- `license`: License type (e.g., MIT, Apache-2.0)
- `tags`: List of relevant tags
- `dependencies`: List of required packages

### 3. Create skills.json

```json
{
  "name": "my-skill",
  "version": "1.0.0",
  "description": "Description of the skill",
  "tools": [
    {
      "name": "tool1",
      "description": "What this tool does",
      "parameters": {
        "type": "object",
        "properties": {
          "param1": {
            "type": "string",
            "description": "Description of param1"
          }
        },
        "required": ["param1"]
      }
    }
  ]
}
```

### 4. Create Tool Implementation

Create `scripts/tool1.py`:

```python
"""Tool implementation for Google ADK."""

from typing import Dict, Any


def execute(param1: str) -> Dict[str, Any]:
    """Execute the tool.
    
    Args:
        param1: Description of parameter
        
    Returns:
        Dictionary with result
    """
    # Your logic here
    result = process_something(param1)
    
    return {
        "result": result,
        "status": "success"
    }
```

## Tool Implementation Rules

1. **File naming**: Tool files must match the name in `skills.json` (e.g., `add.py` for tool `add`)
2. **Function signature**: Must have an `execute()` function with typed parameters
3. **Return value**: Must return a dictionary with at least a `result` key
4. **Error handling**: Raise exceptions for errors; they'll be caught and returned to the agent

## Anthropic Standard Compliance

The skills system follows the [Anthropic Tool Use](https://docs.anthropic.com/claude/docs/tool-use) standard:

- **Tool definitions** use JSON Schema format in `skills.json`
- **Parameters** are strictly typed
- **Required fields** are explicitly marked
- **Descriptions** help the LLM understand when to use each tool

## API Usage

### Reload Skills

Skills are loaded at startup. To reload without restarting:

```python
from src.backend.skills import reload_skills, reload_adk_agent

# Reload skills from disk
reload_skills()

# Reload ADK agent with new skills
await reload_adk_agent()
```

### Get Available Tools

```python
from src.backend.skills import get_adk_agent

agent = await get_adk_agent()
tools = agent.get_available_tools()
```

## Example Skill: Calculator

See `skills/calculator/` for a complete example with:
- `SKILL.md`: Documentation
- `skills.json`: 4 tool definitions (add, subtract, multiply, divide)
- `scripts/*.py`: Tool implementations (Anthropic standard)

## Integration with Chat

The chat system automatically:
1. Loads all skills from `SKILLS_PATH`
2. Creates a Google ADK Agent with these skills
3. Streams responses with tool execution capabilities
4. Falls back to mock responses if ADK is not available

## Testing

To test skills without the full application:

```python
from src.backend.skills import get_skills_loader

loader = get_skills_loader('./skills')
skill = loader.get_skill('calculator')

for tool in skill.tools:
    print(f"Tool: {tool.name}")
    if tool.handler:
        result = tool.handler(a=5, b=3)
        print(f"Result: {result}")
```

## Notes

- Skills are loaded **once** at application startup for performance
- The loader uses Python's `importlib` for dynamic imports
- Tool handlers are cached after first load
- If `google_adk` is not installed, the system falls back to mock responses
