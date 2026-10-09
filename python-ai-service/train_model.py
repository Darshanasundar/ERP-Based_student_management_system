import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle

def generate_data(num_samples=1000):
    np.random.seed(42)
    # Generic engineering college context
    attendance_percentage = np.random.uniform(50, 100, num_samples)
    midterm_score_avg = np.random.uniform(30, 100, num_samples)
    fee_pending_ratio = np.random.uniform(0, 1, num_samples)

    # Risk definition: low attendance, low marks, high fee pending -> high risk
    # This is a synthetic rule to create the label
    risk_score = (
        (100 - attendance_percentage) * 0.4 + 
        (100 - midterm_score_avg) * 0.4 + 
        (fee_pending_ratio * 100) * 0.2
    )
    
    # Threshold for at-risk (e.g. top 20%)
    threshold = np.percentile(risk_score, 80)
    is_at_risk = (risk_score >= threshold).astype(int)

    return pd.DataFrame({
        'attendance_percentage': attendance_percentage,
        'midterm_score_avg': midterm_score_avg,
        'fee_pending_ratio': fee_pending_ratio,
        'is_at_risk': is_at_risk
    })

def main():
    print("Generating synthetic student records...")
    df = generate_data(1500)
    
    X = df[['attendance_percentage', 'midterm_score_avg', 'fee_pending_ratio']]
    y = df['is_at_risk']
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    print("Saving model to risk_model.pkl...")
    with open('risk_model.pkl', 'wb') as f:
        pickle.dump(model, f)
        
    print("Training complete!")

if __name__ == "__main__":
    main()
