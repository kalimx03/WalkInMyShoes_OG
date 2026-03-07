# WalkInMyShoes — Requirements Specification

**Project**: WalkInMyShoes — Immersive Disability Empathy & Accessibility Training Platform
**Version**: 2.0 (Bedrock Edition)
**Date**: March 7, 2026
**Status**: Production — Live on AWS CloudFront
**Hackathon**: AWS AI for Bharat 2026
**Live URL**: https://d2d1ibzdtgm1nq.cloudfront.net

---

## 1. Executive Requirements

### 1.1 Business Objectives

**Primary Goal**: Create an immersive, AI-powered WebXR platform that builds genuine empathy for people with disabilities while providing affordable, AI-powered ADA/RPWD Act 2016 compliance auditing for Indian buildings and infrastructure.

**Core Problem Statements**:
- 2.68 crore Indians live with disabilities (Census 2011) but <5% of buildings comply with RPWD Act 2016
- Traditional accessibility training has only 20% retention vs 90% for experiential learning
- Professional accessibility audits cost ₹50,000–₹2,00,000 — unaffordable for most businesses
- Empathy for disability cannot be taught through lectures alone — it must be experienced

**Success Metrics**:
- 85%+ simulation completion rate
- 40–60 point empathy score improvement per user
- AR audit scan completes in <10 seconds
- AI Guide responds in <5 seconds for 90% of queries
- Page load <3 seconds globally via CloudFront
- Zero recurring AI API cost (AWS Bedrock pay-per-use)

### 1.2 Target Users

**Primary Personas**:

1. **Corporate DEI Manager** — Needs scalable, measurable empathy training for 500+ employees
2. **Building Owner / Architect** — Needs affordable RPWD Act 2016 compliance audit without hiring consultants
3. **Medical Educator** — Needs empathy training for healthcare students treating patients with disabilities
4. **Government Compliance Officer** — Needs auditing tool for public infrastructure assessment
5. **Accessibility Consultant** — Needs professional-grade AR auditing with detailed contractor reports

### 1.3 Market Context

- **TAM**: ₹16,000 crore accessibility training and compliance market (India + global)
- **RPWD Act 2016**: Mandates accessibility in all public buildings — enforcement is increasing
- **SDG 10**: Aligns with UN Sustainable Development Goal — Reducing Inequalities
- **Competitive Advantage**: Only platform combining VR empathy simulation + AI-powered AR auditing on AWS

---

## 2. Functional Requirements

### 2.1 VR Simulation Scenarios

#### FR-2.1.1 Visual Impairment Simulation

**Description**: Users experience progressive vision loss while navigating a virtual environment.

**Acceptance Criteria**:
- AC-1: MUST provide 5 progressive vision stages (mild blur → severe → complete)
- AC-2: MUST accurately simulate glaucoma, macular degeneration, cataracts using CSS/SVG filters
- AC-3: Environment MUST include 3D space with buildings, pathways, and obstacles
- AC-4: MUST include 3–5 interactive navigation tasks that reveal barriers
- AC-5: Visual filters MUST apply in real-time with smooth transitions
- AC-6: MUST track task completion time and error rates for empathy scoring
- AC-7: Debrief MUST cite WCAG 2.1 color contrast standards and India statistics
- AC-8: AI Guide MUST be available during simulation for real-time questions
- **Status**: ✅ Implemented

#### FR-2.1.2 Hearing Loss Simulation

**Description**: Users experience frequency loss, tinnitus, and communication barriers in a virtual environment.

**Acceptance Criteria**:
- AC-1: MUST simulate frequency-specific hearing loss using Web Audio API
- AC-2: MUST demonstrate tinnitus (ringing), muffled audio, directional confusion
- AC-3: MUST include toggle for captions to show accessibility impact of captioning
- AC-4: MUST demonstrate multi-modal alert testing (audio-only vs audio+visual)
- AC-5: Debrief MUST reference 466M people worldwide with hearing loss
- AC-6: AI Guide MUST explain WCAG 2.1 SC 1.2 (Captions) and SC 1.4.2 (Audio Control)
- **Status**: ✅ Implemented

#### FR-2.1.3 Motor Disability Navigation

**Description**: Users navigate a building with wheelchair physics and realistic architectural barriers.

**Acceptance Criteria**:
- AC-1: MUST simulate realistic wheelchair constraints (speed, turning radius, no strafing)
- AC-2: Environment MUST include architectural barriers (narrow doors, steps, no ramps)
- AC-3: MUST implement fatigue mechanics for push-heavy obstacles
- AC-4: MUST include both accessible and inaccessible routes for comparison
- AC-5: MUST track time comparison vs unrestricted navigation (target: 3–5× longer)
- AC-6: Debrief MUST explain ADA §404 (door width ≥32"), §405 (ramp ≤1:12), §308 (reach range 15–48" AFF)
- AC-7: MUST reference RPWD Act 2016 building access provisions
- **Status**: ✅ Implemented

#### FR-2.1.4 Color Blindness Experience

**Description**: Users experience 4 types of color vision deficiency in a vibrant, color-dependent environment.

**Acceptance Criteria**:
- AC-1: MUST support Protanopia, Deuteranopia, Tritanopia, and Achromatopsia
- AC-2: Color matrices MUST be scientifically accurate (IEC/ISO color vision standards)
- AC-3: Filters MUST apply in real-time via SVG filter elements
- AC-4: Environment MUST be deliberately color-reliant to reveal design dependency
- AC-5: MUST include tasks that require color differentiation
- AC-6: Debrief MUST explain WCAG 2.1 SC 1.4.1 (Use of Color) and SC 1.4.3 (Contrast)
- **Status**: ✅ Implemented

---

### 2.2 AR Accessibility Auditor

**Description**: Real-time camera-based ADA/WCAG/RPWD Act compliance scanner powered by Amazon Rekognition and Amazon Bedrock.

#### FR-2.2.1 Camera & Image Capture

- AC-1: MUST request camera permissions on AR mode activation with clear explanation
- AC-2: MUST support live camera feed display
- AC-3: MUST capture still frames for AI analysis on user trigger (Scan Now)
- AC-4: MUST compress image to <4MB before sending to Lambda (Rekognition max)
- AC-5: MUST show "Scanning..." loading indicator during analysis
- AC-6: MUST display captured frame thumbnail alongside results
- **Status**: ✅ Implemented

#### FR-2.2.2 Amazon Rekognition Integration

- AC-1: Lambda MUST call `DetectLabels` with MaxLabels=40, MinConfidence=55%
- AC-2: Lambda MUST call `DetectText` for visible signage and numbers
- AC-3: Both Rekognition calls MUST run in **parallel** (Promise.all) for speed
- AC-4: MUST extract bounding box coordinates (normalized 0–1 → scaled 0–1000)
- AC-5: MUST include parent category context in label descriptions
- AC-6: MUST filter text detections to LINE type with >70% confidence
- AC-7: MUST pass top 12 bounding box instances to Bedrock for spatial audit
- **Status**: ✅ Implemented

#### FR-2.2.3 Amazon Bedrock Audit (Nova 2 Lite)

- AC-1: Lambda MUST call `us.amazon.nova-lite-v1:0` via InvokeModelCommand
- AC-2: Message content MUST be formatted as array `[{text: "..."}]` (Nova format)
- AC-3: System prompt MUST instruct model to return ONLY valid JSON — no markdown
- AC-4: Audit prompt MUST cover: DOORWAY, RAMP, STEPS, PATHWAY, TACTILE PAVING, SIGNAGE, CONTROLS, SEATING, PARKING, OBSTACLES, EMERGENCY, FLOORING, LIGHTING
- AC-5: MUST reference ADA 2010, WCAG 2.1, AND RPWD Act 2016 (India)
- AC-6: Response MUST include minimum 5 issues per scan
- AC-7: Each issue MUST include: type, status, description, recommendation, costEstimate, coordinates [ymin,xmin,ymax,xmax]
- AC-8: Response MUST include `overallComplianceScore` (0–100)
- AC-9: Frontend MUST strip markdown fences from Nova response before JSON.parse
- **Status**: ✅ Implemented

#### FR-2.2.4 AR Overlay Display

- AC-1: MUST render color-coded bounding boxes on camera frame
  - GREEN: COMPLIANT
  - RED: NON_COMPLIANT
  - YELLOW: WARNING
- AC-2: MUST display issue type label above each bounding box
- AC-3: MUST show compliance score badge (SPATIAL HUD)
- AC-4: MUST show RPWD Act 2016 banner for Indian regulatory context
- AC-5: MUST list all issues in scrollable panel with ADA fix and cost estimate
- AC-6: Each issue MUST have "Fix" and "AI" action buttons
- **Status**: ✅ Implemented

#### FR-2.2.5 Synthesize Fix (Remediation Report)

- AC-1: User selects detected issue → clicks "Synthesize Fix"
- AC-2: Lambda sends issue context + Rekognition scene labels to Bedrock
- AC-3: Bedrock generates contractor-ready 7-section remediation report
- AC-4: Report MUST include: Site Observation, ADA Violation, Remediation Spec, Expected Outcome, Cost Breakdown (₹ and $), Code References, Priority & Timeline
- AC-5: Cost MUST be shown in both Indian Rupees (₹) and USD ($)
- AC-6: Priority MUST be CRITICAL / HIGH / MEDIUM / LOW
- AC-7: Must reference ADA 2010 sections, WCAG criteria, RPWD Act 2016, NBC 2016
- **Status**: ✅ Implemented

---

### 2.3 AI Expert Guide

**Description**: Context-aware conversational assistant powered by Amazon Bedrock Nova 2 Lite, available in all simulations and AR Auditor.

#### FR-2.3.1 Conversation Engine

- AC-1: MUST call Lambda `action: 'chat'` with full message history
- AC-2: MUST maintain conversation history per session in component state
- AC-3: MUST validate message alternation (user/assistant) before sending to Bedrock
- AC-4: MUST trim history to last 20 messages to stay within context limits
- AC-5: First message MUST always be role: 'user' (Bedrock requirement)
- AC-6: MUST handle empty/null responses gracefully with fallback message
- **Status**: ✅ Implemented

#### FR-2.3.2 Context Awareness

- AC-1: System prompt MUST include current simulation/scenario name
- AC-2: MUST cite exact ADA sections (§) in responses where relevant
- AC-3: MUST cite WCAG success criteria (e.g. SC 1.4.3) where relevant
- AC-4: MUST reference RPWD Act 2016 and NBC 2016 for Indian context
- AC-5: MUST use India-specific statistics ("2.68 crore people with disabilities")
- AC-6: MUST be instructed to keep responses 2–4 sentences unless asked for more
- AC-7: MUST mention Amazon Bedrock when asked about its technology
- **Status**: ✅ Implemented

#### FR-2.3.3 AR Auditor Integration

- AC-1: AI Guide MUST appear as floating panel alongside AR scan results
- AC-2: "Consult AI" button MUST auto-populate guide with detected issue context
- AC-3: AI Guide MUST explain each detected issue when asked
- AC-4: Chat history MUST be isolated per AR Auditor session
- **Status**: ✅ Implemented

---

### 2.4 Impact Dashboard & Certification

- AC-1: MUST calculate empathy score (0–100) from behavioral data across simulations
- AC-2: MUST display scenarios completed, time spent, badges earned
- AC-3: MUST support pre/post assessment quizzes
- AC-4: MUST generate downloadable PDF certificates with date, score, scenarios
- AC-5: MUST show leaderboard rankings
- AC-6: MUST display real-world impact statistics
- **Status**: ✅ Implemented

---

### 2.5 Authentication (Amazon Cognito)

- AC-1: MUST integrate Amazon Cognito for user sign-up and sign-in
- AC-2: MUST use Cognito hosted UI for auth flow
- AC-3: MUST handle JWT token refresh automatically
- AC-4: MUST support guest/anonymous usage for core simulations (no forced login)
- AC-5: MUST store Cognito config in environment variables (never hardcoded)
- **Status**: ✅ Implemented

---

### 2.6 Onboarding Tutorial

- AC-1: MUST provide interactive tutorial on first visit
- AC-2: MUST explain 4 core features (simulations, AR Auditor, AI Guide, Dashboard)
- AC-3: MUST be skippable
- AC-4: MUST complete in <2 minutes
- AC-5: Feature descriptions MUST reference Amazon Bedrock (not legacy AI providers)
- **Status**: ✅ Implemented

---

## 3. Non-Functional Requirements

### 3.1 Performance

| Requirement | Target | Method |
|---|---|---|
| Page load time | <3 seconds globally | CloudFront CDN |
| AR scan analysis | <10 seconds | Rekognition parallel calls + Bedrock |
| AI Guide response | <5 seconds (90th percentile) | Lambda + Bedrock Nova 2 Lite |
| VR scene FPS | 60fps desktop / 30fps mobile | Three.js + WebGL 2.0 |
| Initial bundle size | <2MB | Vite code splitting |
| CloudFront latency | <200ms at edge | Global edge locations |

### 3.2 Security

| Requirement | Implementation |
|---|---|
| HTTPS only | CloudFront enforced |
| CORS | API Gateway configured, Lambda headers `Access-Control-Allow-Origin: *` |
| No API keys in frontend | All AI calls proxied through Lambda |
| IAM least privilege | Lambda role: only Rekognition + Bedrock |
| S3 public access | Blocked — served only via CloudFront |
| Auth tokens | Cognito JWT with 24hr expiry |

### 3.3 Scalability

- Lambda auto-scales 0 → 1,000+ concurrent executions
- CloudFront handles traffic spikes at edge (no origin hits for cached assets)
- S3 unlimited storage for static assets
- Cognito supports up to 50,000 MAU on free tier
- Bedrock pay-per-token: scales linearly with usage, no pre-provisioning

### 3.4 Reliability & Error Handling

- Lambda retries: 2 retries with 1s delay on network errors
- Bedrock timeout: 55 seconds (Lambda timeout: 60 seconds)
- Rekognition errors: caught, fallback message shown
- JSON parse errors from Bedrock: caught, safe fallback audit result returned
- Frontend: React Error Boundaries in all simulation scenes
- Rate limiting (429): automatic retry with exponential backoff

### 3.5 Accessibility (Platform itself)

- Platform MUST meet WCAG 2.1 Level AA (ironic if it didn't)
- Keyboard navigation for all interactive elements
- Color contrast ≥4.5:1 on all UI text
- Screen reader compatible navigation
- Alt text on all meaningful images

---

## 4. AWS Infrastructure Requirements

### 4.1 Lambda (walkinmyshoes-ai)

| Parameter | Value |
|---|---|
| Runtime | Node.js 20.x |
| Handler | index.handler |
| Memory | 256 MB |
| Timeout | 60 seconds |
| IAM Role Permissions | AmazonRekognitionFullAccess, AmazonBedrockFullAccess |
| Environment | us-east-1 |
| Module type | ES Module (import/export) |

### 4.2 Amazon Bedrock

| Parameter | Value |
|---|---|
| Model | Amazon Nova 2 Lite |
| Model ID | `us.amazon.nova-lite-v1:0` |
| Inference type | Cross-region on-demand |
| Max tokens (audit) | 2500 |
| Max tokens (chat) | 700 |
| Temperature | 0.5 |
| Message format | `[{role, content: [{text: "..."}]}]` |
| System format | `[{text: "..."}]` |

### 4.3 Amazon Rekognition

| Parameter | Value |
|---|---|
| Operations | DetectLabels, DetectText |
| Max labels | 40 |
| Min confidence | 55% (labels), 70% (text) |
| Max image size | 4 MB |
| Parallelism | Both calls via Promise.all |
| Bounding box scale | Normalized 0–1 → multiplied by 1000 |

### 4.4 API Gateway

| Parameter | Value |
|---|---|
| ID | x5rbnqm2v4 |
| Stage | /dev |
| Type | REST API |
| Integration | Lambda Proxy |
| CORS | Enabled on /ai resource |
| Methods | POST (Lambda), OPTIONS (CORS preflight) |

### 4.5 CloudFront

| Parameter | Value |
|---|---|
| Distribution ID | E2FKI267871EMW |
| Domain | d2d1ibzdtgm1nq.cloudfront.net |
| Origin | walkinmyshoes-frontend-2026.s3.amazonaws.com |
| Cache policy | Managed-CachingOptimized |
| index.html | no-cache, no-store, must-revalidate |
| JS/CSS assets | public, max-age=31536000, immutable |

### 4.6 Amazon S3

| Parameter | Value |
|---|---|
| Bucket | walkinmyshoes-frontend-2026 |
| Region | us-east-1 |
| Public access | Blocked (CloudFront only) |
| Static hosting | Via CloudFront OAC |

### 4.7 Amazon Cognito

| Parameter | Value |
|---|---|
| User Pool ID | us-east-1_VHC0a9xM3 |
| Client ID | 20iorjt3l68ebjgohdrd0agj8a |
| Domain | walkinmyshoes-auth.auth.us-east-1.amazoncognito.com |
| Region | us-east-1 |

---

## 5. Compliance Standards

### 5.1 Accessibility Standards Audited by the Platform

| Standard | Coverage |
|---|---|
| ADA 2010 | Full — all §400–§800 sections for physical spaces |
| WCAG 2.1 Level AA | Full — all success criteria for digital content |
| RPWD Act 2016 (India) | Full — building access, signage, pathways |
| NBC 2016 (India) | Referenced — National Building Code accessibility requirements |
| ASTM F1637 | Flooring slip resistance (≥0.6 wet) |

### 5.2 Platform's Own Compliance

| Standard | Status |
|---|---|
| WCAG 2.1 Level AA | ✅ Targeted |
| HTTPS | ✅ CloudFront enforced |
| Data privacy | ✅ No PII stored beyond Cognito auth |
| Indian IT Act | ✅ Compliant |

---

## 6. Data Flow Requirements

### 6.1 AR Scan Flow

```
User taps "Scan Now"
→ Camera frame captured as canvas.toDataURL('image/jpeg', 0.8)
→ Base64 extracted (strip data URI prefix)
→ Size check: >4MB → error, else continue
→ POST to API Gateway /ai
→ Lambda receives imageBase64
→ Promise.all([DetectLabels, DetectText])
→ Build scene description (labels + text + bounding boxes)
→ Bedrock Nova 2 Lite: ADA/WCAG/RPWD audit prompt
→ JSON parse response
→ Return {result: JSON string}
→ Frontend parses issues[]
→ Render AR overlays + issue list
```

### 6.2 Chat Flow

```
User types message
→ Push to local history array [{role: 'user', content: text}]
→ Validate: first message must be 'user', alternating roles
→ Slice last 20 messages
→ POST to API Gateway /ai with action: 'chat'
→ Lambda builds Nova message array with [{text: content}] format
→ Bedrock Nova 2 Lite: system prompt + messages
→ Return {result: reply text}
→ Push reply to history [{role: 'assistant', content: reply}]
→ Display in chat UI
```

---

## 7. Risk Management

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Bedrock payment verification delay | Medium | High | Use Nova Lite (Amazon's own model — faster verification) |
| Rekognition returns no labels | Low | Medium | Fallback: Bedrock generates audit from generic space description |
| Nova response not valid JSON | Low | Medium | Frontend strips markdown fences, catches parse errors, shows safe fallback |
| Lambda cold start > 5s | Low | Low | Keep Lambda warm via API Gateway, 256MB memory for fast init |
| CloudFront cache stale | Low | Low | Always invalidate `/*` after every deploy |
| Camera permission denied | Medium | Medium | Clear instructions shown, manual description input as fallback |

---

## 8. Roadmap

### Phase 1 — Completed ✅ (March 2026)
- 4 VR disability simulations
- AR Accessibility Auditor (Rekognition + Bedrock)
- AI Expert Guide (Bedrock Nova 2 Lite)
- Synthesize Fix remediation reports
- Impact Dashboard & certification
- Amazon Cognito authentication
- Full AWS deployment (7 services)

### Phase 2 — Q2 2026
- Mobile app (React Native)
- Multi-language support (Hindi, Tamil, Telugu, Marathi)
- Enterprise admin dashboard with org-wide analytics
- Persistent audit history in DynamoDB

### Phase 3 — Q3 2026
- Custom scenario builder
- API for third-party LMS integrations (Canvas, Moodle)
- White-label options for enterprises
- Cognitive disability simulations

### Phase 4 — Q4 2026
- VR headset support (Meta Quest, PSVR2)
- Haptic feedback integration
- Multiplayer group training sessions
- Amazon Bedrock fine-tuned model on RPWD Act cases

### Phase 5 — 2027
- National rollout with government partnership
- Integration with BIS (Bureau of Indian Standards) compliance database
- Certification recognized by Ministry of Social Justice and Empowerment

---

**Document Owner**: Kalim Sayyed
**Last Updated**: March 7, 2026
**Version**: 2.0 — Bedrock Edition
**Status**: Production Live
