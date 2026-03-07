# WalkInMyShoes - Technical Design Specification

## Document Information

**Project**: WalkInMyShoes - Immersive Disability Empathy & Accessibility Training Platform  
**Version**: 1.0  
**Date**: March 1, 2026  
**Status**: Production Architecture  
**Cloud Provider**: Amazon Web Services (AWS)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                             │
│  Desktop Browser | Mobile Browser | VR Headset | AR Camera      │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS CLOUDFRONT (CDN)                          │
│  • Global Edge Locations                                        │
│  • HTTPS Enforcement                                            │
│  • Asset Caching (TTL: 1 hour)                                  │
│  • Gzip Compression                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────┐          ┌──────────────────────┐
│   AWS S3 BUCKET  │          │   API GATEWAY        │
│  (Static Assets) │          │   (REST API)         │
│                  │          │                      │
│  • index.html    │          │  • /auth/*           │
│  • JS bundles    │          │  • /progress/*       │
│  • 3D models     │          │  • /analytics/*      │
│  • Textures      │          │  • /leaderboard/*    │
└──────────────────┘          └──────────┬───────────┘
                                         │

                                         ▼
                              ┌──────────────────────┐
                              │   AWS LAMBDA         │
                              │   (Serverless)       │
                              │                      │
                              │  • Node.js 18        │
                              │  • Auto-scaling      │
                              │  • 512MB memory      │
                              └──────────┬───────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 │                       │                       │
                 ▼                       ▼                       ▼
        ┌────────────────┐    ┌──────────────────┐   ┌──────────────────┐
        │  AWS COGNITO   │    │  AWS DYNAMODB    │   │  PARAMETER STORE │
        │  (Auth)        │    │  (Database)      │   │  (Secrets)       │
        │                │    │                  │   │                  │
        │  • User Pools  │    │  • users         │   │  • AI API Keys   │
        │  • Identity    │    │  • progress      │   │  • AWS Keys      │
        │    Pools       │    │  • leaderboard   │   │                  │
        └────────────────┘    │  • audits        │   └──────────────────┘
                              └──────────────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │  AI SERVICE APIs     │
                              │                      │
                              │  • Language Models   │
                              │  • Vision Models     │
                              │  • Generative AI     │
                              └──────────────────────┘
```

### 1.2 Architecture Principles

**Serverless-First**: Minimize operational overhead with managed services  
**Scalability**: Auto-scale from 1 to 10,000+ concurrent users  
**Security**: Defense in depth with multiple security layers  
**Performance**: Global CDN with edge caching  
**Cost-Efficiency**: Pay-per-use model optimized for startup budget  
**Resilience**: Multi-AZ deployment with automatic failover  

---

## 2. Frontend Architecture

### 2.1 Technology Stack


```typescript
// Core Framework
- React 18.2.0 (UI library)
- TypeScript 5.0+ (Type safety)
- Vite 4.0+ (Build tool)

// 3D & WebXR
- Three.js 0.150+ (3D rendering)
- @react-three/fiber (React renderer for Three.js)
- @react-three/drei (Helper components)

// UI & Styling
- Tailwind CSS 3.3+ (Utility-first CSS)
- Framer Motion (Animations)
- Lucide React (Icons)

// State Management
- React Context API (Global state)
- React Hooks (Local state)

// API & Data
- Axios (HTTP client)
- AWS Amplify (Cognito integration)
```

### 2.2 Component Architecture

```
src/
├── components/
│   ├── simulations/
│   │   ├── VisualImpairmentScene.tsx    # Vision loss simulation
│   │   ├── HearingLossScene.tsx         # Hearing impairment simulation
│   │   ├── MotorDisabilityScene.tsx     # Wheelchair navigation
│   │   └── ColorBlindnessScene.tsx      # Color vision deficiency
│   ├── ar/
│   │   └── ARAuditor.tsx                # AR scanning & analysis
│   ├── ai/
│   │   └── AIGuide.tsx                  # Conversational assistant
│   ├── dashboard/
│   │   └── ImpactDashboard.tsx          # Analytics & certification
│   ├── onboarding/
│   │   └── Onboarding.tsx               # Tutorial flow
│   └── layout/
│       └── Layout.tsx                   # App shell & navigation
├── services/
│   ├── api.ts                           # Backend API client
│   ├── auth.ts                          # Cognito authentication
│   └── ai.ts                            # AI service integration
├── hooks/
│   ├── useAuth.ts                       # Authentication hook
│   ├── useProgress.ts                   # Progress tracking hook
│   └── useAI.ts                         # AI interaction hook
├── types/
│   └── index.ts                         # TypeScript definitions
├── utils/
│   ├── empathyScoring.ts                # Empathy calculation
│   └── analytics.ts                     # Event tracking
└── constants/
    └── index.tsx                        # Configuration constants
```

### 2.3 State Management Design


```typescript
// Global Application State
interface AppState {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  
  // Current Session
  currentView: 'menu' | 'simulation' | 'ar' | 'dashboard';
  activeSimulation: SimulationType | null;
  
  // Progress Tracking
  completedScenarios: string[];
  empathyScore: number;
  sessionStartTime: number;
  
  // AI Conversation
  chatHistory: Message[];
  aiContext: string;
  
  // AR Auditor
  detectedIssues: AccessibilityIssue[];
  currentAudit: Audit | null;
}

// Component-Level State (React Hooks)
- useState: Local UI state (modals, forms, toggles)
- useEffect: Side effects (API calls, subscriptions)
- useContext: Access global state
- useReducer: Complex state logic (simulation progress)
- useMemo: Performance optimization (expensive calculations)
- useCallback: Memoized callbacks (event handlers)
```

### 2.4 Routing Strategy

```typescript
// React Router v6 Configuration
const routes = [
  { path: '/', element: <LandingPage /> },
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/simulations', element: <SimulationMenu /> },
  { path: '/simulation/:type', element: <SimulationView /> },
  { path: '/ar-auditor', element: <ARAuditor /> },
  { path: '/dashboard', element: <ImpactDashboard /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
];

// Protected Routes (require authentication)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};
```

### 2.5 Performance Optimization

**Code Splitting**:
```typescript
// Lazy load heavy components
const VisualImpairmentScene = lazy(() => import('./components/VisualImpairmentScene'));
const ARAuditor = lazy(() => import('./components/ARAuditor'));

// Suspense boundaries
<Suspense fallback={<LoadingSpinner />}>
  <VisualImpairmentScene />
</Suspense>
```

**Asset Optimization**:
- 3D models: GLB format with Draco compression (<500KB per model)
- Textures: WebP format with progressive loading
- Images: Lazy loading with Intersection Observer
- Fonts: Subset to used characters only

**Bundle Optimization**:
- Tree shaking: Remove unused code
- Minification: Terser for production builds
- Gzip compression: CloudFront automatic compression
- Target bundle size: <2MB initial load

---

## 3. Backend Architecture

### 3.1 AWS Lambda Functions


#### 3.1.1 Authentication Functions

**Function**: `auth-signup`
```yaml
Handler: functions/auth/signup.handler
Runtime: nodejs18.x
Memory: 256MB
Timeout: 10s
Environment:
  - COGNITO_USER_POOL_ID
  - COGNITO_APP_CLIENT_ID
Triggers:
  - API Gateway: POST /auth/signup
```

**Logic**:
1. Validate email format and password strength
2. Create user in Cognito User Pool
3. Send verification email
4. Create user record in DynamoDB
5. Return user ID and temporary token

**Function**: `auth-login`
```yaml
Handler: functions/auth/login.handler
Runtime: nodejs18.x
Memory: 256MB
Timeout: 10s
Triggers:
  - API Gateway: POST /auth/login
```

**Logic**:
1. Authenticate with Cognito
2. Retrieve user profile from DynamoDB
3. Update last login timestamp
4. Return JWT tokens (access + refresh)

#### 3.1.2 Progress Tracking Functions

**Function**: `progress-save`
```yaml
Handler: functions/progress/save.handler
Runtime: nodejs18.x
Memory: 512MB
Timeout: 15s
Environment:
  - DYNAMODB_PROGRESS_TABLE
Triggers:
  - API Gateway: POST /progress/save
```

**Logic**:
1. Validate user authentication (JWT)
2. Calculate empathy score from behavioral data
3. Store session data in DynamoDB
4. Update user's total empathy score
5. Trigger leaderboard update (async)

**Function**: `progress-get`
```yaml
Handler: functions/progress/get.handler
Runtime: nodejs18.x
Memory: 256MB
Timeout: 5s
Triggers:
  - API Gateway: GET /progress/{userId}
```

**Logic**:
1. Validate user authorization
2. Query DynamoDB for user's progress
3. Aggregate statistics (total time, scenarios completed)
4. Return formatted progress data

#### 3.1.3 Analytics Functions

**Function**: `analytics-aggregate`
```yaml
Handler: functions/analytics/aggregate.handler
Runtime: nodejs18.x
Memory: 512MB
Timeout: 30s
Triggers:
  - EventBridge: Daily at 00:00 UTC
```

**Logic**:
1. Query all progress records from past 24 hours
2. Calculate platform-wide metrics
3. Update aggregated statistics table
4. Generate daily report

#### 3.1.4 Leaderboard Functions

**Function**: `leaderboard-update`
```yaml
Handler: functions/leaderboard/update.handler
Runtime: nodejs18.x
Memory: 256MB
Timeout: 10s
Triggers:
  - DynamoDB Stream: progress table
```

**Logic**:
1. Receive progress update event
2. Recalculate user's total score
3. Update leaderboard table with new rank
4. Maintain top 100 leaderboard

### 3.2 API Gateway Design


```yaml
API Name: walkinmyshoes-api
Type: REST API
Stage: prod
Base URL: https://{api-id}.execute-api.us-east-1.amazonaws.com/prod

Endpoints:
  # Authentication
  POST /auth/signup
    - Request: { email, password, name }
    - Response: { userId, message }
    - Auth: None
    
  POST /auth/login
    - Request: { email, password }
    - Response: { accessToken, refreshToken, user }
    - Auth: None
    
  POST /auth/refresh
    - Request: { refreshToken }
    - Response: { accessToken }
    - Auth: None
  
  # Progress Tracking
  POST /progress/save
    - Request: { sessionData, empathyScore, scenarioType }
    - Response: { success, progressId }
    - Auth: JWT (Cognito)
    
  GET /progress/{userId}
    - Response: { sessions[], totalScore, completedScenarios[] }
    - Auth: JWT (Cognito)
  
  # Analytics
  GET /analytics/dashboard
    - Response: { platformStats, userStats }
    - Auth: JWT (Cognito)
  
  # Leaderboard
  GET /leaderboard/top
    - Query: ?limit=100
    - Response: { rankings[] }
    - Auth: None (anonymized data)

Security:
  - CORS: Enabled for CloudFront domain only
  - Rate Limiting: 1000 requests/minute per user
  - Request Validation: JSON schema validation
  - Authorization: Cognito JWT verification
```

### 3.3 Error Handling Strategy

```typescript
// Standardized Error Response Format
interface APIError {
  statusCode: number;
  errorCode: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Error Codes
const ErrorCodes = {
  // Authentication (1xxx)
  INVALID_CREDENTIALS: '1001',
  TOKEN_EXPIRED: '1002',
  UNAUTHORIZED: '1003',
  
  // Validation (2xxx)
  INVALID_INPUT: '2001',
  MISSING_REQUIRED_FIELD: '2002',
  
  // Business Logic (3xxx)
  SCENARIO_NOT_FOUND: '3001',
  PROGRESS_SAVE_FAILED: '3002',
  
  // External Services (4xxx)
  AI_API_ERROR: '4001',
  DYNAMODB_ERROR: '4002',
  
  // System (5xxx)
  INTERNAL_SERVER_ERROR: '5000',
};

// Retry Logic
const retryConfig = {
  maxRetries: 3,
  backoffMultiplier: 2,
  initialDelay: 1000, // ms
};
```

---

## 4. Database Design

### 4.1 DynamoDB Table Schemas

#### Table: `walkinmyshoes-users`

```typescript
{
  TableName: 'walkinmyshoes-users',
  KeySchema: [
    { AttributeName: 'userId', KeyType: 'HASH' } // Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: 'userId', AttributeType: 'S' },
    { AttributeName: 'email', AttributeType: 'S' }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'email-index',
      KeySchema: [
        { AttributeName: 'email', KeyType: 'HASH' }
      ],
      Projection: { ProjectionType: 'ALL' }
    }
  ],
  BillingMode: 'PAY_PER_REQUEST',
  StreamSpecification: {
    StreamEnabled: false
  }
}

// Item Structure
{
  userId: 'uuid-v4',
  email: 'user@example.com',
  name: 'John Doe',
  createdAt: '2026-03-01T00:00:00Z',
  lastLogin: '2026-03-01T12:00:00Z',
  organizationId: 'org-123' | null,
  role: 'user' | 'admin' | 'enterprise',
  preferences: {
    language: 'en',
    notifications: true
  }
}
```

#### Table: `walkinmyshoes-progress`


```typescript
{
  TableName: 'walkinmyshoes-progress',
  KeySchema: [
    { AttributeName: 'userId', KeyType: 'HASH' },      // Partition key
    { AttributeName: 'sessionId', KeyType: 'RANGE' }   // Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: 'userId', AttributeType: 'S' },
    { AttributeName: 'sessionId', AttributeType: 'S' },
    { AttributeName: 'completedAt', AttributeType: 'N' }
  ],
  LocalSecondaryIndexes: [
    {
      IndexName: 'completedAt-index',
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' },
        { AttributeName: 'completedAt', KeyType: 'RANGE' }
      ],
      Projection: { ProjectionType: 'ALL' }
    }
  ],
  BillingMode: 'PAY_PER_REQUEST',
  StreamSpecification: {
    StreamEnabled: true,
    StreamViewType: 'NEW_AND_OLD_IMAGES'
  }
}

// Item Structure
{
  userId: 'uuid-v4',
  sessionId: 'session-uuid-v4',
  scenarioType: 'visual' | 'hearing' | 'motor' | 'colorblind',
  completedAt: 1709251200000, // Unix timestamp
  duration: 420, // seconds
  empathyScore: 75,
  tasksCompleted: 5,
  errorsCount: 2,
  chatHistory: [
    {
      role: 'user' | 'assistant',
      content: 'string',
      timestamp: 1709251200000
    }
  ],
  assessmentScores: {
    preScore: 45,
    postScore: 82
  },
  behaviorData: {
    helpRequests: 3,
    retryAttempts: 2,
    frustrationEvents: 1
  }
}
```

#### Table: `walkinmyshoes-leaderboard`

```typescript
{
  TableName: 'walkinmyshoes-leaderboard',
  KeySchema: [
    { AttributeName: 'leaderboardId', KeyType: 'HASH' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'leaderboardId', AttributeType: 'S' },
    { AttributeName: 'totalEmpathyScore', AttributeType: 'N' }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'score-index',
      KeySchema: [
        { AttributeName: 'totalEmpathyScore', KeyType: 'HASH' }
      ],
      Projection: { ProjectionType: 'ALL' }
    }
  ],
  BillingMode: 'PAY_PER_REQUEST'
}

// Item Structure
{
  leaderboardId: 'global',
  userId: 'uuid-v4',
  userName: 'Anonymous User 123', // Anonymized
  totalEmpathyScore: 285,
  scenariosCompleted: 4,
  totalTimeSpent: 1680, // seconds
  rank: 42,
  updatedAt: '2026-03-01T12:00:00Z'
}
```

### 4.2 Data Access Patterns

**Pattern 1: User Login**
```typescript
// Query: Get user by email
const params = {
  TableName: 'walkinmyshoes-users',
  IndexName: 'email-index',
  KeyConditionExpression: 'email = :email',
  ExpressionAttributeValues: { ':email': userEmail }
};
```

**Pattern 2: Save Progress**
```typescript
// Put: Create new session record
const params = {
  TableName: 'walkinmyshoes-progress',
  Item: {
    userId: 'uuid',
    sessionId: 'session-uuid',
    // ... other fields
  }
};
```

**Pattern 3: Get User Progress**
```typescript
// Query: Get all sessions for user, sorted by date
const params = {
  TableName: 'walkinmyshoes-progress',
  IndexName: 'completedAt-index',
  KeyConditionExpression: 'userId = :userId',
  ExpressionAttributeValues: { ':userId': userId },
  ScanIndexForward: false, // Descending order
  Limit: 50
};
```

**Pattern 4: Update Leaderboard**
```typescript
// Update: Atomic increment of score
const params = {
  TableName: 'walkinmyshoes-leaderboard',
  Key: { leaderboardId: 'global', userId: 'uuid' },
  UpdateExpression: 'SET totalEmpathyScore = totalEmpathyScore + :score',
  ExpressionAttributeValues: { ':score': newScore }
};
```

---

## 5. AI Integration Architecture

### 5.1 AI Service Design


```typescript
// services/ai.ts

class AIService {
  private apiKey: string;
  private baseURL: string;
  
  // Model Selection
  private models = {
    guide: 'language-model-fast',      // Fast responses for chat
    analysis: 'vision-model-advanced',  // Deep analysis for AR
    image: 'generative-model-image'     // Visual fix generation
  };
  
  // AI Guide (Conversational Assistant)
  async chatWithGuide(
    messages: Message[],
    context: SimulationContext
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context);
    
    const response = await this.callAI({
      model: this.models.guide,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      maxTokens: 500
    });
    
    return response.content;
  }
  
  // AR Accessibility Analysis
  async analyzeAccessibility(
    imageData: string,
    detectedObjects: DetectedObject[]
  ): Promise<AccessibilityReport> {
    const prompt = this.buildAnalysisPrompt(detectedObjects);
    
    const response = await this.callAI({
      model: this.models.analysis,
      prompt,
      image: imageData,
      temperature: 0.3, // More deterministic for compliance
      maxTokens: 2000
    });
    
    return this.parseAccessibilityReport(response);
  }
  
  // Visual Fix Generation
  async generateVisualFix(
    originalImage: string,
    issue: AccessibilityIssue
  ): Promise<string> {
    const prompt = this.buildFixPrompt(issue);
    
    const response = await this.callAI({
      model: this.models.image,
      prompt,
      image: originalImage,
      temperature: 0.5
    });
    
    return response.imageUrl; // Base64 or URL
  }
  
  // Prompt Engineering
  private buildSystemPrompt(context: SimulationContext): string {
    return `You are an expert accessibility consultant and empathy guide.
    
Context:
- User is experiencing: ${context.simulationType}
- Current task: ${context.currentTask}
- Progress: ${context.tasksCompleted}/${context.totalTasks}

Your role:
1. Answer questions about accessibility standards (ADA, WCAG)
2. Explain the disability experience empathetically
3. Provide actionable recommendations
4. Keep responses concise (2-3 sentences)
5. Use encouraging, educational tone

Guidelines:
- Reference specific WCAG criteria when relevant
- Share real-world statistics when helpful
- Avoid medical jargon
- Focus on solutions, not just problems`;
  }
  
  private buildAnalysisPrompt(objects: DetectedObject[]): string {
    return `Analyze this environment for accessibility compliance.

Detected objects: ${JSON.stringify(objects)}

Evaluate:
1. Door widths (ADA: 32" minimum clear width)
2. Ramp slopes (ADA: 1:12 ratio max, 4.76°)
3. Button heights (ADA: 15"-48" range)
4. Color contrast (WCAG: 4.5:1 for text)
5. Tactile paving presence

For each issue found, provide:
- Specific violation
- Current measurement vs. standard
- Severity (critical/important/minor)
- Remediation steps
- Cost estimate (low/medium/high)

Return JSON format.`;
  }
  
  private buildFixPrompt(issue: AccessibilityIssue): string {
    return `You are an architectural renderer. Generate a photorealistic visualization
of this accessibility fix:

Issue: ${issue.description}
Current state: ${issue.currentMeasurement}
Required: ${issue.requiredStandard}

Instructions:
1. Maintain original lighting, perspective, and textures
2. Physically render the compliant solution (e.g., wider door, proper ramp)
3. Ensure the fix looks professionally integrated
4. Use realistic materials (concrete, metal, wood)
5. Show clear dimensional improvements

Generate a high-quality architectural visualization.`;
  }
  
  // Rate Limiting & Retry Logic
  private async callAI(params: any): Promise<any> {
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const response = await fetch(`${this.baseURL}/models/${params.model}:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          },
          body: JSON.stringify(params)
        });
        
        if (response.status === 429) {
          // Rate limited - exponential backoff
          await this.sleep(Math.pow(2, attempt) * 1000);
          attempt++;
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`AI API error: ${response.statusText}`);
        }
        
        return await response.json();
        
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;
        attempt++;
        await this.sleep(1000 * attempt);
      }
    }
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 5.2 AI Context Management


```typescript
// Context passed to AI for each simulation
interface SimulationContext {
  simulationType: 'visual' | 'hearing' | 'motor' | 'colorblind';
  currentTask: string;
  tasksCompleted: number;
  totalTasks: number;
  impairmentLevel: number; // 1-5
  userProgress: {
    errorsCount: number;
    helpRequests: number;
    timeElapsed: number;
  };
}

// Conversation History Management
class ConversationManager {
  private maxHistoryLength = 20; // Keep last 20 messages
  
  addMessage(message: Message): void {
    this.history.push(message);
    if (this.history.length > this.maxHistoryLength) {
      // Keep system prompt + recent messages
      this.history = [
        this.history[0], // System prompt
        ...this.history.slice(-this.maxHistoryLength)
      ];
    }
  }
  
  getContext(): Message[] {
    return this.history;
  }
}
```

---

## 6. Security Architecture

### 6.1 Authentication Flow

```
┌─────────┐                                    ┌──────────────┐
│ Browser │                                    │ AWS Cognito  │
└────┬────┘                                    └──────┬───────┘
     │                                                │
     │ 1. POST /auth/signup                          │
     │   { email, password }                         │
     ├──────────────────────────────────────────────>│
     │                                                │
     │ 2. Create user + send verification email      │
     │<───────────────────────────────────────────────┤
     │                                                │
     │ 3. User clicks verification link              │
     ├──────────────────────────────────────────────>│
     │                                                │
     │ 4. POST /auth/login                           │
     │   { email, password }                         │
     ├──────────────────────────────────────────────>│
     │                                                │
     │ 5. Return JWT tokens                          │
     │   { accessToken, refreshToken, idToken }      │
     │<───────────────────────────────────────────────┤
     │                                                │
     │ 6. Store tokens in memory (not localStorage)  │
     │                                                │
     │ 7. API requests with Authorization header     │
     │   Authorization: Bearer <accessToken>         │
     │                                                │
     │ 8. Token expires after 1 hour                 │
     │                                                │
     │ 9. POST /auth/refresh                         │
     │   { refreshToken }                            │
     ├──────────────────────────────────────────────>│
     │                                                │
     │ 10. Return new accessToken                    │
     │<───────────────────────────────────────────────┤
```

### 6.2 API Security Layers

**Layer 1: CloudFront**
- HTTPS enforcement (redirect HTTP → HTTPS)
- Geographic restrictions (optional)
- DDoS protection (AWS Shield Standard)

**Layer 2: API Gateway**
- CORS configuration (whitelist CloudFront domain)
- Rate limiting (1000 req/min per user)
- Request validation (JSON schema)
- API keys for service-to-service calls

**Layer 3: Lambda Authorizer**
```typescript
// Custom authorizer for JWT validation
export const authorize = async (event: APIGatewayAuthorizerEvent) => {
  const token = event.authorizationToken;
  
  try {
    // Verify JWT with Cognito public keys
    const decoded = await verifyToken(token);
    
    // Generate IAM policy
    return {
      principalId: decoded.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event.methodArn
        }]
      },
      context: {
        userId: decoded.sub,
        email: decoded.email
      }
    };
  } catch (error) {
    throw new Error('Unauthorized');
  }
};
```

**Layer 4: Lambda Function**
- Input validation
- Business logic authorization
- Data access control (user can only access own data)

### 6.3 Secrets Management

```typescript
// AWS Systems Manager Parameter Store
const getSecret = async (secretName: string): Promise<string> => {
  const ssm = new AWS.SSM();
  
  const params = {
    Name: secretName,
    WithDecryption: true
  };
  
  const result = await ssm.getParameter(params).promise();
  return result.Parameter.Value;
};

// Usage in Lambda
const aiApiKey = await getSecret('/walkinmyshoes/ai-api-key');
```

**Stored Secrets**:
- `/walkinmyshoes/ai-api-key`: AI service API key
- `/walkinmyshoes/jwt-secret`: JWT signing secret (if custom auth)
- `/walkinmyshoes/db-encryption-key`: DynamoDB encryption key

### 6.4 Data Encryption

**At Rest**:
- DynamoDB: Server-side encryption with AWS managed keys
- S3: AES-256 encryption for uploaded assets
- Parameter Store: Encrypted with KMS

**In Transit**:
- TLS 1.2+ for all connections
- Certificate pinning for mobile apps (future)

---

## 7. Deployment Architecture

### 7.1 Infrastructure as Code

**CloudFormation Stack: DynamoDB**
```yaml
# infrastructure/dynamodb.yml
AWSTemplateFormatVersion: '2010-09-09'
Description: DynamoDB tables for WalkInMyShoes

Resources:
  UsersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: walkinmyshoes-users
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: userId
          AttributeType: S
        - AttributeName: email
          AttributeType: S
      KeySchema:
        - AttributeName: userId
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: email-index
          KeySchema:
            - AttributeName: email
              KeyType: HASH
          Projection:
            ProjectionType: ALL
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      Tags:
        - Key: Project
          Value: WalkInMyShoes
        - Key: Environment
          Value: Production

  ProgressTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: walkinmyshoes-progress
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: userId
          AttributeType: S
        - AttributeName: sessionId
          AttributeType: S
        - AttributeName: completedAt
          AttributeType: N
      KeySchema:
        - AttributeName: userId
          KeyType: HASH
        - AttributeName: sessionId
          KeyType: RANGE
      LocalSecondaryIndexes:
        - IndexName: completedAt-index
          KeySchema:
            - AttributeName: userId
              KeyType: HASH
            - AttributeName: completedAt
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
      StreamSpecification:
        StreamViewType: NEW_AND_OLD_IMAGES
      Tags:
        - Key: Project
          Value: WalkInMyShoes

  LeaderboardTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: walkinmyshoes-leaderboard
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: leaderboardId
          AttributeType: S
      KeySchema:
        - AttributeName: leaderboardId
          KeyType: HASH
      Tags:
        - Key: Project
          Value: WalkInMyShoes

Outputs:
  UsersTableName:
    Value: !Ref UsersTable
    Export:
      Name: WalkInMyShoes-UsersTable
  
  ProgressTableName:
    Value: !Ref ProgressTable
    Export:
      Name: WalkInMyShoes-ProgressTable
  
  LeaderboardTableName:
    Value: !Ref LeaderboardTable
    Export:
      Name: WalkInMyShoes-LeaderboardTable
```

**Serverless Framework: Lambda Functions**
```yaml
# backend/serverless.yml
service: walkinmyshoes-backend

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: ${opt:stage, 'prod'}
  memorySize: 512
  timeout: 30
  environment:
    DYNAMODB_USERS_TABLE: ${cf:walkinmyshoes-dynamodb.UsersTableName}
    DYNAMODB_PROGRESS_TABLE: ${cf:walkinmyshoes-dynamodb.ProgressTableName}
    DYNAMODB_LEADERBOARD_TABLE: ${cf:walkinmyshoes-dynamodb.LeaderboardTableName}
    COGNITO_USER_POOL_ID: ${cf:walkinmyshoes-cognito.UserPoolId}
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:Query
        - dynamodb:Scan
        - dynamodb:GetItem
        - dynamodb:PutItem
        - dynamodb:UpdateItem
        - dynamodb:DeleteItem
      Resource:
        - arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.DYNAMODB_USERS_TABLE}
        - arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.DYNAMODB_PROGRESS_TABLE}
        - arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.DYNAMODB_LEADERBOARD_TABLE}
    - Effect: Allow
      Action:
        - ssm:GetParameter
      Resource:
        - arn:aws:ssm:${self:provider.region}:*:parameter/walkinmyshoes/*

functions:
  auth-signup:
    handler: functions/auth/signup.handler
    events:
      - http:
          path: auth/signup
          method: post
          cors: true
  
  auth-login:
    handler: functions/auth/login.handler
    events:
      - http:
          path: auth/login
          method: post
          cors: true
  
  progress-save:
    handler: functions/progress/save.handler
    events:
      - http:
          path: progress/save
          method: post
          cors: true
          authorizer:
            type: COGNITO_USER_POOLS
            authorizerId: ${cf:walkinmyshoes-cognito.UserPoolAuthorizerId}
  
  progress-get:
    handler: functions/progress/get.handler
    events:
      - http:
          path: progress/{userId}
          method: get
          cors: true
          authorizer:
            type: COGNITO_USER_POOLS
            authorizerId: ${cf:walkinmyshoes-cognito.UserPoolAuthorizerId}
  
  leaderboard-update:
    handler: functions/leaderboard/update.handler
    events:
      - stream:
          type: dynamodb
          arn:
            Fn::GetAtt: [ProgressTable, StreamArn]
          batchSize: 10
          startingPosition: LATEST

plugins:
  - serverless-offline
  - serverless-plugin-typescript
```

### 7.2 Deployment Pipeline


```bash
# Deployment Steps

# 1. Deploy Infrastructure
aws cloudformation deploy \
  --template-file infrastructure/dynamodb.yml \
  --stack-name walkinmyshoes-dynamodb \
  --capabilities CAPABILITY_NAMED_IAM

aws cloudformation deploy \
  --template-file infrastructure/cognito.yml \
  --stack-name walkinmyshoes-cognito \
  --capabilities CAPABILITY_NAMED_IAM

aws cloudformation deploy \
  --template-file infrastructure/s3-cloudfront.yml \
  --stack-name walkinmyshoes-s3-cloudfront \
  --capabilities CAPABILITY_NAMED_IAM

# 2. Store Secrets
aws ssm put-parameter \
  --name "/walkinmyshoes/ai-api-key" \
  --value "YOUR_API_KEY" \
  --type SecureString

# 3. Deploy Backend
cd backend
npm install
npx serverless deploy --stage prod

# 4. Build & Deploy Frontend
cd ../frontend
npm install
npm run build
./scripts/deploy-frontend.sh
```

---

## 8. Monitoring & Observability

### 8.1 CloudWatch Metrics

**Lambda Metrics**:
- Invocations
- Duration (P50, P95, P99)
- Errors
- Throttles
- Concurrent executions

**API Gateway Metrics**:
- Request count
- Latency (integration, overall)
- 4XX errors
- 5XX errors

**DynamoDB Metrics**:
- Read/write capacity units consumed
- Throttled requests
- System errors

**Custom Application Metrics**:
```typescript
// Log custom metrics
const logMetric = (metricName: string, value: number, unit: string) => {
  console.log(JSON.stringify({
    metricName,
    value,
    unit,
    timestamp: Date.now()
  }));
};

// Usage
logMetric('EmpathyScoreCalculated', empathyScore, 'Count');
logMetric('SimulationDuration', duration, 'Seconds');
```

### 8.2 Logging Strategy

**Structured Logging**:
```typescript
const logger = {
  info: (message: string, context: any) => {
    console.log(JSON.stringify({
      level: 'INFO',
      message,
      context,
      timestamp: new Date().toISOString()
    }));
  },
  error: (message: string, error: Error, context: any) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      timestamp: new Date().toISOString()
    }));
  }
};
```

### 8.3 Alerting

**CloudWatch Alarms**:
- Lambda error rate >5% (5 min period)
- API Gateway 5XX errors >10 (1 min period)
- DynamoDB throttled requests >0
- CloudFront 5XX error rate >1%

**SNS Topics**:
- Critical alerts → Email + SMS
- Warning alerts → Email only

---

## 9. Performance Optimization

### 9.1 Frontend Optimization

**Code Splitting**:
```typescript
// Route-based splitting
const routes = [
  {
    path: '/simulation/:type',
    component: lazy(() => import('./components/SimulationView'))
  }
];

// Component-based splitting
const HeavyComponent = lazy(() => import('./components/HeavyComponent'));
```

**Asset Optimization**:
- Images: WebP format, lazy loading
- 3D Models: GLB with Draco compression
- Fonts: WOFF2 format, subset to used characters
- CSS: Purge unused Tailwind classes

**Caching Strategy**:
```typescript
// Service Worker (future)
const CACHE_NAME = 'walkinmyshoes-v1';
const urlsToCache = [
  '/',
  '/static/js/main.js',
  '/static/css/main.css'
];
```

### 9.2 Backend Optimization

**Lambda Cold Start Mitigation**:
- Keep functions warm with scheduled pings
- Minimize dependencies
- Use Lambda layers for shared code

**DynamoDB Optimization**:
- Use batch operations where possible
- Implement caching layer (ElastiCache - future)
- Optimize query patterns with proper indexes

**API Gateway Caching**:
```yaml
# Enable caching for GET endpoints
- http:
    path: leaderboard/top
    method: get
    caching:
      enabled: true
      ttlInSeconds: 300
```

---

## 10. Cost Optimization

### 10.1 Estimated Monthly Costs (10K MAU)

| Service | Usage | Cost |
|---------|-------|------|
| S3 | 10GB storage, 100K requests | $3 |
| CloudFront | 100GB transfer, 1M requests | $15 |
| Lambda | 1M invocations, 512MB, 3s avg | $5 |
| API Gateway | 1M requests | $3.50 |
| DynamoDB | 10M reads, 1M writes | $8 |
| Cognito | 10K MAU | Free |
| **Total** | | **~$35/month** |

### 10.2 Cost Optimization Strategies

- Use CloudFront caching aggressively (reduce origin requests)
- Implement DynamoDB on-demand pricing (pay per request)
- Optimize Lambda memory allocation (right-sizing)
- Use S3 Intelligent-Tiering for infrequently accessed assets
- Set up AWS Budgets with alerts at $50, $75, $100

---

## 11. Disaster Recovery

### 11.1 Backup Strategy

**DynamoDB**:
- Point-in-time recovery enabled
- Daily automated backups (retained 35 days)
- Cross-region replication (future)

**S3**:
- Versioning enabled
- Cross-region replication (future)
- Lifecycle policies for old versions

### 11.2 Recovery Procedures

**RTO (Recovery Time Objective)**: 4 hours  
**RPO (Recovery Point Objective)**: 1 hour

**Disaster Scenarios**:
1. **Lambda function failure**: Auto-retry + rollback deployment
2. **DynamoDB table corruption**: Restore from point-in-time backup
3. **S3 bucket deletion**: Restore from versioning
4. **Region outage**: Failover to secondary region (future)

---

## 12. Compliance & Governance

### 12.1 Data Retention

- User accounts: Retained until deletion request
- Progress data: Retained 2 years
- Audit logs: Retained 90 days
- Backups: Retained 35 days

### 12.2 GDPR Compliance

- Right to access: API endpoint for data export
- Right to deletion: Cascade delete across all tables
- Data portability: JSON export format
- Consent management: Stored in user preferences

---

## 13. Testing Strategy

### 13.1 Unit Testing

```typescript
// Example: Empathy score calculation test
describe('calculateEmpathyScore', () => {
  it('should calculate score based on behavioral data', () => {
    const behaviorData = {
      timeSpent: 600,
      retries: 3,
      helpClicks: 2,
      frustrations: 1
    };
    
    const score = calculateEmpathyScore(behaviorData);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
```

### 13.2 Integration Testing

```typescript
// Example: API integration test
describe('POST /progress/save', () => {
  it('should save progress and return success', async () => {
    const response = await request(app)
      .post('/progress/save')
      .set('Authorization', `Bearer ${validToken}`)
      .send(mockProgressData);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### 13.3 Load Testing

```bash
# Artillery load test
artillery run load-test.yml

# load-test.yml
config:
  target: 'https://api.walkinmyshoes.app'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load"
scenarios:
  - flow:
      - post:
          url: "/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
```

---

## 14. Future Architecture Enhancements

### Phase 2 (Q2 2026)
- **Redis Cache**: ElastiCache for session management
- **SQS Queues**: Async processing for heavy operations
- **Step Functions**: Orchestrate complex workflows

### Phase 3 (Q3 2026)
- **Multi-Region**: Active-active deployment
- **GraphQL API**: Replace REST with AppSync
- **Real-time Features**: WebSocket support via API Gateway

### Phase 4 (Q4 2026)
- **ML Pipeline**: SageMaker for empathy prediction
- **Data Lake**: S3 + Athena for analytics
- **CDN Optimization**: Lambda@Edge for personalization

---

## 15. Architecture Decision Records (ADRs)

### ADR-001: Serverless Architecture
**Decision**: Use AWS Lambda instead of EC2/ECS  
**Rationale**: Lower operational overhead, auto-scaling, pay-per-use  
**Consequences**: Cold start latency, vendor lock-in

### ADR-002: DynamoDB over RDS
**Decision**: Use DynamoDB instead of PostgreSQL  
**Rationale**: Better scalability, lower cost, serverless integration  
**Consequences**: Limited query flexibility, eventual consistency

### ADR-003: Advanced AI Models
**Decision**: Use state-of-the-art language and vision models for AI features  
**Rationale**: Best-in-class multimodal capabilities, competitive pricing, AWS compatibility  
**Consequences**: Vendor flexibility, potential API changes

### ADR-004: React Three Fiber over A-Frame
**Decision**: Use React Three Fiber instead of A-Frame  
**Rationale**: Better React integration, more control, active community  
**Consequences**: Steeper learning curve, more boilerplate

---

## 16. Appendices

### Appendix A: Environment Variables

```bash
# Frontend (.env)
VITE_API_BASE_URL=https://api.walkinmyshoes.app/prod
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_AWS_REGION=us-east-1
VITE_CLOUDFRONT_URL=https://d1234567890.cloudfront.net
VITE_AI_API_KEY=<stored-in-parameter-store>

# Backend (serverless.yml environment)
DYNAMODB_USERS_TABLE=walkinmyshoes-users
DYNAMODB_PROGRESS_TABLE=walkinmyshoes-progress
DYNAMODB_LEADERBOARD_TABLE=walkinmyshoes-leaderboard
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
AWS_REGION=us-east-1
```

### Appendix B: API Endpoints Reference

```
Base URL: https://{api-id}.execute-api.us-east-1.amazonaws.com/prod

Authentication:
  POST   /auth/signup
  POST   /auth/login
  POST   /auth/refresh
  POST   /auth/logout

Progress:
  POST   /progress/save
  GET    /progress/{userId}
  GET    /progress/{userId}/summary

Analytics:
  GET    /analytics/dashboard
  GET    /analytics/platform-stats

Leaderboard:
  GET    /leaderboard/top?limit=100
  GET    /leaderboard/user/{userId}
```

### Appendix C: Database Indexes

```
walkinmyshoes-users:
  - Primary: userId (HASH)
  - GSI: email-index (email HASH)

walkinmyshoes-progress:
  - Primary: userId (HASH), sessionId (RANGE)
  - LSI: completedAt-index (userId HASH, completedAt RANGE)

walkinmyshoes-leaderboard:
  - Primary: leaderboardId (HASH)
  - GSI: score-index (totalEmpathyScore HASH)
```

---

**Document Version**: 1.0  
**Last Updated**: March 1, 2026  
**Next Review**: April 1, 2026  
**Approved By**: Technical Architecture Team  
**Status**: Production Ready
