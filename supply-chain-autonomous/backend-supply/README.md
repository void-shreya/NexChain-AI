# SupplyChain Guardian - Autonomous Backend & Decision Service

Production-grade Express.js REST API and Autonomous Agent system for supply chain disruption detection, predictive impact modeling, what-if simulation, and human-in-the-loop recovery dispatch.

## Architecture

- **Pattern**: MVC (Model-View-Controller) with explicit Service & Agent layers.
- **Security**: JWT Authentication, bcrypt password hashing, RBAC (ADMIN, SUPPLY_MANAGER, OPERATIONS_MANAGER, VIEWER).
- **Database**: PostgreSQL / Supabase with comprehensive schema, indices, and Row Level Security (RLS) policies. Includes an automated fallback persistent memory adapter for instant offline/demo evaluation.
- **AI Engine**: SupplyChain Guardian with pluggable AI Provider layer (Google Gemini, OpenAI, Anthropic, or deterministic Operations Research MCDA engine).
- **Real-Time**: Socket.io WebSocket server broadcasting GPS telemetry, live disruption events, and 15-step agent execution progress.

## Key Endpoints

- `POST /api/auth/login` - Authenticate user & issue JWT
- `GET /api/dashboard` - Central Control Tower KPIs, health charts, and disruption timeline
- `GET /api/suppliers` - Supplier intelligence and 5-factor risk score breakdown
- `GET /api/inventory` - Inventory monitoring with automatic SAFE, WATCH, AT_RISK, STOCKOUT classification
- `GET /api/orders` - SLA tracking, customer tiers, and prioritization reasoning
- `GET /api/shipments` - Live delivery tracking with GPS coordinates and routes
- `POST /api/simulation/run` - What-if disruption simulation with side-by-side delta metrics
- `POST /api/disruptions/demo/trigger` - **Hackathon Demo Trigger**: launches live disruption & 15-step recovery
- `POST /api/agent/command` - Natural language operations copilot & Voice AI prompt processor
- `POST /api/agent/approve` - Human-in-the-loop approval of AI recommended recovery orders
- `POST /api/agent/reject` - Human-in-the-loop rejection of recovery orders
- `GET /api/audit-logs` - Responsible AI immutable decision audit trail

## Demo Credentials

- **Admin**: `admin@nexchain.ai` / `Password123!`
- **Supply Manager**: `supply.manager@nexchain.ai` / `Password123!`
- **Operations Lead**: `ops.lead@nexchain.ai` / `Password123!`
- **Viewer**: `viewer@nexchain.ai` / `Password123!`
