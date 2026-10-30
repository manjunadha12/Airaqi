# AirSense Cloud - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890",
  "organizationId": "org_id"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "userId": "user_id"
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "user": { ... }
}
```

### Verify Email
```
POST /auth/verify-email
{
  "token": "email_verification_token"
}
```

### Send OTP
```
POST /auth/send-otp
{
  "email": "john@example.com"
}
```

### Verify OTP
```
POST /auth/verify-otp
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Forgot Password
```
POST /auth/forgot-password
{
  "email": "john@example.com"
}
```

### Reset Password
```
POST /auth/reset-password
{
  "token": "reset_token",
  "password": "NewPassword123!"
}
```

## AQI Endpoints

### Get Current AQI
```
GET /aqi/current?organizationId=org_id

Response:
{
  "success": true,
  "data": {
    "aqi": { "value": 85, "category": "satisfactory" },
    "pollutants": { "pm2_5": 25, "pm10": 35 },
    "environmental": { "temperature": 28, "humidity": 65 },
    "timestamp": "2024-01-01T10:00:00Z"
  }
}
```

### Get AQI History
```
GET /aqi/history?sensorId=sensor_id&startDate=2024-01-01&endDate=2024-01-31&limit=100
```

### Get AQI Statistics
```
GET /aqi/statistics?sensorId=sensor_id&period=week
```

### Get All Sensors AQI
```
GET /aqi/sensors?organizationId=org_id
```

### Submit AQI Reading
```
POST /aqi/submit
Content-Type: application/json

{
  "sensorId": "sensor_id",
  "organizationId": "org_id",
  "aqi": 85,
  "pollutants": {
    "pm2_5": 25,
    "pm10": 35,
    "no2": 40,
    "so2": 10,
    "co": 0.5,
    "o3": 50
  },
  "environmental": {
    "temperature": 28,
    "humidity": 65,
    "pressure": 1013
  },
  "smokeLevel": 15,
  "gasLevel": 20,
  "sensorStatus": {
    "isOnline": true,
    "battery": 85,
    "signalStrength": 100
  }
}
```

## Alert Endpoints

### Create Alert
```
POST /alerts
{
  "organizationId": "org_id",
  "sensorId": "sensor_id",
  "type": "aqi_critical",
  "severity": "critical",
  "title": "High AQI Alert",
  "description": "AQI has exceeded safe level",
  "value": 350,
  "threshold": 300,
  "recipients": ["user_id1", "user_id2"]
}
```

### Get Alerts
```
GET /alerts?organizationId=org_id&status=active&severity=critical&limit=50
```

### Acknowledge Alert
```
PUT /alerts/:alertId/acknowledge
```

### Resolve Alert
```
PUT /alerts/:alertId/resolve
{
  "resolutionNotes": "Issue resolved"
}
```

### Get Alert Statistics
```
GET /alerts/statistics?organizationId=org_id
```

## Prediction Endpoints

### Generate Prediction
```
POST /predictions/generate
{
  "sensorId": "sensor_id",
  "organizationId": "org_id"
}
```

### Get Latest Prediction
```
GET /predictions/latest/:sensorId
```

### Get Organization Predictions
```
GET /predictions/organization?organizationId=org_id&limit=20
```

### Get Pollution Trends
```
GET /predictions/trends?sensorId=sensor_id&timeFrame=week
```

## Report Endpoints

### Generate Report
```
POST /reports/generate
{
  "reportType": "monthly_aqi",
  "fileFormat": "pdf",
  "organizationId": "org_id",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### Get Download History
```
GET /reports/history?organizationId=org_id&reportType=monthly_aqi&limit=50
```

### Get Download Statistics
```
GET /reports/statistics?organizationId=org_id
```

## WebSocket Events

### Connect
```javascript
const socket = io('http://localhost:5000');
socket.emit('userJoin', { userId: 'user_id', organizationId: 'org_id' });
```

### Real-time AQI Update
```javascript
socket.on('aqiUpdate', (data) => {
  console.log(data.aqi, data.timestamp);
});
```

### Real-time Alert
```javascript
socket.on('newAlert', (alert) => {
  console.log(alert.type, alert.severity);
});
```

### Sensor Status Update
```javascript
socket.on('sensorStatus', (data) => {
  console.log(data.sensorId, data.isOnline);
});
```

### Prediction Update
```javascript
socket.on('predictionUpdate', (data) => {
  console.log(data.predictions);
});
```

## Error Responses

```json
{
  "success": false,
  "message": "Error description"
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
