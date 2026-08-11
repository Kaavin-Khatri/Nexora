import jwt
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address


def get_user_id(request: Request) -> str:
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        try:
            token = auth.split(" ")[1]
            payload = jwt.decode(token, options={"verify_signature": False})
            return payload.get("sub", get_remote_address(request))
        except Exception:
            pass
    return get_remote_address(request)


limiter = Limiter(key_func=get_user_id)
