const { Server } = require('socket.io');
const { db } = require('../database/dbClient');

const initSocketService = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Socket client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Socket client disconnected: ${socket.id}`);
    });
  });

  // Background Live Telemetry Simulator for Demo (Moves moving vehicles along highway slightly every 8 seconds)
  setInterval(async () => {
    try {
      const shipments = await db.getShipments();
      const inTransit = shipments.filter((s) => s.status === 'IN_TRANSIT');

      if (inTransit.length > 0) {
        // Pick one shipment to advance GPS coordinates along its corridor
        const target = inTransit[Math.floor(Math.random() * inTransit.length)];
        const latDelta = (Math.random() - 0.48) * 0.008;
        const lngDelta = (Math.random() - 0.48) * 0.008;
        const newLat = parseFloat((target.current_latitude + latDelta).toFixed(6));
        const newLng = parseFloat((target.current_longitude + lngDelta).toFixed(6));

        await db.updateShipment(target.id, {
          current_latitude: newLat,
          current_longitude: newLng,
          speed_kmh: Math.round(55 + Math.random() * 20),
        });

        io.emit('shipment:telemetry_tick', {
          id: target.id,
          tracking_number: target.tracking_number,
          current_latitude: newLat,
          current_longitude: newLng,
          speed_kmh: target.speed_kmh,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      // Telemetry simulation tick silent fail
    }
  }, 7000);

  return io;
};

module.exports = {
  initSocketService,
};
