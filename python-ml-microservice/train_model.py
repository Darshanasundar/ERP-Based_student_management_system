import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

def generate_synthetic_data(num_samples=1000):
    """
    Generates synthetic dataset for Bannari Amman Institute of Technology.
    Features: attendance_percentage, marks_average, fee_pending_ratio
    Target: is_at_risk (1 if at risk of failing/dropping out, 0 otherwise)
    """
    np.random.seed(42)
    
    # 1. Generate realistic feature distributions
    # Most students have decent attendance, some have low
    attendance_percentage = np.clip(np.random.normal(85, 15, num_samples), 0, 100)
    
    # Mid-semester marks out of 100
    marks_average = np.clip(np.random.normal(70, 18, num_samples), 0, 100)
    
    # Fee pending ratio (0 to 1) - mostly 0 or low, some 1.0 (unpaid)
    fee_pending_ratio = np.random.beta(a=0.5, b=2.5, size=num_samples)
    
    # 2. Define risk logic (to label the synthetic data)
    # A student is at risk if they have low attendance, poor marks, OR high pending fees.
    # We add some random noise to simulate real-world uncertainty.
    
    risk_score = (
        (100 - attendance_percentage) * 0.4 +
        (100 - marks_average) * 0.4 +
        (fee_pending_ratio * 100) * 0.2
    )
    
    # Add noise
    risk_score += np.random.normal(0, 5, num_samples)
    
    # Threshold for being "at risk"
    # If the score is higher than 40, flag as risk
    is_at_risk = (risk_score > 40).astype(int)

    df = pd.DataFrame({
        'attendance_percentage': attendance_percentage,
        'marks_average': marks_average,
        'fee_pending_ratio': fee_pending_ratio,
        'is_at_risk': is_at_risk
    })
    
    return df

def train_and_save_model():
    print("Generating synthetic data for Bannari Amman Institute of Technology...")
    df = generate_synthetic_data(2000)
    
    # Save the dataset for reference
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/historical_student_records.csv', index=False)
    
    X = df[['attendance_percentage', 'marks_average', 'fee_pending_ratio']]
    y = df['is_at_risk']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    print("\nModel Accuracy:", accuracy_score(y_test, y_pred))
    print("\nClassification Report:\n", classification_report(y_test, y_pred))
    
    print("Saving model to model/risk_model.joblib...")
    os.makedirs('model', exist_ok=True)
    joblib.dump(model, 'model/risk_model.joblib')
    print("Training complete.")

if __name__ == "__main__":
    train_and_save_model()
