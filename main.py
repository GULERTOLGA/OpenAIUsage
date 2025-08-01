from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import os
from datetime import datetime, timedelta
import logging
from functools import wraps
from dotenv import load_dotenv, find_dotenv
from flask_caching import Cache
import jwt
from werkzeug.security import check_password_hash, generate_password_hash
from database import (
    init_database,
    verify_user_credentials,
    get_user_by_username,
    update_user_password,
)


# Load environment variables from .env file if it exists
dotenv_path = find_dotenv(usecwd=True)
if dotenv_path:
    print(f"Loading .env from: {dotenv_path}")
    load_dotenv(dotenv_path=dotenv_path, override=True)
else:
    print("No .env file found, using environment variables")
    load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY or OPENAI_API_KEY == "Your_OpenAI_API_Key_Here":
    raise EnvironmentError(
        "OPENAI_API_KEY değeri bulunamadı veya geçersiz! "
        "Lütfen .env dosyasını doğru API key ile güncelleyin."
    )

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder="build", static_url_path="")

# JWT Configuration
app.config["SECRET_KEY"] = os.getenv(
    "SECRET_KEY", "your-secret-key-change-this-in-production"
)
app.config["JWT_ALGORITHM"] = "HS256"
app.config["JWT_EXPIRATION_HOURS"] = 24

# Enable CORS for development
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

# Configuration
OPENAI_ORG_ID = os.getenv("OPENAI_ORG_ID", None)

print(OPENAI_API_KEY)

print("Current working dir:", os.getcwd())
print(".env exists:", os.path.exists(".env"))
print(app.config["SECRET_KEY"])

# Cache configuration
app.config["CACHE_TYPE"] = "simple"
app.config["CACHE_DEFAULT_TIMEOUT"] = 3600  # 1 hour in seconds
cache = Cache(app)

# OpenAI API endpoints
OPENAI_COSTS_URL = "https://api.openai.com/v1/organization/costs"
OPENAI_PROJECTS_URL = "https://api.openai.com/v1/organization/projects"


def require_jwt(f):
    """Decorator to check JWT token"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None

        # Get token from Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Token is missing"}), 401

        try:
            # Decode token
            payload = jwt.decode(
                token,
                app.config["SECRET_KEY"],
                algorithms=[app.config["JWT_ALGORITHM"]],
            )
            current_user = payload["username"]

            # Check if user exists in database
            user = get_user_by_username(current_user)
            if not user:
                return jsonify({"error": "Invalid token"}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated_function


def get_current_user_from_token():
    """Helper function to get current user from JWT token"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(
                token,
                app.config["SECRET_KEY"],
                algorithms=[app.config["JWT_ALGORITHM"]],
            )
            return get_user_by_username(payload["username"])
        except:
            return None
    return None


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


@app.route("/api/login", methods=["POST"])
def login():
    """Login endpoint to get JWT token"""
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        # Verify credentials using database
        user = verify_user_credentials(username, password)
        if user:
            # Generate token
            payload = {
                "username": user["username"],
                "role": user["role"],
                "user_id": user["id"],
                "exp": datetime.utcnow()
                + timedelta(hours=app.config["JWT_EXPIRATION_HOURS"]),
            }

            token = jwt.encode(
                payload, app.config["SECRET_KEY"], algorithm=app.config["JWT_ALGORITHM"]
            )

            return jsonify(
                {
                    "token": token,
                    "username": user["username"],
                    "first_name": user["first_name"],
                    "last_name": user["last_name"],
                    "role": user["role"],
                    "expires_in": app.config["JWT_EXPIRATION_HOURS"] * 3600,  # seconds
                }
            )
        else:
            return jsonify({"error": "Invalid username or password"}), 401

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/api/change-password", methods=["POST"])
@require_jwt
def change_password():
    """Change password endpoint"""
    try:
        data = request.get_json()
        current_password = data.get("current_password")
        new_password = data.get("new_password")

        if not current_password or not new_password:
            return (
                jsonify({"error": "Current password and new password are required"}),
                400,
            )

        # Get current user from token
        current_user = get_current_user_from_token()
        if not current_user:
            return jsonify({"error": "Invalid token"}), 401

        # Verify current password
        if not check_password_hash(current_user["password_hash"], current_password):
            return jsonify({"error": "Current password is incorrect"}), 400

        # Validate new password (basic validation)
        if len(new_password) < 6:
            return (
                jsonify({"error": "New password must be at least 6 characters long"}),
                400,
            )

        # Update password
        success, message = update_user_password(current_user["id"], new_password)

        if success:
            return jsonify({"message": "Password changed successfully"}), 200
        else:
            return jsonify({"error": message}), 500

    except Exception as e:
        logger.error(f"Password change error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/api/status")
def api_status_with_prefix():
    """API status endpoint with /api prefix"""
    return jsonify(
        {
            "status": "running",
            "message": "OpenAI Usage API is running",
            "endpoints": {
                "login": "/api/login",
                "change_password": "/api/change-password",
                "costs": "/api/costs",
                "projects": "/api/projects",
            },
            "timestamp": datetime.now().isoformat(),
        }
    )


@app.route("/api/costs", methods=["GET"])
@require_jwt
@require_api_key
def get_costs_with_prefix():
    """Get OpenAI costs data with /api prefix"""
    return get_costs()


@app.route("/api/projects", methods=["GET"])
@require_jwt
@require_api_key
def get_projects_with_prefix():
    """Get OpenAI projects list with /api prefix"""
    return get_projects()


@app.route("/costs", methods=["GET"])
@require_jwt
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
@require_jwt
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


if __name__ == "__main__":
    # Initialize database before starting the app
    try:
        init_database()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise

    app.run(debug=True, host="0.0.0.0", port=5000)
