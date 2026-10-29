# Cloud Deployment Guide: ERP on AWS (EKS / Kubernetes)

This directory contains production-ready Kubernetes manifests and automation scripts for deploying the ERP platform to **Amazon EKS** (or any Kubernetes cluster).

---

## Architecture Overview

```text
               Internet Traffic
                      │
                      ▼
            [ AWS Network / App Load Balancer ]
                      │
                      ▼
             [ Frontend Service: Nginx / React ] (Port 80)
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
     [ Static UI ]       [ Backend API ] (Port 3000)
                         (/api, /socket.io)
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
   [ PostgreSQL 15 ]      [ Redis Cache ]     [ RabbitMQ Broker ]
   (StatefulSet / RDS)   (Deployment / ElastiCache)     │
                                                        ▼
                                                [ ML Risk Service ]
```

---

## Directory Structure

- `deploy/build-and-push-ecr.sh`: Automatically creates ECR repositories, builds Docker images, and pushes them to your AWS ECR registry.
- `deploy/deploy-k8s.sh`: Provisions the namespace, loads the database schema (`init.sql`), applies secrets, and deploys all services.
- `deploy/k8s/00-namespace.yaml`: Defines `erp` namespace.
- `deploy/k8s/01-config-secrets.yaml`: ConfigMap and Secrets for database, JWT, Redis, RabbitMQ.
- `deploy/k8s/02-postgres.yaml`: PostgreSQL StatefulSet with persistent storage and auto-initialization.
- `deploy/k8s/03-redis.yaml`: Redis cache deployment and service.
- `deploy/k8s/04-rabbitmq.yaml`: RabbitMQ broker with management interface.
- `deploy/k8s/05-backend.yaml`: Express.js backend deployment (scaled to 2 replicas).
- `deploy/k8s/06-ml-service.yaml`: Python ML worker service.
- `deploy/k8s/07-frontend.yaml`: React frontend with AWS NLB / LoadBalancer service.

---

## Prerequisites & AWS IAM Requirements

Your active AWS IAM credentials must have permissions for:
- **Amazon ECR:** `ecr:GetAuthorizationToken`, `ecr:CreateRepository`, `ecr:DescribeRepositories`, `ecr:BatchCheckLayerAvailability`, `ecr:PutImage`, etc.
- **Amazon EKS / EC2:** `eks:DescribeCluster`, `eks:ListClusters`, `ec2:DescribeInstances`, etc.

> **Note:** The current active AWS identity (`trialmind-backend`) has scoped permissions and cannot access ECR or EKS directly. To switch to an admin or DevOps profile:
> ```bash
> export AWS_PROFILE=your-admin-profile
> # Or set keys directly:
> export AWS_ACCESS_KEY_ID="AKIA..."
> export AWS_SECRET_ACCESS_KEY="..."
> export AWS_REGION="ap-south-1"
> ```

---

## Quick Deployment Steps

### 1. Build & Push Images to ECR
```bash
./deploy/build-and-push-ecr.sh
```

### 2. Connect `kubectl` to your EKS Cluster
```bash
aws eks update-kubeconfig --region ap-south-1 --name <your-eks-cluster-name>
```

### 3. Deploy Stack to Kubernetes
```bash
./deploy/deploy-k8s.sh
```

### 4. Monitor & Get Public Load Balancer URL
```bash
kubectl get svc frontend -n erp -w
```
Once the `EXTERNAL-IP` appears, open that URL in your browser to access the ERP platform.
