# Deploying CivicPriorities to Cloud Run

These steps deploy the repository's `Dockerfile` as one public Cloud Run service in `asia-south1`. The container listens on `PORT=8080` and provides `GET /health`.

## Prerequisites

- A Google Cloud project with billing enabled.
- Google Cloud CLI installed and authenticated with `gcloud auth login`.
- Permission to enable APIs, create service accounts and secrets, deploy Cloud Run services, and grant IAM roles. In a restricted project, an administrator must provide the equivalent permissions.
- A Gemini API key only if a future server-side Gemini adapter will use it. The current server does **not** call Gemini: it keeps using the explicitly labelled local fallback. Supplying the secret now only provisions the deployment boundary.

Run all commands below from the repository root. Set the project ID before continuing:

```bash
export PROJECT_ID="YOUR_GOOGLE_CLOUD_PROJECT_ID"
export REGION="asia-south1"
export SERVICE="civic-priorities"
export RUNTIME_SA="civic-priorities-run"
gcloud config set project "$PROJECT_ID"
```

Enable the required services:

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com
```

## Runtime identity and Gemini secret

Create a least-privilege runtime service account and the Secret Manager secret. If either resource already exists, skip its creation command and continue with the IAM binding or version-add command.

```bash
gcloud iam service-accounts create "$RUNTIME_SA" --display-name="CivicPriorities Cloud Run runtime"
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${RUNTIME_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Add a secret version without placing the key in a command argument or shell history:

```bash
read -r -s -p "Gemini API key: " GEMINI_API_KEY_VALUE
printf '\n'
printf '%s' "$GEMINI_API_KEY_VALUE" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
unset GEMINI_API_KEY_VALUE
```

## Deploy

Cloud Run builds from the checked-in `Dockerfile`, creates a revision, runs it as the dedicated runtime identity, and mounts the latest secret version as `GEMINI_API_KEY`.

```bash
gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --service-account="${RUNTIME_SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --port=8080 \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --allow-unauthenticated
```

For a demo that intentionally has no Gemini key, omit `--set-secrets` and the secret-setup section. `/health` then reports `aiMode: "local-fallback"`.

## Verify the live service

```bash
export SERVICE_URL="$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')"
curl --fail --silent --show-error "$SERVICE_URL/health"
curl --fail --silent --show-error "$SERVICE_URL/api/v1/config"
gcloud run services describe "$SERVICE" --region "$REGION" --format='yaml(status.url,status.latestReadyRevisionName,status.traffic)'
```

Expected health response is JSON with `status: "ok"`. With a mounted secret, this code currently reports `aiMode: "not-configured-in-demo"`; that accurately indicates the secret is present but no live Gemini adapter has been implemented.

Inspect logs for the current revision:

```bash
gcloud run services logs read "$SERVICE" --region "$REGION" --limit=100
```

## Release checks and rollback

List revisions and their traffic before changing any traffic allocation:

```bash
gcloud run revisions list --service="$SERVICE" --region="$REGION" --sort-by='~metadata.creationTimestamp'
gcloud run services describe "$SERVICE" --region "$REGION" --format='yaml(status.latestReadyRevisionName,status.traffic)'
```

After identifying the last known-good revision name from that output, roll all traffic back to it:

```bash
gcloud run services update-traffic "$SERVICE" \
  --region "$REGION" \
  --to-revisions="KNOWN_GOOD_REVISION=100"
```

Verify the rollback using the health endpoint and traffic view:

```bash
curl --fail --silent --show-error "$SERVICE_URL/health"
gcloud run services describe "$SERVICE" --region "$REGION" --format='yaml(status.latestReadyRevisionName,status.traffic)'
```

To release a newer secret version, add the version with the secure prompt above, then deploy a fresh revision with the same deploy command. The `:latest` secret mount resolves when the new instance starts; existing instances retain their current mounted version until replaced.
