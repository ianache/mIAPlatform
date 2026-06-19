"""Get test case information from GitLab."""

import sys
import os
import json  
from typing import Dict, Any
from skills.evaluar_test_case.scripts.gitlab_client import GitLabClient
import logging

log_format = "%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s"
logging.basicConfig(
    level=logging.INFO,
    format=log_format,
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout) # Asegura que salgan por consola
    ]
)

logger = logging.getLogger(__name__)

def execute(name: str) -> Dict[str, Any]:
    """Find project in GitLab by name.  

    Args:
        name: Project name

    Returns:
        Dictionary with project information
    """
    logger.info(f"Getting project information for project {name}")

    try:
    #    client = GitLabClient(
    #        base_url=os.getenv('GITLAB_URL', 'https://project.comsatel.com.pe'),
    #        private_token=os.getenv('GITLAB_TOKEN')
    #    )
    #
    #    project = client.get_project(project_name)
    #    return json.dumps({
    #        'id': project.id,
    #        'name': project.name,
    #        'description': project.description
    #    }, indent=2, ensure_ascii=False)
        proyectos = {
            "clocator": {
                "project_id": 63,
                "name": "CLocator",
            },
            "svrbasico": {
                "project_id": 411,
                "name": "CL2 SVRBasico",
            },
            "sigo": {
                "project_id": 65,
                "name": "SIGO",
            },
            "smarttracing": {
                "project_id": 64,
                "name": "Smart Tracing",
            }
        }
        return proyectos[name.lower().strip()]
        # return json.dumps(proyectos[project_name], indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Error: {e}")
        raise
    finally:
        if isinstance(client, GitLabClient):
            client.close()
