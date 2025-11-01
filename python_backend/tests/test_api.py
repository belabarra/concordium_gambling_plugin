import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_user_registration():
    response = client.post("/api/register", json={"name": "John Doe", "age": 30})
    assert response.status_code == 201
    assert "user_id" in response.json()

def test_transaction_tracking():
    response = client.post("/api/transactions", json={"user_id": 1, "amount": 100})
    assert response.status_code == 200
    assert response.json()["message"] == "Transaction recorded."

def test_limit_enforcement():
    response = client.post("/api/limits", json={"user_id": 1, "limit": 500})
    assert response.status_code == 200
    assert response.json()["message"] == "Limit set successfully."

def test_self_exclusion():
    response = client.post("/api/self-exclusion", json={"user_id": 1})
    assert response.status_code == 200
    assert response.json()["message"] == "User self-excluded successfully."

def test_cooldown_period():
    response = client.post("/api/cooldown", json={"user_id": 1, "duration": 30})
    assert response.status_code == 200
    assert response.json()["message"] == "Cooldown period set."