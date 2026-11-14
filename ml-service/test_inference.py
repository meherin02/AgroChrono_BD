import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from main import predict_anomaly, CalendarFeatures

normal_input = CalendarFeatures(
    planting_doy=205,
    growth_days=125,
    harvest_doy=330,
    mean_temperature=29.2,
    total_rainfall=950.0
)
res1 = predict_anomaly(normal_input)
print("Normal Sample Result:")
print("is_anomaly:", res1["is_anomaly"])
print("anomaly_score:", res1["anomaly_score"])
print("prediction_label:", res1["prediction_label"])

print("\n--- Testing Anomaly Sample ---")
bad_input = CalendarFeatures(
    planting_doy=205,
    growth_days=220,
    harvest_doy=50,
    mean_temperature=42.0,
    total_rainfall=30.0
)
res2 = predict_anomaly(bad_input)
print("is_anomaly:", res2["is_anomaly"])
print("anomaly_score:", res2["anomaly_score"])
print("prediction_label:", res2["prediction_label"])
