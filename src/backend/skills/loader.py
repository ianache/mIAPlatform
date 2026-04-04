"""Skills loader for Google ADK integration.

Loads skills dynamically from SKILLS_PATH directory.
Each skill must follow Anthropic's standard structure:
- SKILL.md: Skill definition with YAML frontmatter
- skills.json: Available tools
- scripts/: Python tool implementations (Anthropic standard)
"""

import os
import sys
import json
import yaml
import importlib.util
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class ToolDefinition:
    """Definition of a tool/skill following Anthropic standard."""
    name: str
    description: str
    parameters: Dict[str, Any]
    handler: Optional[Callable] = None


@dataclass
class Skill:
    """A skill with its tools and metadata."""
    name: str
    description: str
    version: str
    author: str
    tools: List[ToolDefinition] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


class SkillsLoader:
    """Dynamic loader for skills from filesystem."""

    def __init__(self, skills_path: str):
        self.skills_path = Path(skills_path)
        self.skills: Dict[str, Skill] = {}
        self._loaded_modules: Dict[str, Any] = {}

    def load_all_skills(self) -> Dict[str, Skill]:
        """Load all skills from the skills directory."""
        if not self.skills_path.exists():
            logger.warning(f"Skills path does not exist: {self.skills_path}")
            return self.skills

        for skill_dir in self.skills_path.iterdir():
            if skill_dir.is_dir() and not skill_dir.name.startswith('.'):
                try:
                    skill = self._load_skill(skill_dir)
                    if skill:
                        self.skills[skill.name] = skill
                        logger.info(f"Loaded skill: {skill.name} with {len(skill.tools)} tools")
                except Exception as e:
                    logger.error(f"Failed to load skill from {skill_dir}: {e}")

        return self.skills

    def _load_skill(self, skill_dir: Path) -> Optional[Skill]:
        """Load a single skill from its directory."""
        dir_name = skill_dir.name

        # Load SKILL.md
        skill_md_path = skill_dir / "SKILL.md"
        if not skill_md_path.exists():
            logger.warning(f"SKILL.md not found in {skill_dir}")
            return None

        skill_md_content = skill_md_path.read_text(encoding='utf-8')
        skill_metadata = self._parse_skill_md(skill_md_content)
        
        # Use name from YAML frontmatter if available, otherwise use directory name
        skill_name = skill_metadata.get('name', dir_name)

        # Load skills.json
        skills_json_path = skill_dir / "skills.json"
        if not skills_json_path.exists():
            logger.warning(f"skills.json not found in {skill_dir}")
            return None

        with open(skills_json_path, 'r', encoding='utf-8') as f:
            tools_config = json.load(f)

        # Load tools from scripts directory (Anthropic standard)
        scripts_dir = skill_dir / "scripts"
        tools = self._load_tools(skill_name, scripts_dir, tools_config)

        skill = Skill(
            name=skill_name,
            description=skill_metadata.get('description', ''),
            version=skill_metadata.get('version', '1.0.0'),
            author=skill_metadata.get('author', 'Unknown'),
            tools=tools,
            metadata=skill_metadata
        )

        logger.info(f"Skill loaded: {skill}")

        return skill

    def _parse_skill_md(self, content: str) -> Dict[str, Any]:
        """Parse SKILL.md content to extract metadata from YAML frontmatter.
        
        Following Anthropic's standard format:
        ---
        name: skill-name
        description: What it does
        ---
        """
        metadata = {}
        
        # Check for YAML frontmatter delimited by ---
        if content.startswith('---'):
            # Find the end of YAML frontmatter
            lines = content.split('\n')
            yaml_lines = []
            in_yaml = False
            
            for i, line in enumerate(lines):
                if line.strip() == '---':
                    if not in_yaml:
                        in_yaml = True
                        continue
                    else:
                        # End of YAML frontmatter
                        break
                if in_yaml:
                    yaml_lines.append(line)
            
            # Parse YAML frontmatter
            if yaml_lines:
                try:
                    yaml_content = '\n'.join(yaml_lines)
                    metadata = yaml.safe_load(yaml_content) or {}
                except yaml.YAMLError as e:
                    logger.warning(f"Failed to parse YAML frontmatter: {e}")
        
        # Extract remaining content as description if not in YAML
        if 'description' not in metadata:
            # Try to find description in markdown body
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('## Description') or line.startswith('### Description'):
                    # Next non-empty line is the description
                    for next_line in lines[i+1:]:
                        if next_line.strip() and not next_line.startswith('#'):
                            metadata['description'] = next_line.strip()
                            break
                    break
            else:
                # If no ## Description section, use first paragraph after frontmatter
                content_without_frontmatter = content
                if content.startswith('---'):
                    parts = content.split('---', 2)
                    if len(parts) >= 3:
                        content_without_frontmatter = parts[2].strip()
                
                # Get first non-empty, non-header line
                for line in content_without_frontmatter.split('\n'):
                    stripped = line.strip()
                    if stripped and not stripped.startswith('#') and not stripped.startswith('---'):
                        metadata['description'] = stripped
                        break
        
        # Extract title from first heading if not in YAML
        if 'title' not in metadata and 'name' not in metadata:
            lines = content.split('\n')
            for line in lines:
                if line.startswith('# '):
                    metadata['title'] = line[2:].strip()
                    break
        
        # Set defaults
        metadata.setdefault('version', '1.0.0')
        metadata.setdefault('author', 'Unknown')
        
        return metadata

    def _load_tools(self, skill_name: str, scripts_dir: Path, tools_config: Dict) -> List[ToolDefinition]:
        """Load tool implementations from scripts directory (Anthropic standard)."""
        tools = []

        logger.info(f"Loading skills: SKILL {skill_name}")

        if not scripts_dir.exists():
            logger.warning(f"Scripts directory not found: {scripts_dir}")
            return tools

        # Add scripts directory to Python path for imports
        logger.info(f"Script Directory: {scripts_dir}")
        if str(scripts_dir) not in sys.path:
            sys.path.insert(0, str(scripts_dir.parent))

        logger.info(f"Script Directory: {tools_config}")
        for tool_config in tools_config.get('tools', []):
            tool_name = tool_config['name']
            tool_file = scripts_dir / f"{tool_name}.py"
            
            logger.info(f"Tool File: {tool_file}")

            handler = None
            if tool_file.exists():
                try:
                    handler = self._load_tool_handler(skill_name, tool_name, tool_file)
                except Exception as e:
                    logger.error(f"Failed to load tool {tool_name}: {e}")

            tools.append(ToolDefinition(
                name=tool_name,
                description=tool_config.get('description', ''),
                parameters=tool_config.get('parameters', {}),
                handler=handler
            ))

        return tools

    def _load_tool_handler(self, skill_name: str, tool_name: str, tool_file: Path) -> Callable:
        """Dynamically load a tool handler from Python file."""
        module_name = f"{skill_name}.scripts.{tool_name}"
        logger.info(f"Loading tool for module name: {module_name}")

        spec = importlib.util.spec_from_file_location(module_name, tool_file)
        if not spec or not spec.loader:
            raise ImportError(f"Cannot load module from {tool_file}")

        module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = module
        spec.loader.exec_module(module)

        # Look for execute function or Tool class
        if hasattr(module, 'execute'):
            return module.execute
        elif hasattr(module, 'Tool'):
            tool_instance = module.Tool()
            if hasattr(tool_instance, 'execute'):
                return tool_instance.execute
            return tool_instance
        else:
            raise AttributeError(f"No execute function or Tool class found in {tool_file}")

    def get_skill(self, name: str) -> Optional[Skill]:
        """Get a loaded skill by name."""
        return self.skills.get(name)

    def get_all_tools(self) -> List[ToolDefinition]:
        """Get all tools from all loaded skills."""
        tools = []
        for skill in self.skills.values():
            tools.extend(skill.tools)
        return tools

    def get_tools_for_agent(self) -> List[Dict[str, Any]]:
        """Get tools formatted for Google ADK agent."""
        adk_tools = []

        for skill in self.skills.values():
            for tool in skill.tools:
                adk_tool = {
                    "name": f"{skill.name}.{tool.name}",
                    "description": tool.description,
                    "parameters": tool.parameters,
                    "handler": tool.handler
                }
                adk_tools.append(adk_tool)

        return adk_tools


# Global skills loader instance
_skills_loader: Optional[SkillsLoader] = None


def get_skills_loader(skills_path: Optional[str] = None) -> SkillsLoader:
    """Get or create global skills loader instance."""
    global _skills_loader

    if _skills_loader is None:
        if skills_path is None:
            from src.backend.core.config import get_settings
            skills_path = get_settings().SKILLS_PATH

        _skills_loader = SkillsLoader(skills_path)
        _skills_loader.load_all_skills()

    return _skills_loader


def reload_skills() -> SkillsLoader:
    """Reload all skills from disk."""
    global _skills_loader
    _skills_loader = None
    return get_skills_loader()
