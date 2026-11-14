# AgroChrono-BD
## AI/ML-Assisted Agricultural Crop-Calendar Validation & Reliability Assessment Platform

**Target Country:** Bangladesh  
**Architecture:** MERN Stack + Python FastAPI Microservice + Open-Meteo Weather API  
**Core Model:** Scikit-learn Isolation Forest (Unsupervised Anomaly Detection)  
**Reference Sources:** Bangladesh Agro-Meteorological Information Service (BAMIS - DAE), Bangladesh Rice Research Institute (BRRI), Bangladesh Agricultural Research Council (BARC)

---

## 🌾 1. Overview & Innovation

Unlike conventional crop-calendar systems that only display static agricultural recommendations, **AgroChrono-BD** accepts a **farmer's own proposed cultivation timeline** and evaluates whether that schedule is viable and reliable before planting starts.

The platform performs:
1. **Input Validation**: Rejects impossible chronological sequences (e.g. planting after harvest, growth before planting, negative durations).
2. **Regional Benchmark Matching**: Correlates proposed dates with trusted regional crop windows (Aman, Boro, Aus rice, Rabi wheat, potato, mustard).
3. **Agro-Climatic Weather Retrieval**: Leverages Open-Meteo Historical Archive & Climate telemetry for the exact cultivation dates and district.
4. **AI/ML Anomaly Screening**: Uses an **Isolation Forest** unsupervised learning model to detect multi-dimensional timeline anomalies.
5. **Field-Specific Conflict Detection**: Pinpoints exact deviations in Planting Window, Growth Duration, and Harvest Window.
6. **Weighted Reliability Scoring**: Generates an explainable score:
   $$R = 0.30P + 0.20G + 0.25H + 0.25W$$
   *(With dynamic weight renormalization and completeness tracking if weather is missing)*.
7. **Suggested Calendar Correction**: Formulates reference-aligned dates that farmers can apply with one click to re-analyze immediately.

---

## 🏗️ 2. System Architecture

```text
               FARMER (React.js + Tailwind UI)
                          │
                          ▼
            EXPRESS BACKEND (Port 5000)
             - Input Sequence Validator
             - Analysis Orchestrator
             - Conflict Identification Engine
             - Weighted Reliability Calculator
                          │
        ┌─────────────────┴─────────────────┐
        ▼                                   ▼
 OPEN-METEO WEATHER API             MONGODB / DATA STORE
 (Historical & Climate Normal)      (Reference & History)
        │                                   │
        └─────────────────┬─────────────────┘
                          │ (Feature Vector: DOY, Duration, Temp, Rain)
                          ▼
             PYTHON FASTAPI MICROSERVICE (Port 8001)
             - Scikit-learn Isolation Forest
             - Anomaly Score & Feature Deviations
```

---

## 🚀 3. Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### Step 1: Start the Python ML Service
```bash
cd ml-service
python -m pip install -r requirements.txt
python model/train_model.py
python -m uvicorn main:app --port 8001
```
*Health endpoint: `http://127.0.0.1:8001/health`*

### Step 2: Start the Express Backend
```bash
cd backend
npm install
node src/server.js
```
*Health endpoint: `http://localhost:5000/api/health`*

### Step 3: Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Open in browser: `http://localhost:3000`*

---

## 🧪 4. Testing Presets Included in the UI

The application includes 3 instant test presets directly on the header:
- **🌾 Ideal Aman (Rangpur)**: Fully aligned with BRRI dhan49 reference windows $\rightarrow$ Score: ~98% (High Reliability).
- **⚠️ Delayed Conflict**: Late planting and late harvest past regional cutoffs $\rightarrow$ Flagged conflicts with risk explanations.
- **🚨 ML Anomaly Sample**: Abnormal 200-day growth duration $\rightarrow$ Triggers the Isolation Forest anomaly detector.

---

## 📊 5. Verified Bangladesh Datasets

Included in `backend/src/data/referenceCalendars.json`:
- **Rice (Aman)**: Rangpur, Rajshahi, Mymensingh, Dhaka (BRRI dhan49, dhan51, dhan75, dhan87).
- **Rice (Boro)**: Mymensingh, Rangpur (BRRI dhan28, dhan29, dhan89).
- **Rice (Aus)**: Rangpur, Barishal (BRRI dhan48, Parija).
- **Wheat (Rabi)**: Dinajpur, Rajshahi (BARI Gom-25, Gom-33).
- **Potato (Rabi)**: Munshiganj, Bogura (Diamant, Cardinal, Asterix).
- **Mustard (Rabi)**: Manikganj, Tangail (BARI Sarisha-14, Sarisha-17).
