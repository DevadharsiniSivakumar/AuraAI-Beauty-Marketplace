from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Dict, Any
from utils.firebase import verify_firebase_token

# Configure HTTPBearer extraction
security = HTTPBearer(auto_error=False)

class VerifiedUser(BaseModel):
    uid: str
    email: Optional[str] = None
    name: Optional[str] = None
    token_data: Dict[str, Any]

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[VerifiedUser]:
    """
    Optional dependency. If a valid authorization header token is provided, 
    verifies it and returns the verified user details. Otherwise, returns None.
    """
    if not credentials:
        return None
        
    token = credentials.credentials
    decoded = verify_firebase_token(token)
    
    if not decoded:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return VerifiedUser(
        uid=decoded.get("uid"),
        email=decoded.get("email"),
        name=decoded.get("name"),
        token_data=decoded
    )

async def require_auth_user(user: Optional[VerifiedUser] = Depends(get_current_user)) -> VerifiedUser:
    """
    Strict dependency requiring a verified user ID token.
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials are required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
