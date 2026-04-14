import httpx
import os
from dotenv import load_dotenv

load_dotenv()

LNBITS_URL = os.getenv("LNBITS_URL", "https://demo.lnbits.com")
LNBITS_INVOICE_KEY = os.getenv("LNBITS_INVOICE_KEY")
LNBITS_ADMIN_KEY = os.getenv("LNBITS_ADMIN_KEY")

async def create_ln_invoice(amount_sats: int, memo: str = "Chama Vault Deposit"):
    """
    Creates a Lightning invoice via LNbits.
    """
    url = f"{LNBITS_URL}/api/v1/payments"
    headers = {"X-Api-Key": LNBITS_INVOICE_KEY}
    payload = {
        "out": False,
        "amount": amount_sats,
        "memo": memo,
        "unit": "sat"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            # data contains 'payment_request', 'payment_hash', 'checking_id'
            return data
        except Exception as e:
            print(f"LNbits Error: {e}")
            raise Exception("Could not create Lightning invoice")

async def check_invoice_status(payment_hash: str):
    """
    Checks if an invoice has been paid.
    """
    url = f"{LNBITS_URL}/api/v1/payments/{payment_hash}"
    headers = {"X-Api-Key": LNBITS_INVOICE_KEY}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            # data['paid'] is a boolean
            return data.get("paid", False)
        except Exception as e:
            print(f"LNbits Status Check Error: {e}")
            return False

async def pay_invoice(bolt11: str):
    """
    Pays a Lightning invoice (Withdrawal/Send).
    Requires Admin Key.
    """
    url = f"{LNBITS_URL}/api/v1/payments"
    headers = {"X-Api-Key": LNBITS_ADMIN_KEY}
    payload = {
        "out": True,
        "bolt11": bolt11
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers, timeout=20)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"LNbits Payment Error: {e}")
            raise Exception("Failed to pay Lightning invoice")
