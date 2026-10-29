import os
import json
import time
import threading
import logging
import requests
import pika
from fastapi import FastAPI
import uvicorn

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ml_service")

app = FastAPI(title="ERP ML Academic Risk Assessment Microservice", version="2.0.0")

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
BACKEND_WEBHOOK_URL = os.getenv("BACKEND_WEBHOOK_URL", "http://backend:3000/api/internal/emit-risk-update")
QUEUE_NAME = "risk_assessment_queue"


def calculate_academic_risk(marks: float) -> tuple[float, str]:
    """
    ML risk estimation logic:
    - Below 50: High Risk (> 0.70)
    - 50 - 69: Medium Risk (0.40 - 0.69)
    - 70 and above: Low Risk (< 0.30)
    """
    score = float(marks) if marks is not None else 75.0

    if score < 50:
        risk_score = round(0.70 + (50 - score) * 0.005, 2)
        risk_score = min(0.99, max(0.71, risk_score))
        risk_status = "High Risk"
    elif score < 70:
        risk_score = round(0.40 + (70 - score) * 0.01, 2)
        risk_score = min(0.69, max(0.40, risk_score))
        risk_status = "Medium Risk"
    else:
        risk_score = round(max(0.05, 0.25 - (score - 70) * 0.005), 2)
        risk_status = "Low Risk"

    return risk_score, risk_status


def process_risk_message(ch, method, properties, body):
    try:
        data = json.loads(body.decode("utf-8"))
        student_id = data.get("student_id")
        course_id = data.get("course_id")
        marks = data.get("marks", data.get("internal_score", 75))

        logger.info(f"Received message for student={student_id}, course={course_id}, marks={marks}")

        # 1. Run ML Risk Assessment Model
        risk_score, risk_status = calculate_academic_risk(marks)
        logger.info(f"Model output: RiskScore={risk_score}, RiskStatus={risk_status}")

        # 2. Fire HTTP request to Express backend internal webhook to trigger WebSocket emission
        webhook_payload = {
            "student_id": student_id,
            "course_id": course_id,
            "marks": marks,
            "risk_score": risk_score,
            "risk_status": risk_status,
        }

        try:
            resp = requests.post(BACKEND_WEBHOOK_URL, json=webhook_payload, timeout=5)
            logger.info(f"Notified backend webhook ({resp.status_code}): {resp.text}")
        except Exception as http_err:
            logger.error(f"Failed to call Express webhook at {BACKEND_WEBHOOK_URL}: {http_err}")

        # 3. Acknowledge message in RabbitMQ
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        logger.error(f"Error processing RabbitMQ message: {e}")
        # Acknowledge to prevent message poison pill loops
        ch.basic_ack(delivery_tag=method.delivery_tag)


def rabbitmq_worker():
    """
    Background worker that continuously consumes from risk_assessment_queue.
    """
    logger.info("Starting RabbitMQ background consumer worker...")
    while True:
        try:
            parameters = pika.URLParameters(RABBITMQ_URL)
            connection = pika.BlockingConnection(parameters)
            channel = connection.channel()

            channel.queue_declare(queue=QUEUE_NAME, durable=True)
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue=QUEUE_NAME, on_message_callback=process_risk_message)

            logger.info(f"Connected to RabbitMQ. Listening on queue '{QUEUE_NAME}'...")
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError as conn_err:
            logger.warning(f"RabbitMQ connection error ({conn_err}). Retrying in 5 seconds...")
            time.sleep(5)
        except Exception as e:
            logger.error(f"RabbitMQ consumer loop error ({e}). Retrying in 5 seconds...")
            time.sleep(5)


@app.on_event("startup")
def startup_event():
    # Start consumer in a daemon background thread
    worker_thread = threading.Thread(target=rabbitmq_worker, daemon=True)
    worker_thread.start()
    logger.info("Background RabbitMQ consumer thread started successfully.")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ml-risk-assessment-microservice",
        "queue": QUEUE_NAME,
        "backendWebhook": BACKEND_WEBHOOK_URL,
    }


@app.post("/predict")
def predict_direct(payload: dict):
    marks = payload.get("marks", 75)
    score, status = calculate_academic_risk(marks)
    return {
        "marks": marks,
        "risk_score": score,
        "risk_status": status,
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
