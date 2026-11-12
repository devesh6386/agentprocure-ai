import os
import requests
import time
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_SECRET = os.getenv("PAYPAL_SECRET")
PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com"

# Token Caching
_cached_token = None
_token_expiry = 0

def get_paypal_access_token():
    global _cached_token, _token_expiry
    if _cached_token and time.time() < _token_expiry:
        return _cached_token
        
    url = f"{PAYPAL_BASE_URL}/v1/oauth2/token"
    res = requests.post(url, auth=(PAYPAL_CLIENT_ID, PAYPAL_SECRET), data={"grant_type": "client_credentials"})
    res.raise_for_status()
    data = res.json()
    
    _cached_token = data["access_token"]
    _token_expiry = time.time() + data["expires_in"] - 60
    return _cached_token

def create_paypal_order(amount: float, idempotency_key: str):
    url = f"{PAYPAL_BASE_URL}/v2/checkout/orders"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {get_paypal_access_token()}",
        "PayPal-Request-Id": f"create_{idempotency_key}"
    }
    payload = {
        "intent": "CAPTURE",
        "purchase_units": [{"amount": {"currency_code": "USD", "value": f"{amount:.2f}"}}]
    }
    res = requests.post(url, headers=headers, json=payload)
    res.raise_for_status()
    return res.json()

def capture_paypal_order(order_id: str, idempotency_key: str):
    url = f"{PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {get_paypal_access_token()}",
        "PayPal-Request-Id": f"cap_{idempotency_key}"
    }
    res = requests.post(url, headers=headers)
    res.raise_for_status()
    return res.json()