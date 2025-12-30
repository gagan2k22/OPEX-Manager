from fastapi.testclient import TestClient
import sys
import os

# Add parent path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.utils.security import get_current_user
from app.models.schemas import User

# Mock User
def mock_get_current_user():
    return User(id=1, email="admin@example.com", is_active=True, roles=["Admin"])

app.dependency_overrides[get_current_user] = mock_get_current_user

client = TestClient(app)

print("--- Testing API Endpoints ---")

# 1. Health
try:
    resp = client.get("/api/health")
    print(f"Health: {resp.status_code} - {resp.json()}")
except Exception as e:
    print(f"Health Failed: {e}")

# 2. Currencies
try:
    resp = client.get("/api/master/currencies")
    print(f"Currencies: {resp.status_code}")
    data = resp.json()
    if isinstance(data, list):
        print(f"Count: {len(data)}")
        if len(data) > 0:
            print(f"First: {data[0]}")
    else:
        print(f"Response: {data}")
except Exception as e:
    print(f"Currencies Failed: {e}")

# 3. Budget Tracker
try:
    # Use valid query params if needed
    resp = client.get("/api/budgets/tracker?fy=FY2024") # Assuming FY2024
    print(f"Tracker: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        # Expecting {items: [], total: ...} or just []?
        # Check budgets.py. get_budgets returns Page[ServiceMaster]? or list?
        # It's usually paginated.
        print(f"Response Keys: {data.keys() if isinstance(data, dict) else 'List'}")
        if isinstance(data, dict) and 'items' in data:
             print(f"Items Count: {len(data['items'])}")
             if len(data['items']) > 0:
                 print(f"First Item ID: {data['items'][0].get('id')}")
                 print(f"First Item Currency: {data['items'][0].get('currency')}")
    else:
        print(f"Error: {resp.text}")
except Exception as e:
    print(f"Tracker Failed: {e}")
