# SupplyChain Guardian - Frontend Web Application

[![Frontend Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://nex-chain-ai-6rah.vercel.app/)
[![Backend Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://nexchain-ai.onrender.com)

High-performance, cyber-command control tower interface for autonomous supply chain disruption response.

- **Live Production URL**: [https://nex-chain-ai-6rah.vercel.app/](https://nex-chain-ai-6rah.vercel.app/)
- **Connected Backend**: [https://nexchain-ai.onrender.com/api](https://nexchain-ai.onrender.com/api)

## Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS Design System with custom HSL tokens, cyber-dark theme, and glassmorphism
- **Routing**: React Router v6
- **Maps**: Leaflet + OpenStreetMap tiles (standard OSM layer)
- **Charts**: Recharts (Responsive Line, Bar, and Pie analytics)
- **Voice AI**: Web Speech API (SpeechRecognition + SpeechSynthesis vocal feedback)
- **Real-Time**: Socket.io-client for live GPS tracking and 15-step agent execution
- **HTTP Client**: Axios with JWT authentication interceptors

## Features

1. **AI Supply Chain Control Tower**: Live KPI metrics, disruption radar, and multi-tier risk breakdown.
2. **Interactive GIS Map**: Real-time GPS markers for 20+ shipments, warehouses, and suppliers across India.
3. **What-If Simulation Engine**: Parameter sweeps across supplier outages, port blockades, and demand surges with side-by-side delta metrics.
4. **Autonomous Decision Engine**: Options A through F with quantitative cost, delay, and SLA penalty weighting.
5. **Human-In-The-Loop**: Multi-mode autonomy (Autonomous, Assisted, Manual Approval) with one-click authorization.
6. **Voice AI Operations Copilot**: Voice queries with audio waves and text-to-speech.
7. **DEMO DISRUPTION Trigger**: 1-click simulation trigger demonstrating the full 15-step autonomous recovery sequence.

## Running Locally

```bash
npm install
npm run dev
```

App runs on `http://localhost:5173`.
