import io from 'socket.io-client';
import { config } from '../config/api';

let socket = null;

export const socketService = {
  connect: (userId, organizationId) => {
    if (!socket) {
      socket = io(config.SOCKET_URL, {
        auth: {
          userId,
          organizationId,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.emit('userJoin', { userId, organizationId });

      socket.on('connect', () => {
        console.log('WebSocket connected:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    }

    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket: () => socket,

  // Emit events
  emitAQIUpdate: (data) => {
    if (socket) socket.emit('aqiUpdate', data);
  },

  emitAlert: (data) => {
    if (socket) socket.emit('alert', data);
  },

  emitSensorStatus: (data) => {
    if (socket) socket.emit('sensorStatus', data);
  },

  emitPrediction: (data) => {
    if (socket) socket.emit('prediction', data);
  },

  // Listen to events
  onAQIUpdate: (callback) => {
    if (socket) {
      socket.off('aqiUpdate');
      socket.on('aqiUpdate', callback);
    }
  },

  onNewAlert: (callback) => {
    if (socket) {
      socket.off('newAlert');
      socket.on('newAlert', callback);
    } else {
      // Retry in 1 second if socket not ready
      setTimeout(() => socketService.onNewAlert(callback), 1000);
    }
  },

  onSensorStatus: (callback) => {
    if (socket) socket.on('sensorStatus', callback);
  },

  onPredictionUpdate: (callback) => {
    if (socket) socket.on('predictionUpdate', callback);
  },

  onUserCount: (callback) => {
    if (socket) socket.on('userCount', callback);
  },
};

export default socketService;
