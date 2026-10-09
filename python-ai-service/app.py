from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import numpy as np

app = FastAPI(title="Academic Risk Predictor API")

# Load model
try:
    with open("risk_model.pkl", "rb") as f:
        model = pickle.load(f)
except FileNotFoundError:
    model = None
    print("Warning: risk_model.pkl not found. Please run train_model.py first.")

class StudentMetrics(BaseModel):
    attendance_percentage: float
    midterm_score_avg: float
    fee_pending_ratio: float

@app.post("/predict-risk")
def predict_risk(metrics: StudentMetrics):
    if model is None:
        return {"error": "Model not loaded"}
        
    # Prepare features
    features = np.array([[
        metrics.attendance_percentage,
        metrics.midterm_score_avg,
        metrics.fee_pending_ratio
    ]])
    
    # Predict probability of risk (class 1)
    risk_prob = model.predict_proba(features)[0][1]
    
    risk_score = float(risk_prob * 100)
    
    if risk_score >= 70:
        risk_level = "High"
    elif risk_score >= 35:
        risk_level = "Medium"
    else:
        risk_level = "Low"
        
    return {
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level
    }
