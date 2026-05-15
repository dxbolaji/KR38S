import pandas as pd
import numpy as np
from datetime import datetime


def extract_features(transaction: dict) -> list:
    """
    Extract behavioral features from a single transaction dict.
    Returns a list of numeric features for the model.
    """
    amount = float(transaction.get("amount", 0))
    created_at = transaction.get("created_at", datetime.utcnow().isoformat())
    tx_type = transaction.get("type", "donation")
    time_since_last_tx = float(transaction.get("time_since_last_tx", 3600))
    recipient_tx_count = float(transaction.get("recipient_tx_count", 5))
    fund_depletion_rate = float(transaction.get("fund_depletion_rate", 0.1))

    # Parse hour and day from timestamp
    try:
        dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        hour = dt.hour
        day_of_week = dt.weekday()
    except Exception:
        hour = 12
        day_of_week = 1

    # Encode transaction type
    tx_type_encoded = 0 if tx_type == "donation" else 1

    return [
        amount,
        hour,
        day_of_week,
        time_since_last_tx,
        recipient_tx_count,
        fund_depletion_rate,
        tx_type_encoded,
    ]


def load_training_features(csv_path: str):
    """Load and return features and labels from CSV."""
    df = pd.read_csv(csv_path)
    feature_cols = [
        "amount", "hour", "day_of_week", "time_since_last_tx",
        "recipient_tx_count", "fund_depletion_rate", "tx_type"
    ]
    # Encode tx_type
    df["tx_type"] = df["tx_type"].map({"donation": 0, "withdrawal": 1})
    X = df[feature_cols].values
    y = df["is_anomaly"].values
    return X, y