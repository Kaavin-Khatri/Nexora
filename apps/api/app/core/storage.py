from functools import lru_cache

from supabase import Client, create_client

from app.core.config import settings

BUCKET = "resumes"  # private; all access is server-mediated via the service role


@lru_cache
def _client() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


def upload_resume(path: str, data: bytes, content_type: str) -> None:
    _client().storage.from_(BUCKET).upload(
        path, data, {"content-type": content_type, "upsert": "true"}
    )


def download_resume(path: str) -> bytes:
    return _client().storage.from_(BUCKET).download(path)


def create_signed_url(path: str, expires_in: int = 60) -> str:
    response = _client().storage.from_(BUCKET).create_signed_url(path, expires_in)
    if not response or "signedURL" not in response:
        raise RuntimeError("Failed to create signed URL")
    return response["signedURL"]
