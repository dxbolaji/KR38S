import os
import pickle
import numpy as np
from sklearn.ensemble import IsolationForest
from features import load_training_features

# Paths
DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/synthetic_transactions.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "trace_model.pkl")


def train():
    print("[TRACE AI] Loading training data...")
    X, y = load_training_features(DATA_PATH)

    print(f"[TRACE AI] Training on {len(X)} samples...")
    model = IsolationForest(
        n_estimators=100,
        contamination=0.2,
        random_state=42
    )
    model.fit(X)

    print(f"[TRACE AI] Saving model to {MODEL_PATH}...")
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

    print("[TRACE AI] Training complete.")


if __name__ == "__main__":
    train()