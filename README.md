# NexChain AI - Supply Chain Disruption Autonomous Response Platform
### Codename: SupplyChain Guardian v2.4

An enterprise-grade, full-stack autonomous AI control tower application designed to detect supply chain disruptions, understand multi-tier consequences, predict delivery bottlenecks, simulate What-If scenarios, evaluate multi-criteria recovery options, make structured decisions, coordinate human-in-the-loop actions, monitor real-time recovery telemetry, and continuously learn.

---

## ⚡ Autonomous 8-Phase Core Loop

$$\text{DETECT} \longrightarrow \text{UNDERSTAND} \longrightarrow \text{PREDICT} \longrightarrow \text{SIMULATE} \longrightarrow \text{DECIDE} \longrightarrow \text{ACT} \longrightarrow \text{MONITOR} \longrightarrow \text{LEARN}$$

---

## 🏗️ Project Architecture

```
NexChain AI / supply-chain-autonomous/
│
├── backend-supply/                 # Node.js + Express + Socket.io + Supabase/PostgreSQL
│   ├── src/
│   │   ├── config/                 # JWT, constants, DB configuration
│   │   ├── controllers/            # REST API controllers (Auth, Dashboard, Suppliers, etc.)
│   │   ├── database/               # PostgreSQL schema.sql, seed.sql, seedData.js, dbClient.js
│   │   ├── middleware/             # JWT auth, RBAC authorization, error handling
│   │   ├── agents/                 # SupplyChain Guardian, AI Provider, Decision Engine
│   │   ├── realtime/               # Socket.io live GPS & telemetry ticker
│   │   ├── routes/                 # Express REST routes
│   │   ├── app.js                  # Express app configuration
│   │   └── server.js               # HTTP & WebSocket server entry point
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
└── frontend-supply/                # React 19 + Vite + Leaflet + Recharts + Web Speech AI
    ├── public/
    ├── src/
    │   ├── components/             # Sidebar, Navbar, VoiceAssistantModal
    │   ├── context/                # AuthContext, ThemeContext, DisruptionContext
    │   ├── maps/                   # Leaflet interactive GIS SupplyMap
    │   ├── pages/                  # Dashboard, ControlTower, Simulation, Decisions, etc.
    │   ├── layouts/                # MainLayout
    │   ├── routes/                 # AppRoutes & ProtectedRoute
    │   ├── services/               # Axios API client & Socket.io client
    │   ├── styles/                 # Cyber-Command Design System CSS & themes
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    ├── package.json
    └── README.md
```

---

## 🚀 Quick Start Instructions

### 1. Start the Backend API & WebSocket Server
```bash
cd "supply-chain-autonomous/backend-supply"
npm install
npm run dev
```
- **REST API**: `http://localhost:5000/api`
- **WebSocket Stream**: `ws://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

### 2. Start the Frontend Web Application
```bash
cd "supply-chain-autonomous/frontend-supply"
npm install
npm run dev
```
- **Web App**: `http://localhost:5173`

---

## 🎯 Demo & Hackathon Presentation Guide

### 1. One-Click Role Switcher
In the navigation bar top right or on the login page:
- **Supply Manager**: `supply.manager@nexchain.ai` / `Password123!`
- **System Admin**: `admin@nexchain.ai` / `Password123!`
- **Operations Lead**: `ops.lead@nexchain.ai` / `Password123!`
- **Executive Viewer**: `viewer@nexchain.ai` / `Password123!`

### 2. The Showcase "DEMO DISRUPTION" Workflow
Click the glowing **"DEMO DISRUPTION"** button in the header navbar:
1. **Disruption Ingested**: Flash flood & 220kV substation outage at **Tata AutoComp Systems (Pune Chakan)**.
2. **Impact Cascaded**: 18 Customer orders flagged with critical SLA breach risk (Maruti Suzuki, Mahindra, Ather Energy). Bhiwandi Mega DC buffer drops under 2 days.
3. **15-Step Agentic Sequence**: SupplyChain Guardian analyzes orders, searches alternative suppliers (Bharat Silicon BLR & Foxconn Sriperumbudur), and runs What-If simulations for Options A through F.
4. **Recommendation Formulated**: AI selects **Option B** (Procure 28k units from Bharat Silicon BLR + Blue Dart Aviation Air Cargo Flight BDA-91). Net savings: ₹1.04 Cr avoided in downtime penalties.
5. **Human-In-The-Loop**: Because cost (₹18,45,000) exceeds the ₹5,00,000 auto-execution threshold, the agent queues an approval ticket in `/decisions`.
6. **One-Click Authorization**: Click **"Authorize & Dispatch Recovery Action"** to immediately update shipping telemetry, dispatch flight BDA-91, and seal the audit log!

### 3. Voice AI Operations Copilot
Click the **"Voice AI"** button in the navbar:
- Speak or click sample prompts:
  - *"Which orders are currently at risk?"*
  - *"Why is Tata AutoComp considered risky?"*
  - *"What happens if Supplier B is unavailable?"*
  - *"Which shipments are delayed?"*
- Observe live voice wave visualizer, structured AI response, and automated SpeechSynthesis vocal read-out!

### 4. What-If Simulation Engine (`/simulation`)
- Adjust sliders for disruption duration (1 to 14 days), target supplier, or demand spikes (+0% to +100%).
- View side-by-side **Current Scenario (Inaction)** vs **Recovery Scenario (Option B)** with delta metrics, net financial savings, and delay reduction percentages.

---

## 🛡️ Responsible AI & Security

- **Multi-Provider AI Abstraction**: Pluggable Google Gemini API, OpenAI, or local Operations Research MCDA engine with zero external credential requirements.
- **Zero Frontend Secrets**: API keys, JWT secrets, and Supabase service-role keys stay strictly on the backend.
- **Auditable & Explainable**: Every autonomous recommendation and human approval is cryptographically logged in the immutable Audit Trail (`/audit-log`).
- **Supabase RLS**: PostgreSQL Row-Level Security policies documented and enforced on all sensitive tables.
