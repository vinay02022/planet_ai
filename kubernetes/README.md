# Kubernetes Deployment Guide

This guide explains how to deploy the Workflow Builder application to a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (minikube, kind, or cloud-based like GKE, EKS, AKS)
- kubectl configured to access your cluster
- Docker images built and pushed to a registry

## Build and Push Docker Images

```bash
# Build images
docker build -t workflow-builder-backend:latest ./backend
docker build -t workflow-builder-frontend:latest ./frontend

# Tag for your registry (example: Docker Hub)
docker tag workflow-builder-backend:latest yourusername/workflow-builder-backend:latest
docker tag workflow-builder-frontend:latest yourusername/workflow-builder-frontend:latest

# Push to registry
docker push yourusername/workflow-builder-backend:latest
docker push yourusername/workflow-builder-frontend:latest
```

## Deploy to Kubernetes

### 1. Create Namespace

```bash
kubectl apply -f kubernetes/namespace.yaml
```

### 2. Create Secrets

Edit `kubernetes/secrets.yaml` with your actual API keys, then apply:

```bash
kubectl apply -f kubernetes/secrets.yaml
```

### 3. Create ConfigMap

```bash
kubectl apply -f kubernetes/configmap.yaml
```

### 4. Deploy Database Services

```bash
kubectl apply -f kubernetes/postgres.yaml
kubectl apply -f kubernetes/chromadb.yaml
```

Wait for databases to be ready:

```bash
kubectl wait --for=condition=ready pod -l app=postgres -n workflow-builder --timeout=120s
kubectl wait --for=condition=ready pod -l app=chromadb -n workflow-builder --timeout=120s
```

### 5. Deploy Application

```bash
kubectl apply -f kubernetes/backend.yaml
kubectl apply -f kubernetes/frontend.yaml
```

### 6. (Optional) Deploy Ingress

```bash
kubectl apply -f kubernetes/ingress.yaml
```

## Verify Deployment

```bash
# Check all pods
kubectl get pods -n workflow-builder

# Check services
kubectl get services -n workflow-builder

# Check logs
kubectl logs -f deployment/backend -n workflow-builder
kubectl logs -f deployment/frontend -n workflow-builder
```

## Access the Application

### Using Port Forward (Development)

```bash
# Backend API
kubectl port-forward service/backend-service 8000:8000 -n workflow-builder

# Frontend
kubectl port-forward service/frontend-service 3000:3000 -n workflow-builder
```

### Using Ingress (Production)

Add the ingress host to your `/etc/hosts`:

```
<INGRESS_IP> workflow.local
```

Then access: http://workflow.local

## Scaling

```bash
# Scale backend
kubectl scale deployment backend --replicas=3 -n workflow-builder

# Scale frontend
kubectl scale deployment frontend --replicas=3 -n workflow-builder
```

## Cleanup

```bash
kubectl delete namespace workflow-builder
```

## Troubleshooting

### Pod not starting

```bash
kubectl describe pod <pod-name> -n workflow-builder
kubectl logs <pod-name> -n workflow-builder
```

### Database connection issues

```bash
kubectl exec -it deployment/backend -n workflow-builder -- /bin/sh
# Then test connection manually
```

### Check secrets

```bash
kubectl get secrets -n workflow-builder
kubectl describe secret workflow-builder-secrets -n workflow-builder
```
