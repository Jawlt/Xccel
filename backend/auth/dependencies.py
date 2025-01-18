from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from auth.auth0 import decode_jwt_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        user = decode_jwt_token(token)
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication required.")
