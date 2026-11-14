import os
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

app = FastAPI(
    title="AgroChrono-BD ML Anomaly Service",
    description="Isolation Forest anomaly detector for Bangladesh crop calendars",
    version="1.0.0"
)

# Enable CORS for Express and direct testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, "model", "anomaly_model.joblib")
stats_path = os.path.join(base_dir, "model", "feature_stats.joblib")

model = None
feature_stats = None

def load_artifacts():
    global model, feature_stats
    if os.path.exists(model_path) and os.path.exists(stats_path):
        model = joblib.load(model_path)
        feature_stats = joblib.load(stats_path)
        print("ML Model and feature stats successfully loaded.")
    else:
        print("Warning: Model artifacts not found. Please run train_model.py first.")

load_artifacts()


class CalendarFeatures(BaseModel):
    planting_doy: int = Field(..., ge=1, le=366, description="Day of year for planting start (1-366)")
    growth_days: int = Field(..., gt=0, le=400, description="Growth duration in days")
    harvest_doy: int = Field(..., ge=1, le=366, description="Day of year for harvest start (1-366)")
    mean_temperature: float = Field(..., description="Average cultivation temperature in Celsius")
    total_rainfall: float = Field(..., ge=0.0, description="Total cultivation rainfall in mm")


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AgroChrono-BD ML Microservice",
        "model_loaded": model is not None,
        "model_version": "isolation-forest-v1.0"
    }


@app.post("/predict/anomaly")
def predict_anomaly(features: CalendarFeatures):
    global model, feature_stats
    if model is None:
        load_artifacts()
        if model is None:
            raise HTTPException(status_code=503, detail="ML model is not loaded. Run train_model.py.")

    input_dict = {
        "planting_doy": features.planting_doy,
        "growth_days": features.growth_days,
        "harvest_doy": features.harvest_doy,
        "mean_temperature": features.mean_temperature,
        "total_rainfall": features.total_rainfall
    }

    # Vector in exact training order
    import pandas as pd
    values_df = pd.DataFrame([{
        "planting_doy": features.planting_doy,
        "growth_days": features.growth_days,
        "harvest_doy": features.harvest_doy,
        "mean_temperature": features.mean_temperature,
        "total_rainfall": features.total_rainfall
    }])

    try:
        # Prediction: 1 = normal, -1 = anomaly
        prediction = int(model.predict(values_df)[0])
        raw_decision = float(model.decision_function(values_df)[0])
        # Higher positive anomaly_score means more abnormal
        anomaly_score = float(-raw_decision)
        is_anomaly = bool(prediction == -1)

        # Calculate z-score or distance from normal reference statistics for each feature
        feature_deviations = {}
        if feature_stats:
            for k, val in input_dict.items():
                if k in feature_stats:
                    mean = feature_stats[k]["mean"]
                    std = max(feature_stats[k]["std"], 0.001)
                    z = (val - mean) / std
                    feature_deviations[k] = {
                        "value": val,
                        "mean": round(mean, 1),
                        "z_score": round(z, 2),
                        "status": "unusual" if abs(z) > 2.0 else "normal"
                    }

        # Normalize score into a friendly 0 to 1 scale
        normalized_anomaly_index = max(0.0, min(1.0, round((anomaly_score + 0.25) / 0.5, 3)))

        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": round(anomaly_score, 4),
            "normalized_anomaly_index": normalized_anomaly_index,
            "prediction_label": "Unusual Pattern Detected" if is_anomaly else "Normal Pattern",
            "feature_deviations": feature_deviations,
            "model_version": "isolation-forest-v1.0"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)
