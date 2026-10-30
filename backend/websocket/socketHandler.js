const io = require('socket.io');

const initializeWebSocket = (server, corsOrigin) => {
  const socketIO = io(server, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Store connected users
  const connectedUsers = {};
  const roomUsers = {};

  socketIO.on('connection', (socket) => {
    console.log(`New WebSocket connection: ${socket.id}`);

    // User joins
    socket.on('userJoin', ({ userId, organizationId }) => {
      connectedUsers[socket.id] = {
        userId,
        organizationId,
        socketId: socket.id,
      };

      const room = `org_${organizationId}`;
      socket.join(room);

      if (!roomUsers[room]) {
        roomUsers[room] = [];
      }
      roomUsers[room].push(socket.id);

      console.log(`User ${userId} joined organization room: ${room}`);

      // Emit user count
      socketIO.to(room).emit('userCount', {
        count: roomUsers[room]?.length || 0,
      });
    });

    // Real-time AQI update
    socket.on('aqiUpdate', (data) => {
      const user = connectedUsers[socket.id];
      if (user) {
        const room = `org_${user.organizationId}`;
        socketIO.to(room).emit('aqiUpdate', {
          sensorId: data.sensorId,
          aqi: data.aqi,
          timestamp: new Date(),
          pollutants: data.pollutants,
          environmental: data.environmental,
        });
      }
    });

    // Real-time alert
    socket.on('alert', (data) => {
      const user = connectedUsers[socket.id];
      if (user) {
        const room = `org_${user.organizationId}`;
        socketIO.to(room).emit('newAlert', {
          alertId: data.alertId,
          type: data.type,
          severity: data.severity,
          message: data.message,
          timestamp: new Date(),
        });
      }
    });

    // Sensor status update
    socket.on('sensorStatus', (data) => {
      const user = connectedUsers[socket.id];
      if (user) {
        const room = `org_${user.organizationId}`;
        socketIO.to(room).emit('sensorStatus', {
          sensorId: data.sensorId,
          status: data.status,
          isOnline: data.isOnline,
          battery: data.battery,
          timestamp: new Date(),
        });
      }
    });

    // Prediction update
    socket.on('prediction', (data) => {
      const user = connectedUsers[socket.id];
      if (user) {
        const room = `org_${user.organizationId}`;
        socketIO.to(room).emit('predictionUpdate', {
          sensorId: data.sensorId,
          predictions: data.predictions,
          timestamp: new Date(),
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      const user = connectedUsers[socket.id];
      if (user) {
        const room = `org_${user.organizationId}`;
        roomUsers[room] = roomUsers[room]?.filter((id) => id !== socket.id) || [];

        socketIO.to(room).emit('userCount', {
          count: roomUsers[room]?.length || 0,
        });

        console.log(`User disconnected: ${socket.id}`);
      }

      delete connectedUsers[socket.id];
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`WebSocket error: ${error}`);
    });
  });

  return socketIO;
};

module.exports = initializeWebSocket;
