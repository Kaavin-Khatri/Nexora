import json
import logging
from functools import lru_cache
from typing import TypeVar

from groq import Groq
from pydantic import BaseModel, ValidationError

from app.core.config import settings

logger = logging.getLogger("nexora.llm")

T = TypeVar("T", bound=BaseModel)

# THE single Groq gateway. No other module may import `groq`.


@lru_cache
def _client() -> Groq:
    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY not configured")
    return Groq(api_key=settings.GROQ_API_KEY)


def chat_json(system: str, user: str, model: type[T]) -> T:
    """Call Groq for a JSON object and validate it into `model`.

    response_format=json_object, temperature 0.1 (near-deterministic extraction).
    On invalid JSON or schema-validation failure, retry ONCE with the error
    appended to the conversation, then raise.
    """
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]
    last_error: Exception | None = None
    for attempt in range(2):
        resp = _client().chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        content = resp.choices[0].message.content or ""
        try:
            return model.model_validate(json.loads(content))
        except (json.JSONDecodeError, ValidationError) as e:
            last_error = e
            logger.warning("Groq JSON validation failed (attempt %d): %s", attempt + 1, e)
            messages.append({"role": "assistant", "content": content})
            messages.append(
                {
                    "role": "user",
                    "content": (
                        f"That response was invalid: {e}\n"
                        "Return corrected JSON matching the schema exactly. "
                        "Output only the JSON object."
                    ),
                }
            )
    raise last_error or RuntimeError("Groq returned no valid JSON after retry")
