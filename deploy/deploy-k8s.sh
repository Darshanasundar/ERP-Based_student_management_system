#!/usr/bin/env bash
set -euo pipefail

# Configuration
AWS_REGION=${AWS_REGION:-"ap-south-1"}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-""}
NAMESPACE="erp"

echo "========================================="
echo "   ERP Cloud Deployment to Kubernetes    "
echo "========================================="

# 1. Create Namespace
echo "[1/6] Creating namespace..."
kubectl apply -f deploy/k8s/00-namespace.yaml

# 2. Create PostgreSQL Schema ConfigMap from database/init.sql
echo "[2/6] Loading database init schema..."
kubectl create configmap postgres-init-sql \
  --from-file=init.sql=database/init.sql \
  --namespace=${NAMESPACE} \
  --dry-run=client -o yaml | kubectl apply -f -

# 3. Apply ConfigMaps and Secrets
echo "[3/6] Applying configurations & secrets..."
kubectl apply -f deploy/k8s/01-config-secrets.yaml

# 4. Deploy Infrastructure Data Stores (PostgreSQL, Redis, RabbitMQ)
echo "[4/6] Deploying PostgreSQL, Redis, and RabbitMQ..."
kubectl apply -f deploy/k8s/02-postgres.yaml
kubectl apply -f deploy/k8s/03-redis.yaml
kubectl apply -f deploy/k8s/04-rabbitmq.yaml

# 5. Deploy App Services (Backend, ML Service, Frontend)
echo "[5/6] Deploying application services..."
kubectl apply -f deploy/k8s/05-backend.yaml
kubectl apply -f deploy/k8s/06-ml-service.yaml
kubectl apply -f deploy/k8s/07-frontend.yaml

# 6. Check Deployment Status
echo "[6/6] Verifying deployments..."
kubectl get pods,svc -n ${NAMESPACE}

echo "Deployment complete! Run 'kubectl get svc frontend -n erp -w' to monitor the external load balancer URL."
