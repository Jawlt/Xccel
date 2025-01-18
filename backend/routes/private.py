import requests
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth.auth0 import decode_jwt_token
import os

router = APIRouter()
security = HTTPBearer()

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")

def get_user_info(token: str):
    """Fetch user information from Auth0."""
    userinfo_url = f"https://{AUTH0_DOMAIN}/userinfo"
    try:
        response = requests.get(
            userinfo_url,
            headers={"Authorization": f"Bearer {token}"}
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user info: {e}")

@router.get("/")
def private_route(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user_info = decode_jwt_token(token)

    # Optionally fetch additional user details from Auth0
    detailed_user_info = get_user_info(token)

    return {
        "message": "Access granted to private route",
        "user": {
            "id": user_info.get("sub"),
            "email": detailed_user_info.get("email", "N/A"),
            "name": detailed_user_info.get("name", "N/A"),
            "picture": detailed_user_info.get("picture", "N/A"),
        },
    }
