import uuid

from pydantic import BaseModel, ConfigDict, Field


class CompanyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    website: str | None
    size: str | None
    about: str | None


class CompanyCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=200)
    website: str | None = Field(default=None, max_length=200)
    size: str | None = Field(default=None, max_length=40)
    about: str | None = Field(default=None, max_length=2000)


class CompanyUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=200)
    website: str | None = Field(default=None, max_length=200)
    size: str | None = Field(default=None, max_length=40)
    about: str | None = Field(default=None, max_length=2000)
