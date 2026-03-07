#!/bin/bash
# ================================================================
#  WalkInMyShoes — AWS Frontend Deploy Script
#  Build → Upload to S3 → Invalidate CloudFront
#
#  Usage:
#    cd walkinmyshoes
#    chmod +x scripts/deploy-frontend.sh   (first time only)
#    ./scripts/deploy-frontend.sh
# ================================================================

set -e  # Exit immediately on error

# ── Load environment variables from .env ──────────────────────
if [ -f .env ]; then
  export $(grep -v '^#' .env | grep -v '^$' | xargs)
  echo "✅ Loaded .env"
else
  echo "❌ ERROR: .env file not found. Copy .env.example → .env and fill in values."
  exit 1
fi

# ── Validate required vars ────────────────────────────────────
S3_BUCKET="${S3_BUCKET:-}"
CLOUDFRONT_ID="${CLOUDFRONT_ID:-}"
AWS_REGION="${AWS_REGION:-us-east-1}"

if [ -z "$S3_BUCKET" ] || [[ "$S3_BUCKET" == *"your-wims"* ]]; then
  echo "❌ ERROR: S3_BUCKET not set. Add it to your .env file."
  echo "   Example: S3_BUCKET=walkinmyshoes-frontend-prod"
  exit 1
fi

if [ -z "$CLOUDFRONT_ID" ] || [[ "$CLOUDFRONT_ID" == *"your-cloudfront"* ]]; then
  echo "❌ ERROR: CLOUDFRONT_ID not set. Add it to your .env file."
  echo "   Example: CLOUDFRONT_ID=E1ABCDEF123456"
  exit 1
fi

echo ""
echo "🚀 WalkInMyShoes — AWS Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 S3 Bucket    : $S3_BUCKET"
echo "🌐 CloudFront   : $CLOUDFRONT_ID"
echo "🌍 Region       : $AWS_REGION"
echo ""

# ── Step 1: Build ─────────────────────────────────────────────
echo "⚙️  [1/4] Building production bundle..."
npm run build

if [ ! -d "dist" ]; then
  echo "❌ Build failed — dist/ not created"
  exit 1
fi
echo "✅ Build complete — $(du -sh dist | cut -f1)"

# ── Step 2: Upload HTML (no-cache) ────────────────────────────
echo ""
echo "☁️  [2/4] Uploading HTML to S3 (no-cache)..."
aws s3 sync dist/ "s3://$S3_BUCKET/" \
  --region "$AWS_REGION" \
  --delete \
  --exclude "*" \
  --include "*.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --metadata-directive REPLACE

# ── Step 3: Upload Assets (long-cache) ───────────────────────
echo "☁️  [3/4] Uploading assets to S3 (immutable cache)..."
aws s3 sync dist/ "s3://$S3_BUCKET/" \
  --region "$AWS_REGION" \
  --exclude "*.html" \
  --cache-control "public, max-age=31536000, immutable" \
  --metadata-directive REPLACE

echo "✅ S3 upload complete"

# ── Step 4: CloudFront Invalidation ───────────────────────────
echo ""
echo "🔄 [4/4] Creating CloudFront invalidation..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "✅ Invalidation started: $INVALIDATION_ID"

# ── Done ──────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅  DEPLOY COMPLETE!"
echo ""
echo "🌐 Your app: ${VITE_CLOUDFRONT_DOMAIN:-https://your-cloudfront-id.cloudfront.net}"
echo "   (CloudFront propagation takes 2–5 minutes)"
echo ""
echo "📋 Monitor invalidation:"
echo "   aws cloudfront get-invalidation --distribution-id $CLOUDFRONT_ID --id $INVALIDATION_ID"
echo ""
echo "🔍 Final checklist:"
echo "   ✔ Landing page loads"
echo "   ✔ All 4 simulations launch"
echo "   ✔ AR Auditor camera works"
echo "   ✔ AI Guide responds (Groq)"
echo "   ✔ Cognito login/signup works"
echo "   ✔ Impact Dashboard shows stats"
echo "   ✔ DynamoDB storing sessions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
