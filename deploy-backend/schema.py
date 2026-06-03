from pydantic import BaseModel
from typing import Optional, List

class PredictRequest(BaseModel):
    u: float
    g: float
    r: float
    i: float
    z: float

class PredictResponse(BaseModel):
    status: str
    warning: Optional[str]
    redshift: dict
    failure_score: float
    cosmology: dict | None
    pdf: dict

class PredictBatchRequest(BaseModel):
    data: List[PredictRequest]

class PredictBatchResponse(BaseModel):
    results: List[PredictResponse]