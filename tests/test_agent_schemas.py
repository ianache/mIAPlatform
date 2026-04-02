import pytest
from src.backend.models.agent_schemas import AgentCreate, CapabilityToggle


def test_agent_create_valid():
    agent_data = {
        "name": "Test Agent",
        "description": "Test description",
        "provider": "openai",
        "model": "gpt-4",
        "temperature": 0.7,
        "capabilities": ["web_search"],
    }
    agent = AgentCreate(**agent_data)
    assert agent.name == "Test Agent"
    assert agent.provider == "openai"
    assert agent.capabilities == ["web_search"]


def test_agent_create_missing_required_name():
    with pytest.raises(Exception):
        AgentCreate(provider="openai", model="gpt-4")


def test_capability_toggle_serialization():
    toggle = CapabilityToggle(capability_name="web_search", enabled=True)
    assert toggle.capability_name == "web_search"
    assert toggle.enabled is True
