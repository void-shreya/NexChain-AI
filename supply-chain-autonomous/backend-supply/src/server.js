require('dotenv').config();
const http = require('http');
const createApp = require('./app');
const { initSocketService } = require('./realtime/socketService');

const PORT = process.env.PORT || 5000;

const startServer = () => {
  const app = createApp();
  const httpServer = http.createServer(app);

  // Initialize Socket.io and attach to express app
  const io = initSocketService(httpServer);
  app.set('io', io);

  httpServer.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 SupplyChain Guardian Control Tower Backend ONLINE`);
    console.log(`📡 REST API Endpoint:   http://localhost:${PORT}/api`);
    console.log(`⚡ WebSocket Stream:   ws://localhost:${PORT}`);
    console.log(`🛡️  Role-Based Access:  ADMIN, SUPPLY_MANAGER, OPERATIONS_MANAGER, VIEWER`);
    console.log(`================================================================`);
  });

  // Global Process Error Handlers to guarantee 100% uptime
  process.on('uncaughtException', (err) => {
    console.error('⚠️ Uncaught Exception intercepted:', err.message);
  });

  process.on('unhandledRejection', (reason) => {
    console.warn('⚠️ Unhandled Promise Rejection intercepted:', reason?.message || reason);
  });
};

startServer();
