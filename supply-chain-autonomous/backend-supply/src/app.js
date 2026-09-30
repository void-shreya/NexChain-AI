const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { errorHandler } = require('./middleware/errorMiddleware');
const { db } = require('./database/dbClient');

// Route imports
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const disruptionRoutes = require('./routes/disruptionRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const agentRoutes = require('./routes/agentRoutes');
const decisionRoutes = require('./routes/decisionRoutes');
const auditRoutes = require('./routes/auditRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const createApp = () => {
  const app = express();

  // Global Middlewares
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: '*', credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  // Root status & landing page (for direct browser access to http://localhost:5000)
  app.get('/', (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'https://nex-chain-ai-6rah.vercel.app';
    if (req.accepts('html')) {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>SupplyChain Guardian Backend API</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #070b14; color: #f8fafc; padding: 2rem; display: flex; align-items: center; justify-content: center; min-height: 80vh; margin: 0; }
            .card { background: #0f172a; border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 12px; padding: 2rem 2.5rem; max-width: 580px; box-shadow: 0 0 25px rgba(6, 182, 212, 0.2); }
            h1 { color: #38bdf8; margin: 0 0 0.5rem 0; font-size: 1.5rem; }
            p { color: #94a3b8; font-size: 0.9rem; line-height: 1.5; }
            .badge { background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; border: 1px solid rgba(16, 185, 129, 0.4); }
            .btn { display: inline-block; background: linear-gradient(135deg, #06b6d4, #2563eb); color: #fff; text-decoration: none; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 600; font-size: 0.85rem; margin-top: 1rem; }
            .btn:hover { opacity: 0.9; }
            .endpoints { margin-top: 1.25rem; font-size: 0.8rem; color: #64748b; }
            code { color: #38bdf8; background: rgba(0,0,0,0.3); padding: 2px 5px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <h1>SupplyChain Guardian API</h1>
              <span class="badge">● ONLINE</span>
            </div>
            <p>Enterprise AI Autonomous Supply Chain Control Tower & Decision Service is active.</p>
            <a href="${frontendUrl}" class="btn" target="_blank">Launch Live Web Application (Vercel) ➔</a>
            <div class="endpoints">
              <p>Key Endpoints:</p>
              <ul>
                <li><code>GET /api/health</code> - System Telemetry Health</li>
                <li><code>GET /api/dashboard</code> - Control Tower Metrics</li>
                <li><code>GET /api/disruptions</code> - Incident Radar</li>
                <li><code>GET /api/decisions</code> - Autonomous Decisions</li>
              </ul>
            </div>
          </div>
        </body>
        </html>
      `);
    } else {
      res.json({
        status: 'ONLINE',
        name: 'SupplyChain Guardian Control Tower API',
        version: '2.4.0',
        frontendUrl,
        deployedUrl: 'https://nexchain-ai.onrender.com',
      });
    }
  });

  app.get('/favicon.ico', (req, res) => res.status(204).end());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ONLINE',
      system: 'SupplyChain Guardian Control Tower API',
      timestamp: new Date().toISOString(),
      databaseMode: db.isSupabaseConnected() ? 'SUPABASE_POSTGRES' : 'AUTONOMOUS_PERSISTENT_MEMORY',
      version: '2.4.0',
    });
  });

  // Demo Reset endpoint
  app.post('/api/demo/reset', (req, res) => {
    db.resetDemoData();
    const io = req.app.get('io');
    if (io) {
      io.emit('dashboard:update', { type: 'DEMO_RESET' });
    }
    res.json({ success: true, message: 'All supply chain operational data reset to pristine seed state.' });
  });

  // Mount API modules
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/suppliers', supplierRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/shipments', shipmentRoutes);
  app.use('/api/disruptions', disruptionRoutes);
  app.use('/api/simulation', simulationRoutes);
  app.use('/api/agent', agentRoutes);
  app.use('/api/decisions', decisionRoutes);
  app.use('/api/audit-logs', auditRoutes);
  app.use('/api/notifications', notificationRoutes);

  // 404 Handler
  app.use((req, res, next) => {
    res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
