#!/usr/bin/env bash
set -euo pipefail

# Configuration
AWS_REGION=${AWS_REGION:-"ap-south-1"}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-""}

if [ -z "$AWS_ACCOUNT_ID" ]; then
  AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
fi

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "Logging into Amazon ECR: ${ECR_REGISTRY}..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

create_repo_if_not_exists() {
  local repo_name=$1
  echo "Checking repository: ${repo_name}..."
  aws ecr describe-repositories --repository-names "${repo_name}" --region "${AWS_REGION}" >/dev/null 2>&1 || \
    aws ecr create-repository --repository-name "${repo_name}" --region "${AWS_REGION}" >/dev/null
}

echo "Ensuring ECR repositories exist..."
create_repo_if_not_exists "erp-frontend"
create_repo_if_not_exists "erp-backend"
create_repo_if_not_exists "erp-ml-service"

echo "Building and pushing Backend..."
docker build -t "${ECR_REGISTRY}/erp-backend:latest" ./backend
docker push "${ECR_REGISTRY}/erp-backend:latest"

echo "Building and pushing Frontend..."
docker build -t "${ECR_REGISTRY}/erp-frontend:latest" ./frontend
docker push "${ECR_REGISTRY}/erp-frontend:latest"

echo "Building and pushing ML Service..."
docker build -t "${ECR_REGISTRY}/erp-ml-service:latest" ./ml-service
docker push "${ECR_REGISTRY}/erp-ml-service:latest"

echo "Updating k8s image references with ECR registry..."
sed -i '' "s|image: erp-backend:latest|image: ${ECR_REGISTRY}/erp-backend:latest|g" deploy/k8s/05-backend.yaml 2>/dev/null || \
sed -i "s|image: erp-backend:latest|image: ${ECR_REGISTRY}/erp-backend:latest|g" deploy/k8s/05-backend.yaml
sed -i '' "s|image: erp-frontend:latest|image: ${ECR_REGISTRY}/erp-frontend:latest|g" deploy/k8s/07-frontend.yaml 2>/dev/null || \
sed -i "s|image: erp-frontend:latest|image: ${ECR_REGISTRY}/erp-frontend:latest|g" deploy/k8s/07-frontend.yaml
sed -i '' "s|image: erp-ml-service:latest|image: ${ECR_REGISTRY}/erp-ml-service:latest|g" deploy/k8s/06-ml-service.yaml 2>/dev/null || \
sed -i "s|image: erp-ml-service:latest|image: ${ECR_REGISTRY}/erp-ml-service:latest|g" deploy/k8s/06-ml-service.yaml

echo "All images pushed successfully to ${ECR_REGISTRY}!"
