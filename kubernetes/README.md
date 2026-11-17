# Kubernetes deployment

The manifests create the `investiq` namespace, four deployments, four services,
and per-service ConfigMaps and Secrets. The `app` service is exposed using a
`LoadBalancer`; the other services are internal `ClusterIP` services.

Build the images from the repository root using the image names referenced by
the deployments:

```powershell
docker build -f src/services/frontend/Dockerfile -t investiq-app:latest .
docker build -f src/services/chat/Dockerfile -t investiq-chat:latest .
docker build -f src/services/dashboard/Dockerfile -t investiq-dashboard:latest .
docker build -f src/services/ingestion/Dockerfile -t investiq-ingestion:latest .
```

Make these images available to the Kubernetes cluster (for example, push them
to a registry and update the image names), then apply the manifests from the
repository root:

```powershell
kubectl apply -f kubernetes/
```

Populate the ConfigMaps and Secrets with the values required by each service
before using the APIs. For cloud clusters, wait for the `app` service's
external address:

```powershell
kubectl get services -n investiq
```

The React frontend is built into the Nginx app image and served by the app
service on port 80. Nginx forwards same-origin `/api/metrics`, `/api/chat`, and
`/api/upload` requests to the dashboard, chat, and ingestion services using the
URLs in `app-config`.
