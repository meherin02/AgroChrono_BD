import csv
import random

# Seed for reproducibility
random.seed(42)

records = []

# Base templates derived from BAMIS, BRRI, and BARC agricultural crop calendars
templates = [
    # Aman Rice (Kharif-2)
    {
        "crop": "Rice", "season": "Aman", "district": "Rangpur",
        "plant_base": 205, "growth_min": 115, "growth_max": 140, "harvest_base": 330,
        "temp_mean": 29.2, "rain_mean": 950.0, "count": 40
    },
    {
        "crop": "Rice", "season": "Aman", "district": "Rajshahi",
        "plant_base": 208, "growth_min": 115, "growth_max": 138, "harvest_base": 332,
        "temp_mean": 29.8, "rain_mean": 820.0, "count": 35
    },
    {
        "crop": "Rice", "season": "Aman", "district": "Mymensingh",
        "plant_base": 202, "growth_min": 120, "growth_max": 145, "harvest_base": 335,
        "temp_mean": 28.9, "rain_mean": 1100.0, "count": 35
    },
    {
        "crop": "Rice", "season": "Aman", "district": "Dhaka",
        "plant_base": 205, "growth_min": 118, "growth_max": 140, "harvest_base": 333,
        "temp_mean": 29.5, "rain_mean": 980.0, "count": 30
    },
    {
        "crop": "Rice", "season": "Aman", "district": "Barishal",
        "plant_base": 210, "growth_min": 120, "growth_max": 145, "harvest_base": 340,
        "temp_mean": 29.0, "rain_mean": 1250.0, "count": 30
    },
    # Boro Rice (Rabi/Winter)
    {
        "crop": "Rice", "season": "Boro", "district": "Mymensingh",
        "plant_base": 355, "growth_min": 140, "growth_max": 165, "harvest_base": 120,
        "temp_mean": 23.5, "rain_mean": 210.0, "count": 35
    },
    {
        "crop": "Rice", "season": "Boro", "district": "Rangpur",
        "plant_base": 360, "growth_min": 145, "growth_max": 168, "harvest_base": 125,
        "temp_mean": 22.8, "rain_mean": 180.0, "count": 35
    },
    {
        "crop": "Rice", "season": "Boro", "district": "Rajshahi",
        "plant_base": 350, "growth_min": 135, "growth_max": 160, "harvest_base": 115,
        "temp_mean": 24.1, "rain_mean": 150.0, "count": 35
    },
    {
        "crop": "Rice", "season": "Boro", "district": "Dhaka",
        "plant_base": 355, "growth_min": 138, "growth_max": 162, "harvest_base": 118,
        "temp_mean": 24.3, "rain_mean": 195.0, "count": 30
    },
    # Aus Rice (Kharif-1)
    {
        "crop": "Rice", "season": "Aus", "district": "Rangpur",
        "plant_base": 105, "growth_min": 98, "growth_max": 118, "harvest_base": 212,
        "temp_mean": 30.5, "rain_mean": 620.0, "count": 30
    },
    {
        "crop": "Rice", "season": "Aus", "district": "Barishal",
        "plant_base": 100, "growth_min": 95, "growth_max": 115, "harvest_base": 205,
        "temp_mean": 30.2, "rain_mean": 750.0, "count": 30
    },
    # Wheat (Rabi)
    {
        "crop": "Wheat", "season": "Rabi", "district": "Dinajpur",
        "plant_base": 322, "growth_min": 102, "growth_max": 115, "harvest_base": 72,
        "temp_mean": 20.2, "rain_mean": 45.0, "count": 30
    },
    {
        "crop": "Wheat", "season": "Rabi", "district": "Rajshahi",
        "plant_base": 325, "growth_min": 100, "growth_max": 112, "harvest_base": 70,
        "temp_mean": 21.0, "rain_mean": 40.0, "count": 30
    },
    # Potato (Rabi)
    {
        "crop": "Potato", "season": "Rabi", "district": "Munshiganj",
        "plant_base": 315, "growth_min": 85, "growth_max": 105, "harvest_base": 48,
        "temp_mean": 20.5, "rain_mean": 35.0, "count": 30
    },
    {
        "crop": "Potato", "season": "Rabi", "district": "Bogura",
        "plant_base": 318, "growth_min": 88, "growth_max": 102, "harvest_base": 50,
        "temp_mean": 19.8, "rain_mean": 30.0, "count": 30
    },
    # Mustard (Rabi)
    {
        "crop": "Mustard", "season": "Rabi", "district": "Manikganj",
        "plant_base": 298, "growth_min": 75, "growth_max": 90, "harvest_base": 25,
        "temp_mean": 21.2, "rain_mean": 25.0, "count": 25
    },
    {
        "crop": "Mustard", "season": "Rabi", "district": "Tangail",
        "plant_base": 300, "growth_min": 78, "growth_max": 92, "harvest_base": 28,
        "temp_mean": 21.0, "rain_mean": 28.0, "count": 25
    }
]

header = [
    "crop", "season", "district", "planting_doy", "growth_days",
    "harvest_doy", "mean_temperature", "total_rainfall"
]

out_path = r"C:\Users\Rakib\.gemini\antigravity\scratch\AgroChrono-BD\ml-service\data\crop_calendar_training.csv"

with open(out_path, mode="w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(header)

    for tmpl in templates:
        for _ in range(tmpl["count"]):
            # Small realistic variance
            p_doy = (tmpl["plant_base"] + random.randint(-6, 6)) % 365
            if p_doy == 0:
                p_doy = 365
            growth = random.randint(tmpl["growth_min"], tmpl["growth_max"])
            h_doy = (p_doy + growth + random.randint(-4, 5)) % 365
            if h_doy == 0:
                h_doy = 365
            temp = round(tmpl["temp_mean"] + random.uniform(-1.2, 1.2), 1)
            rain = round(max(5.0, tmpl["rain_mean"] + random.uniform(-60.0, 60.0)), 1)

            writer.writerow([
                tmpl["crop"],
                tmpl["season"],
                tmpl["district"],
                p_doy,
                growth,
                h_doy,
                temp,
                rain
            ])

print("Dataset generated successfully at:", out_path)
