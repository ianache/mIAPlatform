"""Redis Stream Explorer tool implementation."""

import os
import json
import logging
import sys
from typing import Dict, Any, List
import redis

logger = logging.getLogger(__name__)

def execute(stream_name: str, count: int = 10, start_id: str = "0-0") -> str:
    """Read entries from a Redis Stream.

    Args:
        stream_name: Name of the Redis stream.
        count: Number of entries to fetch.
        start_id: Starting ID for retrieval.

    Returns:
        JSON string with stream entries.
    """
    logger.info(f"Exploring Redis stream: {stream_name} (count={count}, start={start_id})")

    try:
        # Get Redis connection params from env
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        redis_password = os.getenv("REDIS_PASSWORD")
        
        # Check if password is provided and update URL
        if redis_password and "@" not in redis_url:
            from urllib.parse import urlparse, urlunparse
            url = urlparse(redis_url)
            netloc = f":{redis_password}@{url.hostname}"
            if url.port:
                netloc += f":{url.port}"
            redis_url = urlunparse((url.scheme, netloc, url.path, url.params, url.query, url.fragment))

        r = redis.from_url(redis_url, decode_responses=True)

        # Read from stream
        entries = r.xread({stream_name: start_id}, count=count)
        
        if not entries:
            return json.dumps({"message": f"Stream '{stream_name}' not found or empty."}, indent=2)

        # entries format: [[stream_name, [[id, {fields}]]]]
        result = []
        for s_name, s_entries in entries:
            for entry_id, fields in s_entries:
                result.append({
                    "id": entry_id,
                    "data": fields
                })

        return json.dumps({
            "stream": stream_name,
            "entries_count": len(result),
            "entries": result
        }, indent=2, ensure_ascii=False)

    except Exception as e:
        logger.error(f"Error exploring Redis stream: {e}")
        return json.dumps({"error": str(e)}, indent=2)

if __name__ == "__main__":
    # Test execution
    if len(sys.argv) > 1:
        print(execute(sys.argv[1]))
    else:
        print("Usage: python explore_stream.py <stream_name>")
