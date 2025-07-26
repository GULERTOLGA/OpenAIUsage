from flask import Flask, request, jsonify, send_from_directory
import requests
import os
from datetime import datetime, timedelta
import logging
from functools import wraps
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Debug: Check if .env file is loaded
print(f"🔍 .env dosyası yüklendi mi: {os.path.exists('.env')}")
print(
    f"🔑 OPENAI_API_KEY mevcut mu: {'Evet' if os.getenv('OPENAI_API_KEY') else 'Hayır'}"
)
if os.getenv("OPENAI_API_KEY"):
    print(f"🔑 API Key uzunluğu: {len(os.getenv('OPENAI_API_KEY', ''))} karakter")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder="build", static_url_path="")

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_ORG_ID = os.getenv("OPENAI_ORG_ID", None)

# OpenAI API endpoints
OPENAI_USAGE_URL = "https://api.openai.com/v1/usage"
OPENAI_SUBSCRIPTION_URL = "https://api.openai.com/v1/dashboard/billing/subscription"
OPENAI_BILLING_URL = "https://api.openai.com/v1/dashboard/billing/usage"
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


@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "api_key_configured": bool(OPENAI_API_KEY),
        }
    )


@app.route("/usage", methods=["GET"])
@require_api_key
def get_usage():
    """Get OpenAI usage data"""
    try:
        # Get query parameters
        date = request.args.get("date", datetime.now().strftime("%Y-%m-%d"))
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")

        # Build request parameters
        params = {}
        if start_date and end_date:
            params["start_date"] = start_date
            params["end_date"] = end_date
        else:
            params["date"] = date

        # Make request to OpenAI usage API
        response = requests.get(
            OPENAI_USAGE_URL, headers=get_openai_headers(), params=params, timeout=30
        )

        if response.status_code == 200:
            return jsonify(response.json())
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


@app.route("/subscription", methods=["GET"])
@require_api_key
def get_subscription():
    """Get OpenAI subscription information"""
    try:
        response = requests.get(
            OPENAI_SUBSCRIPTION_URL, headers=get_openai_headers(), timeout=30
        )

        if response.status_code == 200:
            return jsonify(response.json())
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


@app.route("/billing", methods=["GET"])
@require_api_key
def get_billing():
    """Get OpenAI billing usage"""
    try:
        # Get query parameters
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")

        if not start_date or not end_date:
            # Default to current month
            today = datetime.now()
            start_date = today.replace(day=1).strftime("%Y-%m-%d")
            end_date = today.strftime("%Y-%m-%d")

        params = {"start_date": start_date, "end_date": end_date}

        response = requests.get(
            OPENAI_BILLING_URL, headers=get_openai_headers(), params=params, timeout=30
        )

        if response.status_code == 200:
            return jsonify(response.json())
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

        # Build request parameters
        params = {
            "start_time": start_time,
            "bucket_width": bucket_width,
            "limit": limit,
        }

        if end_time:
            params["end_time"] = end_time

        if group_by:
            params["group_by"] = group_by

        if page:
            params["page"] = page

        if project_ids:
            params["project_ids"] = project_ids

        response = requests.get(
            OPENAI_COSTS_URL, headers=get_openai_headers(), params=params, timeout=60
        )

        if response.status_code == 200:
            return jsonify(response.json())
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

        response = requests.get(
            OPENAI_PROJECTS_URL, headers=get_openai_headers(), params=params, timeout=30
        )

        if response.status_code == 200:
            return jsonify(response.json())
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


@app.route("/summary", methods=["GET"])
@require_api_key
def get_usage_summary():
    """Get a summary of OpenAI usage and billing"""
    try:
        # Get current month usage
        today = datetime.now()
        start_date = today.replace(day=1).strftime("%Y-%m-%d")
        end_date = today.strftime("%Y-%m-%d")

        # Get subscription info
        subscription_response = requests.get(
            OPENAI_SUBSCRIPTION_URL, headers=get_openai_headers(), timeout=30
        )

        # Get billing info
        billing_response = requests.get(
            OPENAI_BILLING_URL,
            headers=get_openai_headers(),
            params={"start_date": start_date, "end_date": end_date},
            timeout=30,
        )

        # Get costs info - convert dates to Unix timestamps
        start_timestamp = int(datetime.strptime(start_date, "%Y-%m-%d").timestamp())
        end_timestamp = int(datetime.strptime(end_date, "%Y-%m-%d").timestamp())

        costs_response = requests.get(
            OPENAI_COSTS_URL,
            headers=get_openai_headers(),
            params={"start_time": start_timestamp, "end_time": end_timestamp},
            timeout=60,
        )

        summary = {
            "period": {"start_date": start_date, "end_date": end_date},
            "subscription": None,
            "billing": None,
            "costs": None,
            "errors": [],
        }

        if subscription_response.status_code == 200:
            summary["subscription"] = subscription_response.json()
        else:
            summary["errors"].append(
                f"Subscription API error: {subscription_response.status_code}"
            )

        if billing_response.status_code == 200:
            summary["billing"] = billing_response.json()
        else:
            summary["errors"].append(
                f"Billing API error: {billing_response.status_code}"
            )

        if costs_response.status_code == 200:
            summary["costs"] = costs_response.json()
        else:
            summary["errors"].append(f"Costs API error: {costs_response.status_code}")

        return jsonify(summary)

    except Exception as e:
        logger.error(f"Summary error: {str(e)}")
        return jsonify({"error": "Failed to get usage summary", "details": str(e)}), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    # Check if API key is configured
    if not OPENAI_API_KEY:
        print("⚠️  UYARI: OPENAI_API_KEY bulunamadı!")
        print("=" * 50)
        print("API anahtarınızı ayarlamak için:")
        print("1. .env dosyası oluşturun: cp env.example .env")
        print("2. .env dosyasını düzenleyin ve API anahtarınızı ekleyin")
        print("3. Veya environment variable olarak ayarlayın:")
        print("   Windows: $env:OPENAI_API_KEY='your-api-key'")
        print("   Linux/Mac: export OPENAI_API_KEY='your-api-key'")
        print("=" * 50)
        print(
            "Uygulama API anahtarı olmadan çalışacak ancak OpenAI API çağrıları başarısız olacak."
        )
        print()

    # Run the Flask app
    print("🚀 Flask uygulaması başlatılıyor...")
    print("📱 Frontend: http://localhost:5000")
    print("🔧 API Endpoints: http://localhost:5000/health")
    print("=" * 50)
    app.run(debug=True, host="0.0.0.0", port=5000)
