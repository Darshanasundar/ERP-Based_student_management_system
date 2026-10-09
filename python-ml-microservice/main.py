from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import os

app = FastAPI(
    title="Academic Risk Predictor API",
    description="Microservice to predict student dropout/failure risk.",
    version="1.0.0"
)

# Load the model on startup
model_path = os.path.join(os.path.dirname(__file__), 'model', 'risk_model.joblib')
model = None

@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(model_path):
        model = joblib.load(model_path)
    else:
        print(f"Warning: Model not found at {model_path}. Run train_model.py first.")

class RiskRequest(BaseModel):
    attendance_percentage: float
    midterm_score_avg: float
    fee_pending_ratio: float

class RiskResponse(BaseModel):
    risk_score: float
    risk_level: str

@app.post("/predict-risk", response_model=RiskResponse)
def predict_risk(request: RiskRequest):
    if model is None:
        return RiskResponse(risk_score=0.0, risk_level="Model Not Trained")

    # The random forest was trained on ['attendance_percentage', 'marks_average', 'fee_pending_ratio']
    features = [[
        request.attendance_percentage,
        request.midterm_score_avg,
        request.fee_pending_ratio
    ]]
    
    # Get probability of being at risk (class 1)
    probabilities = model.predict_proba(features)[0]
    risk_score = probabilities[1] * 100  # Convert to 0-100 scale

    # Determine risk level
    if risk_score >= 70:
        risk_level = "HIGH"
    elif risk_score >= 40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return RiskResponse(
        risk_score=round(risk_score, 2),
        risk_level=risk_level
    )

@app.get("/health")
def health_check():
    return {"status": "healthy"}
