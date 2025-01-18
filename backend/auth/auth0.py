import requests
from jose import jwt
from fastapi import HTTPException
import os
from dotenv import load_dotenv

load_dotenv()

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_API_IDENTIFIER = os.getenv("AUTH0_API_IDENTIFIER")
AUTH0_PUBLIC_KEY_URL = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"

def get_public_key():
    try:
        response = requests.get(AUTH0_PUBLIC_KEY_URL)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail="Unable to fetch public keys from Auth0.")


def decode_jwt_token(token: str):
    jwks = get_public_key()
    unverified_header = jwt.get_unverified_header(token)
    rsa_key = {}

    if "kid" not in unverified_header:
        raise HTTPException(status_code=401, detail="Invalid token header.")

    for key in jwks["keys"]:
        if key["kid"] == unverified_header["kid"]:
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"]
            }

    if not rsa_key:
        raise HTTPException(status_code=401, detail="Appropriate public key not found.")

    try:
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=AUTH0_API_IDENTIFIER,
            issuer=f"https://{AUTH0_DOMAIN}/"
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except jwt.JWTClaimsError:
        raise HTTPException(status_code=401, detail="Invalid token claims.")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token.")
