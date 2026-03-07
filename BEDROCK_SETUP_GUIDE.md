# BEDROCK_SETUP_GUIDE.md
# WalkInMyShoes — AWS Bedrock Migration Setup Guide
# Follow these steps EXACTLY in order

---

## WHAT CHANGED

| Before (Groq)             | After (AWS Bedrock)                          |
|---------------------------|----------------------------------------------|
| Browser → Groq API        | Browser → API Gateway → Lambda → Bedrock     |
| API key in .env           | No API keys — IAM role handles auth          |
| Third-party AI (Groq)     | AWS-native AI (Rekognition + Bedrock)        |
| services/groq.ts          | services/bedrock.ts (drop-in replacement)    |

AWS Services now used: S3, CloudFront, Cognito, API Gateway, Lambda, Rekognition, Bedrock

---

## STEP 1 — Enable Bedrock Model Access

1. Go to: https://console.aws.amazon.com/bedrock
2. Region must be: us-east-1 (top-right corner)
3. Left sidebar → click "Model access"
4. Click "Modify model access" button (top right)
5. Find and CHECK: "Claude 3 Haiku" under Anthropic
6. Click "Save changes"
7. Status changes from "Available" → "Access granted" (takes ~2 min)

---

## STEP 2 — Create the Lambda Function

1. Go to: https://console.aws.amazon.com/lambda
2. Click "Create function"
3. Fill in:
   - Function name: walkinmyshoes-ai
   - Runtime: Node.js 20.x
   - Architecture: x86_64
4. Click "Create function"

5. In the code editor that appears:
   - Delete all existing code
   - Open the file: lambda/index.mjs (from this zip)
   - Copy ALL of its contents
   - Paste into the Lambda code editor
   - Click "Deploy" button

6. Change the handler:
   - Click "Configuration" tab → "General configuration" → Edit
   - Handler: index.handler
   - Timeout: 60 seconds (Bedrock needs time)
   - Memory: 256 MB
   - Click Save

---

## STEP 3 — Give Lambda IAM Permissions

1. In your Lambda function → "Configuration" tab → "Permissions"
2. Click the IAM role link (looks like: walkinmyshoes-ai-role-xxxxxxxx)
3. In IAM → click "Add permissions" → "Attach policies"
4. Search and attach BOTH of these:
   - AmazonRekognitionFullAccess
   - AmazonBedrockFullAccess
5. Click "Add permissions"

---

## STEP 4 — Add Lambda to API Gateway

1. Go to: https://console.aws.amazon.com/apigateway
2. Click your existing API (walkinmyshoes or similar)
3. In the left panel, click "Resources"
4. Click on the root "/" → "Actions" → "Create Resource"
   - Resource Name: ai
   - Resource Path: ai
   - Enable CORS: YES (check the box)
   - Click "Create Resource"

5. With /ai selected → "Actions" → "Create Method"
   - Select: POST from dropdown → click the checkmark
   - Integration type: Lambda Function
   - Lambda Region: us-east-1
   - Lambda Function: walkinmyshoes-ai
   - Click Save → OK (grant permission popup)

6. Also create OPTIONS method on /ai for CORS:
   - With /ai selected → "Actions" → "Create Method"
   - Select: OPTIONS → checkmark
   - Integration type: Mock
   - Click Save

7. Click "Actions" → "Enable CORS"
   - Leave defaults, click "Enable CORS and replace existing CORS headers"
   - Click "Yes, replace existing values"

8. Click "Actions" → "Deploy API"
   - Deployment stage: dev
   - Click "Deploy"

9. Note your invoke URL: shown at top of stage editor
   Looks like: https://x5rbnqm2v4.execute-api.us-east-1.amazonaws.com/dev
   Your /ai endpoint is: https://x5rbnqm2v4.execute-api.us-east-1.amazonaws.com/dev/ai

---

## STEP 5 — Set up your .env file

Copy .env.example to .env:

```
VITE_API_BASE_URL=https://x5rbnqm2v4.execute-api.us-east-1.amazonaws.com/dev
VITE_COGNITO_DOMAIN=walkinmyshoes-auth.auth.us-east-1.amazoncognito.com
VITE_COGNITO_CLIENT_ID=20iorjt3l68ebjgohdrd0agj8a
VITE_COGNITO_USER_POOL_ID=us-east-1_VHC0a9xM3
VITE_COGNITO_REGION=us-east-1
VITE_CLOUDFRONT_DOMAIN=https://d2d1ibzdtgm1nq.cloudfront.net
S3_BUCKET=walkinmyshoes-frontend-2026
CLOUDFRONT_ID=E2FKI267871EMW
AWS_REGION=us-east-1
```

No GROQ_API_KEY needed anymore.

---

## STEP 6 — Test Locally

```powershell
npm install
npm run dev
```

Open http://localhost:5173

Test checklist:
✅ AR Auditor → Initialize Lens → Scan Now → bounding boxes appear
✅ Issues listed in sidebar with scores
✅ Click "Consult AI" → AI Guide opens and responds (via Bedrock)
✅ Click "Synthesize Fix" → Remediate tab → contractor report generates
✅ AI Guide chat responds to typed messages
✅ Simulation scenes → AI Guide works

If AI Guide says "endpoint not found" → check VITE_API_BASE_URL in .env

---

## STEP 7 — Build for Production

```powershell
npm run build
```

---

## STEP 8 — Deploy to CloudFront

Run these PowerShell commands one by one:

```powershell
aws s3 sync dist/ s3://walkinmyshoes-frontend-2026 --delete --region us-east-1 --cache-control "public,max-age=31536000,immutable" --exclude "index.html"

aws s3 cp dist/index.html s3://walkinmyshoes-frontend-2026/index.html --region us-east-1 --cache-control "no-cache,no-store,must-revalidate"

aws cloudfront create-invalidation --distribution-id E2FKI267871EMW --paths "/*"
```

Wait 2-3 minutes → open https://d2d1ibzdtgm1nq.cloudfront.net

---

## AWS SERVICES USED (for hackathon documentation)

1. Amazon S3              — Static frontend hosting
2. Amazon CloudFront      — Global CDN delivery
3. Amazon Cognito         — User authentication
4. Amazon API Gateway     — Secure REST API routing
5. AWS Lambda             — Serverless AI orchestration
6. Amazon Rekognition     — Computer vision (object detection, text recognition)
7. Amazon Bedrock         — Claude 3 Haiku LLM (accessibility audit + chat)

---

## TROUBLESHOOTING

| Problem                          | Fix                                                    |
|----------------------------------|--------------------------------------------------------|
| "endpoint not found" in chat     | Check VITE_API_BASE_URL has no trailing slash          |
| Lambda returns 403               | IAM role missing AmazonBedrockFullAccess               |
| Lambda returns 500               | Check CloudWatch Logs for the Lambda function          |
| No issues from AR scan           | Image too dark/blurry — try better lighting            |
| Bedrock model not found          | Enable Claude 3 Haiku in Bedrock Model Access console  |
| CORS error in browser            | Re-enable CORS on API Gateway /ai resource             |

## CloudWatch Logs (debugging)
Lambda → Monitor tab → View CloudWatch logs
Filter by: ERROR to see only failures
