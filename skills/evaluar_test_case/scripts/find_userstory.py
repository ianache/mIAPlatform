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

def execute(project_id: int,userstory_code: str) -> Dict[str, Any]:
    """Find user story in project by code.  

    Args:
        project_id: Project ID
        userstory_code: User story code

    Returns:
        Dictionary with user story information
    """
    logger.info(f"Getting user story information for project {project_id} and user story {userstory_code}")

    try:
        client = GitLabClient(
            base_url=os.getenv('GITLAB_URL', 'https://project.comsatel.com.pe'),
            private_token=os.getenv('GITLAB_TOKEN')
        )

        project = client.projects.get(project_id)
        issues = project.issues.list(search=userstory_code,labels["UserStory"],get_all=True)
        if(len(issues)>=0):
            issue = issues[0]
            
            return json.dumps({
                'id': issue.id,
                'iid': issue.iid,
                'title': issue.title,
                'description': issue.description
            }, indent=2, ensure_ascii=False)
        else:
            return json.dumps({
                'message': 'No se encontro la user story'
            }, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Error: {e}")
        raise
    finally:
        if isinstance(client, GitLabClient):
            client.close()
