#!/usr/bin/env python3
"""
Simple test script to verify API endpoints are working correctly
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BASE_URL = "http://127.0.0.1:5000"
API_KEY = os.getenv("OPENAI_API_KEY")


def test_api_status():
    """Test the API status endpoint"""
    print("Testing API status...")
    try:
        response = requests.get(f"{BASE_URL}/api/status")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Response:", json.dumps(response.json(), indent=2))
        else:
            print("Error response:", response.text)
    except Exception as e:
        print(f"Error: {e}")
    print()


def test_projects_endpoint():
    """Test the projects endpoint"""
    print("Testing projects endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/projects")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data.get('data', []))} projects")
            print("Response keys:", list(data.keys()))
        else:
            print("Error response:", response.text)
    except Exception as e:
        print(f"Error: {e}")
    print()


def test_costs_endpoint():
    """Test the costs endpoint"""
    print("Testing costs endpoint...")
    try:
        # Use a recent date range
        import time

        end_time = int(time.time())
        start_time = end_time - (7 * 24 * 60 * 60)  # 7 days ago

        params = {
            "start_time": start_time,
            "end_time": end_time,
            "group_by": "project_id",
            "limit": "7",
        }

        response = requests.get(f"{BASE_URL}/costs", params=params)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Response keys:", list(data.keys()))
            if "data" in data:
                print(f"Found {len(data['data'])} cost entries")
        else:
            print("Error response:", response.text)
    except Exception as e:
        print(f"Error: {e}")
    print()


def test_direct_endpoints():
    """Test endpoints without /api prefix"""
    print("Testing direct endpoints (without /api prefix)...")

    # Test projects
    try:
        response = requests.get(f"{BASE_URL}/projects")
        print(f"Projects endpoint: {response.status_code}")
    except Exception as e:
        print(f"Projects endpoint error: {e}")

    # Test costs
    try:
        response = requests.get(f"{BASE_URL}/costs")
        print(f"Costs endpoint: {response.status_code}")
    except Exception as e:
        print(f"Costs endpoint error: {e}")
    print()


if __name__ == "__main__":
    print("=" * 50)
    print("API Testing Script")
    print("=" * 50)

    if not API_KEY:
        print("Warning: OPENAI_API_KEY not found in environment variables")
        print("Some endpoints may return errors")
    else:
        print("OpenAI API Key found")

    print()

    # Test all endpoints
    test_api_status()
    test_direct_endpoints()
    test_projects_endpoint()
    test_costs_endpoint()

    print("=" * 50)
    print("Testing complete")
    print("=" * 50)
