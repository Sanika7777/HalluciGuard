"""
schemas.py — Pydantic Request & Response Schemas (Production Ready)

Security hardening:
- Strict input length limits (prevent DoS via huge payloads)
- Whitespace stripping (prevent bypass via padded inputs)
- Null byte injection prevention
- Control character stripping
- Response schemas never leak internal fields
"""

import re
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import List, Optional
from enum import Enum

#input sanitization helpers

_NULL_BYTES = re.compile(r"\x00")
_CTRL_CHARS = re.compile(r"[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]")


def _sanitize_text(v: str) -> str:
    """Strip null bytes, control chars, and surrounding whitespace."""
    v = _NULL_BYTES.sub("", v)
    v = _CTRL_CHARS.sub("", v)
    return v.strip()


#enums


class LLMTarget(str, Enum):
    gpt4 = "gpt4"
    gemini = "gemini"
    claude = "claude"
    llama = "llama"


class AbstentionLevel(str, Enum):
    self_contained = "self_contained"
    minor_context = "minor_context"
    major_context = "major_context"
    unanswerable = "unanswerable"


#request schemas


class PromptRiskRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=3,
        max_length=5000,
        description="User prompt to analyze for hallucination risk",
    )
    llm_target: LLMTarget = Field(
        default=LLMTarget.gpt4,
        description="Target LLM the prompt will be sent to",
    )

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, v: str) -> str:
        v = _sanitize_text(v)
        if not v:
            raise ValueError("Prompt cannot be empty or whitespace only.")
        if len(v) < 3:
            raise ValueError("Prompt must be at least 3 characters.")
        return v


class ResponseHallucinationRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=3,
        max_length=5000,
        description="Original prompt given to the LLM",
    )
    response: str = Field(
        ...,
        min_length=3,
        max_length=10000,
        description="LLM response to evaluate for hallucinations",
    )

    @field_validator("prompt", "response")
    @classmethod
    def validate_text_fields(cls, v: str) -> str:
        v = _sanitize_text(v)
        if not v:
            raise ValueError("Field cannot be empty or whitespace only.")
        return v

    @model_validator(mode="after")
    def validate_not_identical(self) -> "ResponseHallucinationRequest":
        if self.prompt.strip() == self.response.strip():
            raise ValueError("Prompt and response cannot be identical.")
        return self


class EngineerPromptRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=3,
        max_length=5000,
        description="Prompt to engineer",
    )
    llm_target: LLMTarget = Field(
        default=LLMTarget.gpt4,
        description="Target LLM",
    )
    risk_context: Optional[dict] = Field(
        default=None,
        description="Risk analysis context from /predict-prompt (optional)",
    )

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, v: str) -> str:
        v = _sanitize_text(v)
        if not v:
            raise ValueError("Prompt cannot be empty.")
        return v

    @field_validator("risk_context")
    @classmethod
    def validate_risk_context(cls, v: Optional[dict]) -> Optional[dict]:
        if v is None:
            return v
        # Prevent absurdly large context dicts
        serialized = str(v)
        if len(serialized) > 50_000:
            raise ValueError("risk_context payload too large.")
        return v


# response schemas


class WordHighlight(BaseModel):
    word: str
    start: int = Field(..., ge=0)
    end: int = Field(..., ge=0)
    risk_score: float = Field(..., ge=0.0, le=1.0)
    reason: str
    suggestions: list[str]


class ScoreBreakdown(BaseModel):
    ambiguity: float = Field(..., ge=0.0, le=1.0)
    specificity: float = Field(..., ge=0.0, le=1.0)
    context: float = Field(..., ge=0.0, le=1.0)


class HallucinationType(BaseModel):
    type_label: str
    type_description: str
    confidence: float = Field(..., ge=0.0, le=1.0)


class PromptDiff(BaseModel):
    original_word: str
    engineered_word: str
    reason: str


class PromptRiskResponse(BaseModel):
    label: str  # "safe" | "risky"
    confidence: float  # 0.0 – 1.0
    risk_percent: int  # 0 – 100
    score_breakdown: ScoreBreakdown
    highlights: list[WordHighlight]
    abstention_level: AbstentionLevel
    abstention_reasons: Optional[List[str]] = None
    missing_context: list[str]
    why_risky: list[str]
    what_to_add: list[str]
    llm_target: str
    llm_specific_warning: str = ""


class ResponseHallucinationResponse(BaseModel):
    hallucinated: bool
    confidence: float
    risk_percent: int
    hallucination_type: Optional[HallucinationType]
    explanation: list[str]
    highlights: list[WordHighlight]


class EngineerPromptResponse(BaseModel):
    original_prompt: str
    engineered_prompt: str
    diff: list[PromptDiff]
    improvements: list[str]
    llm_target: str


# generic schemas


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    status_code: int

    class Config:
        # Never include internal Python details in serialized output
        json_schema_extra = {}


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    version: str = "1.0.0"
    claude_api: bool = False  # True if Claude API key is set
