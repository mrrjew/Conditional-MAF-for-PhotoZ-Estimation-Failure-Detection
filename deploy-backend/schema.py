from pydantic import BaseModel

class PredictRequest(BaseModel):
    u: float
    g: float
    r: float
    i: float
    z: float


from typing import Optional

class PredictResponse(BaseModel):
    status: str
    warning: Optional[str]

    redshift: dict

    failure_score: float

    cosmology: dict | None

    pdf: dict