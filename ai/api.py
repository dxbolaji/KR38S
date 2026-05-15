from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import sys
import os

# Add model directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "model"))

from predict import score_transaction

app = FastAPI(title="TRACE Anomaly Detection API")


class TransactionInput(BaseModel):
    amount: float
    type: str = "donation"
    created_at: Optional[str] = None
    time_since_last_tx: Optional[float] = 3600
    recipient_tx_count: Optional[float] = 5
    fund_depletion_rate: Optional[float] = 0.1


class ScoreResponse(BaseModel):
    trust_score: int
    trust_level: str
    is_anomaly: bool


@app.get("/health")
def health():
    return {"status": "ok", "service": "TRACE AI"}


@app.post("/score", response_model=ScoreResponse)
def score(tx: TransactionInput):
    try:
        result = score_transaction(tx.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))