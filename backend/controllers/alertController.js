const Alert = require('../models/Alert');
const { generateUniqueId } = require('../utils/helpers');
const { sendAlertNotificationEmail } = require('../services/emailService');
const User = require('../models/User');

// Create Alert
exports.createAlert = async (req, res) => {
  try {
    const {
      organizationId,
      sensorId,
      type,
      severity,
      title,
      description,
      value,
      threshold,
      unit,
      recipients,
    } = req.body;

    const alert = new Alert({
      organization: organizationId,
      sensor: sensorId,
      type,
      severity,
      title,
      description,
      value,
      threshold,
      unit,
      recipients,
      triggeredAt: new Date(),
    });

    await alert.save();

    // Send alert notifications
    const recipientUsers = await User.find({ _id: { $in: recipients } });
    for (const user of recipientUsers) {
      try {
        await sendAlertNotificationEmail(
          user.email,
          alert,
          `${user.firstName} ${user.lastName}`
        );
      } catch (error) {
        console.error(`Failed to send alert email to ${user.email}:`, error);
      }
    }

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.to(`org_${organizationId}`).emit('newAlert', alert);
    }

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Alerts
exports.getAlerts = async (req, res) => {
  try {
    const { city, status, severity, limit = 50 } = req.query;

    let query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;

    if (city) {
      query['location.city'] = city;
    }

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sensor')
      .populate('acknowledgedBy', 'firstName lastName email')
      .populate('resolvedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Alert by ID
exports.getAlertById = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await Alert.findById(alertId)
      .populate('sensor')
      .populate('acknowledgedBy')
      .populate('resolvedBy')
      .populate('recipients');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Acknowledge Alert
exports.acknowledgeAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.userId;

    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        status: 'acknowledged',
        acknowledgedAt: new Date(),
        acknowledgedBy: userId,
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert acknowledged',
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Resolve Alert
exports.resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { resolutionNotes } = req.body;
    const userId = req.userId;

    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: userId,
        resolutionNotes,
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert resolved',
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Alert Statistics
exports.getAlertStatistics = async (req, res) => {
  try {
    const { organizationId } = req.query;

    const totalAlerts = await Alert.countDocuments({
      organization: organizationId,
    });
    const activeAlerts = await Alert.countDocuments({
      organization: organizationId,
      status: 'active',
    });
    const criticalAlerts = await Alert.countDocuments({
      organization: organizationId,
      severity: 'critical',
    });
    const acknowledgedAlerts = await Alert.countDocuments({
      organization: organizationId,
      status: 'acknowledged',
    });

    res.status(200).json({
      success: true,
      data: {
        totalAlerts,
        activeAlerts,
        criticalAlerts,
        acknowledgedAlerts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Alert History
exports.getAlertHistory = async (req, res) => {
  try {
    const { organizationId, startDate, endDate, limit = 100 } = req.query;

    const query = { organization: organizationId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
