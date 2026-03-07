# WalkInMyShoes — Technical Design Specification

**Project**: WalkInMyShoes — Immersive Disability Empathy & Accessibility Training Platform
**Version**: 2.0 (Bedrock Edition)
**Date**: March 7, 2026
**Status**: Production — Live
**Live URL**: https://d2d1ibzdtgm1nq.cloudfront.net
**GitHub**: https://github.com/kalimx03/WalkInMyShoes_OG

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER (Any Device)                             │
│          Desktop Browser | Mobile | Tablet | Future: VR Headset         │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │ HTTPS (TLS 1.3)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    AMAZON CLOUDFRONT                                    │
│  Distribution ID: E2FKI267871EMW                                        │
│  Domain: d2d1ibzdtgm1nq.cloudfront.net                                 │
│  • 450+ global edge locations                                           │
│  • HTTPS enforced (HTTP → HTTPS redirect)                              │
│  • Brotli + Gzip compression                                           │
│  • Cache-Control: immutable for JS/CSS, no-cache for index.html        │
└──────────┬──────────────────────────────────────┬───────────────────────┘
           │                                      │
           ▼                                      ▼
┌──────────────────────┐              ┌───────────────────────────────────┐
│  AMAZON S3           │              │  AMAZON API GATEWAY               │
│  walkinmyshoes-      │              │  ID: x5rbnqm2v4                   │
│  frontend-2026       │              │  Region: us-east-1                │
│                      │              │  Stage: /dev                      │
│  Static Assets:      │              │                                   │
│  • index.html        │              │  Routes:                          │
│  • /assets/*.js      │              │  POST  /ai         → Lambda       │
│  • /assets/*.css     │              │  GET   /analytics  → Lambda       │
│  • Source maps       │              │  POST  /progress   → Lambda       │
│                      │              │  GET   /leaderboard → Lambda      │
│  Access: CloudFront  │              │  OPTIONS /* → CORS Mock           │
│  OAC only (private)  │              │                                   │
└──────────────────────┘              └──────────────────┬────────────────┘
                                                         │ Lambda Proxy
                                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         AWS LAMBDA                                     │
│  Function: walkinmyshoes-ai                                           │
│  ARN: arn:aws:lambda:us-east-1:210454360133:function:walkinmyshoes-ai │
│  Runtime: Node.js 20.x (ES Modules)                                   │
│  Memory: 256 MB | Timeout: 60s | Handler: index.handler               │
│  IAM Role: walkinmyshoes-ai-role-ms7g9...                             │
│                                                                        │
│  Actions Handled:                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ analyzeAccessibility  → Rekognition + Bedrock → JSON audit       │ │
│  │ editImage             → Rekognition + Bedrock → remediation text │ │
│  │ chat                  → Bedrock → conversational response        │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└──────────┬──────────────────────────────────┬──────────────────────────┘
           │                                  │
           ▼                                  ▼
┌──────────────────────────┐    ┌──────────────────────────────────────────┐
│  AMAZON REKOGNITION      │    │  AMAZON BEDROCK                          │
│  Region: us-east-1       │    │  Region: us-east-1                       │
│                          │    │  Model: us.amazon.nova-lite-v1:0         │
│  Operations:             │    │  (Amazon Nova 2 Lite)                    │
│  • DetectLabels          │    │                                          │
│    MaxLabels: 40         │    │  Use Cases:                              │
│    MinConfidence: 55%    │    │  • ADA/WCAG/RPWD accessibility audit     │
│    Returns: labels,      │    │  • Contractor remediation reports        │
│    confidence, parents,  │    │  • Multi-turn accessibility expert chat  │
│    bounding boxes        │    │                                          │
│                          │    │  Inference Type:                         │
│  • DetectText            │    │  Cross-region on-demand throughput       │
│    Returns: lines,       │    │  (us. prefix = US inference profile)     │
│    confidence, text,     │    │                                          │
│    geometry              │    │  Token limits:                           │
│                          │    │  Audit: 2500 max_new_tokens              │
│  • Parallel execution:   │    │  Chat: 700 max_new_tokens                │
│    Promise.all([...])    │    │  Temperature: 0.5                        │
└──────────────────────────┘    └──────────────────────────────────────────┘
                                                │
                                                ▼
                               ┌────────────────────────────────────────────┐
                               │  AMAZON COGNITO                            │
                               │  User Pool: us-east-1_VHC0a9xM3           │
                               │  Client: 20iorjt3l68ebjgohdrd0agj8a       │
                               │  Domain: walkinmyshoes-auth.auth...        │
                               │                                            │
                               │  • Hosted UI for sign-in/sign-up          │
                               │  • JWT access + refresh tokens             │
                               │  • Session management                      │
                               │  • OAuth 2.0 flows                         │
                               └────────────────────────────────────────────┘
```

### 1.2 Request Flow: AR Accessibility Scan (Critical Path)

```
1. User opens AR Auditor → camera permission requested
2. User clicks "Scan Now"
3. Browser: canvas.toDataURL('image/jpeg', 0.8) → base64 string
4. services/bedrock.ts: POST to API Gateway /ai
   Body: { action: 'analyzeAccessibility', imageBase64: '...' }
5. API Gateway → Lambda proxy integration
6. Lambda: Buffer.from(imageBase64, 'base64') → imgBuf
7. Size check: imgBuf.length > 4MB → error
8. Promise.all([
     rekognition.DetectLabels({ Bytes: imgBuf, MaxLabels: 40, MinConfidence: 55 }),
     rekognition.DetectText({ Bytes: imgBuf })
   ])
9. Build scene description:
   - labels: "Door (97%, in: Architecture); Person (99%)..."
   - visibleText: "EXIT, PUSH, STAIRS"
   - boxes: "Door: [top=200, left=100, bottom=800, right=400]..."
10. Bedrock Nova 2 Lite:
    system: [{ text: "You are ADA inspector..." }]
    messages: [{ role: 'user', content: [{ text: fullAuditPrompt }] }]
    inferenceConfig: { max_new_tokens: 2500, temperature: 0.5 }
11. Parse response: body.output.message.content[0].text
12. Strip markdown fences → JSON.parse → validate issues[]
13. Return: { statusCode: 200, body: JSON.stringify({ result: auditJSON }) }
14. Frontend: parse issues → render AR bounding boxes on camera frame
15. User sees color-coded overlays with ADA violations + costs
```

---

## 2. Frontend Architecture

### 2.1 Technology Stack

```
Core:
  React 18.3.1          — UI component library
  TypeScript 5.5.3      — Type safety
  Vite 5.3.4            — Build tool + dev server

3D & Simulation:
  Three.js              — WebGL 3D rendering for VR scenes
  WebXR Device API      — VR/AR device integration (native browser)
  Web Audio API         — Hearing loss audio filters
  SVG Filters           — Color blindness simulation matrices
  CSS Animations        — Visual impairment progressive blur

UI:
  Tailwind CSS          — Utility-first styling
  React Portals         — Modal overlays
  React Refs            — Imperative AI Guide control

State Management:
  React useState        — Local component state
  React useRef          — Mutable refs (camera, AI guide)
  React useCallback     — Memoized handlers
  React Context         — Auth state (Cognito)

Charts & Data:
  Recharts 2.12.7       — Impact Dashboard visualization
```

### 2.2 Component Architecture

```
App.tsx (Router)
├── Layout.tsx (Navigation shell)
│   ├── /                    → LandingPage / Onboarding.tsx
│   ├── /simulations         → Scenario selector
│   │   ├── VisualImpairmentScene.tsx
│   │   │   └── AIGuide.tsx (floating panel)
│   │   ├── HearingLossScene.tsx
│   │   │   └── AIGuide.tsx (floating panel)
│   │   ├── MotorDisabilityScene.tsx
│   │   │   └── AIGuide.tsx (floating panel)
│   │   └── ColorBlindnessScene.tsx
│   │       └── AIGuide.tsx (floating panel)
│   ├── /ar-auditor          → ARAuditor.tsx
│   │   ├── Camera feed (canvas + video)
│   │   ├── AR overlay (SVG bounding boxes)
│   │   ├── Issue list panel
│   │   ├── AIGuide.tsx (mode='fixed')
│   │   └── Synthesize Fix panel
│   └── /impact              → ImpactDashboard.tsx
│       ├── Empathy score card
│       ├── Scenarios completed
│       ├── Recharts visualizations
│       └── Certificate download
└── Onboarding.tsx (first-visit tutorial overlay)
```

### 2.3 Services Layer

#### services/bedrock.ts — Amazon Bedrock Integration

```typescript
// Core function: proxies all AI requests through Lambda
async function callLambda(payload: object, retries = 2): Promise<any>
  // Fetch: POST to ${VITE_API_BASE_URL}/ai
  // Timeout: 55 seconds (AbortController)
  // Retry: up to 2 times on network error, 1.5s backoff on 429
  // Error: throws with message for UI to display

// AR Auditor: camera frame → Bedrock audit JSON
async function analyzeAccessibility(imageBase64: string): Promise<string>
  // Sends to Lambda: { action: 'analyzeAccessibility', imageBase64 }
  // Strips markdown fences from Nova response
  // Validates JSON has issues[] array
  // Returns: JSON.stringify(parsed) or safe fallback JSON

// Synthesize Fix: issue context → remediation report
async function editImage(imageBase64: string, prompt: string): Promise<string>
  // Sends to Lambda: { action: 'editImage', imageBase64, prompt }
  // Returns raw text report (markdown formatted)

// AI Guide: creates chat session object
function createGuideChat(context: string): { sendMessage(text): Promise<{text}> }
  // Maintains local history array in closure
  // Sends: { action: 'chat', context, messages: [...history] }
  // Pushes both user and assistant messages to history
  // Returns: { text: reply }

export { bedrockService as geminiService } // alias for zero component changes
```

#### services/auth.ts — Amazon Cognito

```typescript
// Cognito configuration
const cognitoConfig = {
  userPoolId: VITE_COGNITO_USER_POOL_ID,     // us-east-1_VHC0a9xM3
  clientId: VITE_COGNITO_CLIENT_ID,           // 20iorjt3l68ebjgohdrd0agj8a
  domain: VITE_COGNITO_DOMAIN                  // walkinmyshoes-auth.auth...
}

// Auth methods
signIn()         → redirect to Cognito hosted UI
signOut()        → clear tokens + redirect
getUser()        → decode JWT, return user profile
getToken()       → return current access token
refreshSession() → use refresh token to get new access token
```

#### services/api.ts — Backend API Client

```typescript
// REST calls to API Gateway for progress, analytics, leaderboard
saveProgress(userId, sessionData)    → POST /progress
getLeaderboard()                     → GET /leaderboard
getAnalytics(userId)                 → GET /analytics
```

### 2.4 VR Scene Design

#### Visual Impairment Scene (VisualImpairmentScene.tsx)

```
CSS filter pipeline:
Stage 0 (Normal):   blur(0px) brightness(1) contrast(1)
Stage 1 (Mild):     blur(2px) brightness(0.9)
Stage 2 (Moderate): blur(5px) brightness(0.7) contrast(0.8)
Stage 3 (Severe):   blur(10px) brightness(0.5) contrast(0.6)
Stage 4 (Profound): blur(20px) brightness(0.2) grayscale(0.8)

3D Environment: Three.js canvas
  - City block with buildings, paths, signage
  - NavigationControls for WASD/touch movement
  - Task tracker overlay (read sign, find entrance, cross street)
```

#### Hearing Loss Scene (HearingLossScene.tsx)

```
Web Audio API pipeline:
  AudioContext → MediaStreamSource → BiquadFilter(lowpass) → GainNode → destination
  
  Filters:
  - Lowpass: cutoff 1000Hz (moderate loss)
  - Gain reduction: 0.3–0.7× volume
  - Tinnitus: OscillatorNode at 6000Hz, gain 0.05

Caption system:
  - Captions ON: full text, synchronized
  - Captions OFF: simulated degradation, partial loss
  - Toggle via accessibility control
```

#### Motor Disability Scene (MotorDisabilityScene.tsx)

```
Wheelchair physics (CSS/JS simulation):
  - Max speed: 2px/frame (vs 5px normal)
  - Turning: requires separate left/right controls (no strafing)
  - Door fatigue: progress bar fills on hold, resets if released early
  - Barrier detection: collision boxes on narrow passages

Environment:
  - Two-floor building layout
  - Accessible route: ramp + wide door + elevator
  - Inaccessible route: stairs + narrow door + no lift
  - NPC patrol paths on timed intervals
```

#### Color Blindness Scene (ColorBlindnessScene.tsx)

```
SVG filter matrices (scientifically accurate):
  Protanopia:    [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758]
  Deuteranopia:  [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7]
  Tritanopia:    [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525]
  Achromatopsia: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114]

Applied via:
  <feColorMatrix type="matrix" values="[matrix]" />
  in SVG defs, applied as CSS filter to entire scene div
```

---

## 3. Lambda Architecture (lambda/index.mjs)

### 3.1 Module Structure

```javascript
// ES Module (type: "module" in package.json)
import { BedrockRuntimeClient, InvokeModelCommand }
import { RekognitionClient, DetectLabelsCommand, DetectTextCommand }

const REGION        = "us-east-1"
const BEDROCK_MODEL = "us.amazon.nova-lite-v1:0"  // Nova 2 Lite cross-region
const MAX_IMG_BYTES = 4 * 1024 * 1024              // 4MB Rekognition limit

// CORS headers (all responses)
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS"
}
```

### 3.2 Nova 2 Lite API Format

```javascript
// CRITICAL: Nova uses different format than Claude
// Wrong (Anthropic format): { anthropic_version, max_tokens, system: string, messages }
// Correct (Nova format):
body: JSON.stringify({
  messages: messages.map(m => ({
    role: m.role,
    content: typeof m.content === "string"
      ? [{ text: m.content }]   // ← Must be array, not string
      : m.content,
  })),
  system: [{ text: systemPrompt }],  // ← Must be array
  inferenceConfig: {
    max_new_tokens: maxTokens,
    temperature: 0.5,
  },
})

// Response parsing (also different from Claude):
// Claude: body.content[0].text
// Nova:   body.output.message.content[0].text
return (body.output?.message?.content?.[0]?.text ?? "").trim();
```

### 3.3 analyzeAccessibility Action

```
Input:  { action: 'analyzeAccessibility', imageBase64: string }
Output: { result: '{"issues":[...],"overallComplianceScore":75}' }

Pipeline:
1. Decode base64 → Buffer
2. Check size ≤ 4MB
3. Promise.all([DetectLabels, DetectText])
4. Build scene description:
   - labels: "Door (97%, in: Architecture); Window (89%)..."
   - visibleText: "EXIT, PUSH"
   - boxes (top 12): "Door: [top=200, left=100, bottom=800, right=400]"
5. Nova audit prompt:
   - System: ADA inspector, JSON only, no markdown
   - User: full scene description + audit checklist + JSON schema
   - max_new_tokens: 2500
6. Return JSON string

Output JSON schema:
{
  "issues": [{
    "type": "DOORWAY",
    "status": "NON_COMPLIANT",
    "description": "Door opening appears <32 inches",
    "recommendation": "Widen to ≥36 inches per ADA §404.2.3",
    "costEstimate": "$500-$2000",
    "coordinates": [200, 100, 800, 400]  // [ymin, xmin, ymax, xmax]
  }],
  "overallComplianceScore": 45
}
```

### 3.4 editImage Action (Synthesize Fix)

```
Input:  { action: 'editImage', imageBase64: string, prompt: string }
Output: { result: 'Markdown remediation report text' }

Pipeline:
1. Rekognition DetectLabels (25 labels, 65% confidence) → scene context
2. Build remediation context: sceneLabels + user's issue description
3. Nova contractor report prompt:
   - 7 sections: Site Observation, ADA Violation, Remediation Spec,
     Expected Outcome, Cost Breakdown, Code References, Priority & Timeline
   - Costs in both ₹ and $
   - References ADA 2010, WCAG 2.1, RPWD Act 2016, NBC 2016
   - max_new_tokens: 2500
4. Return raw report text (markdown formatted for frontend display)
```

### 3.5 chat Action (AI Guide)

```
Input:  { action: 'chat', context: string, messages: [{role, content}] }
Output: { result: 'AI response text' }

Pipeline:
1. Validate messages is non-empty array
2. Filter: only user/assistant roles, non-empty content strings
3. Slice: last 20 messages (context window management)
4. Shift: remove leading assistant messages (Nova requires user-first)
5. Nova with accessibility expert system prompt:
   - Context-aware (knows current simulation)
   - Cites ADA §sections and WCAG SC X.X.X
   - References RPWD Act 2016 for India
   - India statistics ("2.68 crore people with disabilities")
   - 2-4 sentence responses
   - max_new_tokens: 700
6. Return reply text, fallback if empty
```

---

## 4. AI Design Decisions

### 4.1 Why Amazon Bedrock Nova 2 Lite

| Factor | Decision |
|---|---|
| Model type | Amazon's own model — no third-party verification required |
| Inference profile | `us.amazon.nova-lite-v1:0` — cross-region on-demand (no provisioning) |
| Speed | 1.7s latency in playground for short prompts |
| Cost | $0.00006/1K input tokens — extremely cost-effective |
| Availability | Available immediately on valid AWS account |
| Format | Different from Claude — requires array content format |

### 4.2 Why Amazon Rekognition + Bedrock (Not Vision Model)

We intentionally split vision and language:

```
Option A (rejected): Send image directly to multimodal LLM
  Problems:
  - Higher token cost (image tokens expensive)
  - No structured bounding box data
  - Can't do parallel processing
  - Less precise spatial coordinates

Option B (chosen): Rekognition (vision) → Bedrock (reasoning)
  Benefits:
  - Rekognition gives exact bounding boxes (0-1 normalized coordinates)
  - Parallel API calls (DetectLabels + DetectText simultaneously)
  - Bedrock receives structured text → cheaper, faster, more accurate audit
  - Two AWS services used = better hackathon score
  - Rekognition free tier: 5,000 images/month
```

### 4.3 Prompt Engineering Strategy

**analyzeAccessibility prompt design:**
- Role: "certified ADA 2010 + WCAG 2.1 accessibility inspector"
- Hard constraint: "ONLY valid JSON, no markdown, no backticks"
- Structured input: objects → text → bounding boxes (separate sections)
- Explicit schema: full JSON template in prompt
- Minimum 5 issues: enforced in prompt ("Every real physical space has multiple elements")
- Coordinate guidance: normalize to 0-1000 space, min box 80×80

**chat prompt design:**
- Role: "AI Expert Guide in WalkInMyShoes platform"
- Length constraint: "2-4 sentences unless explicitly asked for more"
- Citation requirement: "ALWAYS cite exact ADA sections (§) or WCAG criteria"
- India context: "Reference RPWD Act 2016 and NBC 2016"
- Statistics: specific India data hardcoded into system prompt
- Brand: "You are powered by Amazon Bedrock"

---

## 5. Security Architecture

### 5.1 API Security

```
No API keys in frontend:
  ✅ All AI calls → API Gateway → Lambda (server-side)
  ✅ Bedrock + Rekognition credentials from IAM role (not env vars)
  ✅ VITE_API_BASE_URL is public (API Gateway URL) — safe to expose
  ✅ No secret keys in browser

IAM Least Privilege:
  Lambda role has ONLY:
  - AmazonRekognitionFullAccess
  - AmazonBedrockFullAccess
  (No S3, DynamoDB, Cognito access from Lambda)

CORS:
  API Gateway: CORS enabled on /ai resource
  Lambda: CORS_HEADERS added to every response
  Origin: * (allows CloudFront + localhost dev)
```

### 5.2 Data Security

```
No PII stored in Lambda or Bedrock:
  - Images processed in-memory only (not stored to S3)
  - Chat messages not persisted (session-only)
  - User data only in Cognito (email + display name)

S3 Security:
  - Bucket: public access BLOCKED
  - Access: CloudFront Origin Access Control (OAC) only
  - No direct S3 URLs exposed

CloudFront Security:
  - HTTPS only (HTTP → 301 redirect)
  - TLS 1.2 minimum
  - Security headers via CloudFront response headers policy
```

---

## 6. Performance Architecture

### 6.1 Frontend Performance

```
Vite Build Optimizations:
  - Code splitting: each route lazy-loaded
  - Tree shaking: unused Three.js modules excluded
  - Asset hashing: cache-busting on deploy
  - Minification: Terser for JS, cssnano for CSS

CloudFront Caching:
  - JS/CSS: Cache-Control: public, max-age=31536000, immutable (1 year)
  - index.html: no-cache (always fresh on deploy)
  - Images: max-age=86400 (1 day)

Three.js Optimizations:
  - WebGL 2.0 when available
  - Geometry disposal on scene unmount
  - Texture resolution adapts to device pixel ratio
```

### 6.2 Lambda Performance

```
Cold Start Mitigation:
  - 256MB memory (faster CPU allocation)
  - ES Modules (faster than CommonJS for tree shaking)
  - AWS SDK v3 (modular — only import what's needed)
  - No VPC (VPC adds 1-3s cold start penalty)

Parallel Processing:
  - Rekognition DetectLabels + DetectText: Promise.all (saves ~1-2s)

Timeout Strategy:
  - Lambda: 60 seconds
  - Frontend fetch: 55 seconds (AbortController)
  - Gap: 5 seconds for response serialization
```

---

## 7. Deployment Architecture

### 7.1 Deployment Pipeline

```
Developer Machine
      │
      ├── npm run build
      │     Vite compiles TS → JS, optimizes, hashes assets
      │     Output: ./dist/
      │
      ├── aws s3 sync dist/ s3://walkinmyshoes-frontend-2026
      │     --delete: removes old files
      │     --exclude "index.html": separate upload with different cache
      │     Cache: public,max-age=31536000,immutable for assets
      │
      ├── aws s3 cp dist/index.html ...
      │     Cache: no-cache,no-store,must-revalidate
      │
      └── aws cloudfront create-invalidation --paths "/*"
            Purges all edge cache in ~60 seconds
            Users get new version on next request
```

### 7.2 Lambda Deployment

```
Lambda Updates (manual via AWS Console):
  1. Open lambda/index.mjs in VS Code
  2. Copy entire contents
  3. AWS Console → Lambda → walkinmyshoes-ai → Code tab
  4. Select all → paste → Deploy

No CI/CD yet (Phase 2 roadmap):
  Future: GitHub Actions → automated Lambda deploy on push to main
```

### 7.3 Environment Management

```
.env (local development):
  VITE_API_BASE_URL=https://x5rbnqm2v4.execute-api.us-east-1.amazonaws.com/dev
  VITE_COGNITO_*=[values]
  S3_BUCKET=walkinmyshoes-frontend-2026
  CLOUDFRONT_ID=E2FKI267871EMW

Production (CloudFront):
  Same .env values baked into Vite build at compile time
  (import.meta.env.VITE_* inlined during npm run build)
  
  Critical: index.html is served fresh (no-cache) so env changes
  take effect immediately without cache invalidation
```

---

## 8. Monitoring & Observability

### 8.1 CloudWatch (Automatic)

```
Lambda Logs:
  - Log group: /aws/lambda/walkinmyshoes-ai
  - Logs: console.error("[Lambda Error]", action, err)
  - Retention: 14 days default

API Gateway Logs:
  - Request/response metrics
  - 4xx/5xx error rates
  - Latency percentiles

CloudFront Metrics:
  - Request count, cache hit rate, error rate
  - Bandwidth consumed
  - Available in CloudFront console
```

### 8.2 Frontend Error Tracking

```
React Error Boundaries:
  - All simulation scenes wrapped in ErrorBoundary.tsx
  - Catches render errors, shows fallback UI
  - Logs to console (Phase 2: send to CloudWatch via API)

Service Error Handling:
  - All fetch calls in try/catch
  - User-visible error messages (not stack traces)
  - Retry logic in callLambda (bedrock.ts)
```

---

## 9. Cost Architecture

### 9.1 AWS Pricing Model

```
Amazon CloudFront:
  Free tier: 1TB data transfer + 10M requests/month
  Beyond: $0.0085/GB (India edge)

Amazon S3:
  Free tier: 5GB storage + 20K GET requests
  Beyond: $0.023/GB storage

AWS Lambda:
  Free tier: 1M requests + 400,000 GB-seconds/month
  Beyond: $0.20/1M requests + $0.0000166667/GB-second
  walkinmyshoes-ai: 256MB × 30s avg = 7.68 GB-seconds/request

Amazon Rekognition:
  Free tier: 5,000 images/month (first 12 months)
  Beyond: $0.001/image (DetectLabels) + $0.001/image (DetectText)
  Per scan: ~$0.002

Amazon Bedrock (Nova 2 Lite):
  Input: $0.00006/1K tokens
  Output: $0.00024/1K tokens
  Per audit (~2000 input, 500 output): ~$0.000240
  Per chat (~500 input, 150 output): ~$0.000066

Amazon API Gateway:
  Free tier: 1M API calls/month
  Beyond: $3.50/million calls

Amazon Cognito:
  Free tier: 50,000 MAU
  Beyond: $0.0055/MAU

Total per 1,000 AR scans: ~$2.40 (Rekognition) + ~$0.24 (Bedrock) = ~$2.64
```

---

## 10. Technology Decision Log

| Decision | Options Considered | Chosen | Reason |
|---|---|---|---|
| AI Model | Claude 3 Haiku, Titan, Nova 2 Lite | **Nova 2 Lite** | No Anthropic verification needed, Amazon's own model, instant access |
| Vision AI | Multimodal LLM, Rekognition | **Rekognition** | Bounding boxes, parallel calls, free tier, structured output |
| Frontend | Next.js, Remix, React | **React + Vite** | Already implemented, fast builds, WebXR compatibility |
| Hosting | Amplify, EC2, S3+CloudFront | **S3 + CloudFront** | Zero server management, global CDN, lowest cost |
| Auth | Custom JWT, Firebase, Cognito | **Cognito** | Native AWS, hosted UI, free tier 50K MAU |
| 3D Engine | A-Frame, Babylon.js, Three.js | **Three.js** | Maximum control, WebXR native support, large ecosystem |
| API | GraphQL, WebSocket, REST | **REST (API Gateway)** | Simple, well-understood, Lambda proxy straightforward |
| Model API format | Anthropic format | **Nova format** | Nova requires array content `[{text}]`, not string |

---

**Document Owner**: Kalim Sayyed
**Last Updated**: March 7, 2026
**Version**: 2.0 — Bedrock Edition
**Status**: Production Live — https://d2d1ibzdtgm1nq.cloudfront.net
