from flask import Flask, request, jsonify, send_from_directory
import requests
import os
from datetime import datetime, timedelta
import logging
from functools import wraps
from dotenv import load_dotenv
from flask_caching import Cache

# Load environment variables from .env file
load_dotenv()


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder="build", static_url_path="")

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_ORG_ID = os.getenv("OPENAI_ORG_ID", None)

# Cache configuration
app.config["CACHE_TYPE"] = "simple"
app.config["CACHE_DEFAULT_TIMEOUT"] = 3600  # 1 hour in seconds
cache = Cache(app)

# OpenAI API endpoints
OPENAI_COSTS_URL = "https://api.openai.com/v1/organization/costs"
OPENAI_PROJECTS_URL = "https://api.openai.com/v1/organization/projects"


def require_api_key(f):
    """Decorator to check if OpenAI API key is configured"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not OPENAI_API_KEY:
            return (
                jsonify(
                    {
                        "error": "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
                    }
                ),
                500,
            )
        return f(*args, **kwargs)

    return decorated_function


def get_openai_headers():
    """Get headers for OpenAI API requests"""
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    if OPENAI_ORG_ID:
        headers["OpenAI-Organization"] = OPENAI_ORG_ID
    return headers


def generate_cache_key(endpoint: str, params: dict = None) -> str:
    """Generate a unique cache key based on endpoint and parameters"""
    import json
    import hashlib

    key_data = {"endpoint": endpoint, "params": params or {}}
    key_string = json.dumps(key_data, sort_keys=True)
    return hashlib.md5(key_string.encode()).hexdigest()


@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/status")
def api_status():
    """API status endpoint"""
    return jsonify(
        {
            "status": "running",
            "message": "OpenAI Usage API is running",
            "endpoints": {"costs": "/costs", "projects": "/projects"},
            "timestamp": datetime.now().isoformat(),
        }
    )


@app.route("/costs", methods=["GET"])
@require_api_key
def get_costs():
    """Get OpenAI costs data"""
    try:
        # Get query parameters
        start_time = request.args.get("start_time")
        end_time = request.args.get("end_time")
        bucket_width = request.args.get("bucket_width", "1d")
        group_by = request.args.getlist(
            "group_by"
        )  # Support multiple group_by parameters
        limit = request.args.get("limit", "7")
        page = request.args.get("page")
        project_ids = request.args.getlist(
            "project_ids"
        )  # Support multiple project_ids

        # Validate required parameters
        if not start_time:
            return (
                jsonify({"error": "start_time parameter is required (Unix seconds)"}),
                400,
            )

        # Normalize end_time to end of day for better caching
        if end_time:
            # Convert end_time to datetime and set to end of day (23:59:59)
            end_datetime = datetime.fromtimestamp(int(end_time))
            end_of_day = end_datetime.replace(
                hour=23, minute=59, second=59, microsecond=999999
            )
            normalized_end_time = int(end_of_day.timestamp())
        else:
            # If no end_time provided, use current time
            normalized_end_time = int(datetime.now().timestamp())

        # Build request parameters
        params = {
            "start_time": start_time,
            "bucket_width": bucket_width,
            "limit": limit,
        }

        # Always use normalized end_time for consistent caching
        params["end_time"] = normalized_end_time

        if group_by:
            params["group_by"] = group_by

        if page:
            params["page"] = page

        if project_ids:
            params["project_ids"] = project_ids

        # Generate cache key based on normalized parameters only
        cache_key = generate_cache_key("/costs", params)

        # Check cache first
        cached_response = cache.get(cache_key)
        if cached_response:
            logger.info(f"Cache hit for key: {cache_key}")
            return jsonify(cached_response)

        # If not in cache, make API request
        response = requests.get(
            OPENAI_COSTS_URL,
            headers=get_openai_headers(),
            params=params,
            timeout=60,
        )

        if response.status_code == 200:
            response_data = response.json()
            # Cache the successful response
            cache.set(cache_key, response_data)
            logger.info(f"Cached response for key: {cache_key}")
            return jsonify(response_data)
        else:
            logger.error(f"OpenAI API error: {response.status_code} - {response.text}")
            return (
                jsonify(
                    {
                        "error": f"OpenAI API error: {response.status_code}",
                        "details": response.text,
                    }
                ),
                response.status_code,
            )

    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        return (
            jsonify({"error": "Failed to connect to OpenAI API", "details": str(e)}),
            500,
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.route("/projects", methods=["GET"])
@require_api_key
def get_projects():
    """Get OpenAI projects list"""
    try:
        # Get query parameters
        after = request.args.get("after")
        include_archived = request.args.get("include_archived", "false")
        limit = request.args.get("limit", "20")

        # Build request parameters
        params = {"include_archived": include_archived, "limit": limit}

        if after:
            params["after"] = after

        # Generate cache key based on all parameters
        cache_key = generate_cache_key("/projects", params)

        # Check cache first
        cached_response = cache.get(cache_key)
        if cached_response:
            logger.info(f"Cache hit for key: {cache_key}")
            return jsonify(cached_response)

        # If not in cache, make API request
        response = requests.get(
            OPENAI_PROJECTS_URL, headers=get_openai_headers(), params=params, timeout=30
        )

        if response.status_code == 200:
            response_data = response.json()
            # Cache the successful response
            cache.set(cache_key, response_data)
            logger.info(f"Cached response for key: {cache_key}")
            return jsonify(response_data)
        else:
            logger.error(f"OpenAI API error: {response.status_code} - {response.text}")
            return (
                jsonify(
                    {
                        "error": f"OpenAI API error: {response.status_code}",
                        "details": response.text,
                    }
                ),
                response.status_code,
            )

    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        return (
            jsonify({"error": "Failed to connect to OpenAI API", "details": str(e)}),
            500,
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":  #
    app.run(debug=True, host="0.0.0.0", port=5000)
