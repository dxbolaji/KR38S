import os
import pickle
import numpy as np
from features import extract_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), "trace_model.pkl")

# Load model once at import
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)


def score_transaction(transaction: dict) -> dict:
    """
    Score a transaction and return trust score, level and anomaly flag.
    Trust score: 0-100 (higher = more trustworthy)
    """
    features = extract_features(transaction)
    features_array = np.array(features).reshape(1, -1)

    # IsolationForest: -1 = anomaly, 1 = normal
    prediction = model.predict(features_array)[0]
    raw_score = model.decision_function(features_array)[0]

    # Normalize score to 0-100
    # decision_function returns negative for anomalies
    # typical range is roughly -0.5 to 0.5
    normalized = int(np.clip((raw_score + 0.5) * 100, 0, 100))

    is_anomaly = prediction == -1

    if normalized >= 70:
        trust_level = "clean"
    elif normalized >= 40:
        trust_level = "watch"
    else:
        trust_level = "suspicious"

    return {
        "trust_score": normalized,
        "trust_level": trust_level,
        "is_anomaly": is_anomaly,
    }