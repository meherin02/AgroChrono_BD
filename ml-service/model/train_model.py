import os
import joblib
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

current_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(current_dir, "..", "data", "crop_calendar_training.csv")
model_path = os.path.join(current_dir, "anomaly_model.joblib")
stats_path = os.path.join(current_dir, "feature_stats.joblib")

print(f"Loading training data from {data_path}...")
df = pd.read_csv(data_path)

features = [
    "planting_doy",
    "growth_days",
    "harvest_doy",
    "mean_temperature",
    "total_rainfall"
]

X = df[features].dropna()

# Compute distribution statistics for feature explainability
stats = {}
for col in features:
    stats[col] = {
        "mean": float(X[col].mean()),
        "std": float(X[col].std()),
        "min": float(X[col].min()),
        "max": float(X[col].max()),
        "q25": float(X[col].quantile(0.25)),
        "q75": float(X[col].quantile(0.75))
    }

# Build Pipeline
# contamination="auto" or 0.05
iso_forest = IsolationForest(
    n_estimators=250,
    contamination=0.08,
    random_state=42
)

pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("model", iso_forest)
])

print("Fitting Isolation Forest model...")
pipeline.fit(X)

# Save pipeline and statistics
joblib.dump(pipeline, model_path)
joblib.dump(stats, stats_path)

print(f"Model successfully saved to {model_path}")
print(f"Feature statistics saved to {stats_path}")
