"""Skills catalog endpoints."""

import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
import httpx
import yaml

router = APIRouter(prefix="/skills", tags=["skills"])
logger = logging.getLogger(__name__)

# GitHub repository configuration
GITHUB_REPO = "ianache/skills-catalog"
CATALOG_FILE = "catalog.yaml"
GITHUB_RAW_URL = f"https://raw.githubusercontent.com/{GITHUB_REPO}/main/{CATALOG_FILE}"


class SkillInfo:
    """Skill information from catalog."""
    def __init__(
        self,
        name: str,
        description: str,
        version: str,
        status: str,
        path: str
    ):
        self.name = name
        self.description = description
        self.version = version
        self.status = status
        self.path = path


@router.get("/catalog", response_model=dict)
async def get_skills_catalog():
    """Fetch skills catalog from GitHub repository.
    
    Returns the catalog of available skills from the public GitHub repository.
    Only active skills are returned.
    """
    try:
        logger.info(f"Fetching skills catalog from: {GITHUB_RAW_URL}")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(GITHUB_RAW_URL, timeout=10.0)
            
        if response.status_code != 200:
            logger.error(f"Failed to fetch catalog: {response.status_code}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to fetch skills catalog from GitHub: {response.status_code}"
            )
        
        # Parse YAML
        catalog_data = yaml.safe_load(response.text)
        
        if not catalog_data or 'skills' not in catalog_data:
            logger.error("Invalid catalog format: missing 'skills' key")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Invalid catalog format from GitHub"
            )
        
        skills = catalog_data['skills']
        
        # Filter only active skills and format response
        active_skills = []
        for skill in skills:
            if skill.get('status') == 'active':
                active_skills.append({
                    'id': skill.get('name', '').lower().replace(' ', '_').replace('-', '_'),
                    'name': skill.get('name', ''),
                    'description': skill.get('description', ''),
                    'version': skill.get('version', ''),
                    'status': skill.get('status', ''),
                    'path': skill.get('path', ''),
                    'github_url': f"https://github.com/{GITHUB_REPO}/tree/main/{skill.get('path', '')}"
                })
        
        logger.info(f"Successfully fetched {len(active_skills)} active skills")
        
        return {
            'skills': active_skills,
            'total': len(active_skills),
            'repository': f"https://github.com/{GITHUB_REPO}",
            'last_updated': catalog_data.get('last_updated', None)
        }
        
    except yaml.YAMLError as e:
        logger.error(f"Failed to parse catalog YAML: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to parse skills catalog"
        )
    except httpx.RequestError as e:
        logger.error(f"Network error fetching catalog: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Network error fetching skills catalog"
        )
    except Exception as e:
        logger.error(f"Unexpected error fetching catalog: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch skills catalog: {str(e)}"
        )


@router.get("/catalog/{skill_id}", response_model=dict)
async def get_skill_detail(skill_id: str):
    """Get detailed information about a specific skill.
    
    Args:
        skill_id: The skill ID (normalized name)
    """
    try:
        # Fetch full catalog
        catalog_response = await get_skills_catalog()
        skills = catalog_response['skills']
        
        # Find specific skill
        skill = next((s for s in skills if s['id'] == skill_id), None)
        
        if not skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Skill '{skill_id}' not found or not active"
            )
        
        return skill
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching skill detail: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch skill details: {str(e)}"
        )
