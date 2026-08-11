import logging
import sys

import structlog
from structlog.contextvars import bind_contextvars, clear_contextvars


def setup_logging():
    # Only configure if not already configured
    if structlog.is_configured():
        return

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    formatter = logging.Formatter("%(message)s")
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    
    root_logger = logging.getLogger()
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.INFO)

    # Silence noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def bind_request_id(request_id: str):
    bind_contextvars(request_id=request_id)


def bind_user_id(user_id: str):
    bind_contextvars(user_id=user_id)


def clear_request_context():
    clear_contextvars()
