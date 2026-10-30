# AirSense Cloud - Setup Guide

## Prerequisites
- Node.js 14+
- MongoDB Atlas account
- Google Gemini API key
- Git

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create .env file
```bash
cp .env.example .env
```

### 4. Update .env file with your credentials
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/airsense_cloud
PORT=5000
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
```

### 5. Start the backend server
```bash
npm run dev
```

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd ../frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create .env file
```bash
cp .env.example .env
```

### 4. Update .env file
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 5. Start the frontend
```bash
npm start
```

## Docker Setup

### Using Docker Compose
```bash
cd docker
docker-compose up --build
```

## Database Setup

### Create MongoDB Collections Indexes
```javascript
// Run these commands in MongoDB shell
db.users.createIndex({ email: 1 }, { unique: true });
db.organizations.createIndex({ name: 1 }, { unique: true });
db.sensors.createIndex({ organization: 1, sensorId: 1 });
db.aqihistory.createIndex({ sensor: 1, timestamp: -1 });
db.aqihistory.createIndex({ organization: 1, timestamp: -1 });
db.alerts.createIndex({ organization: 1, createdAt: -1 });
db.alerts.createIndex({ sensor: 1, status: 1 });
db.predictions.createIndex({ sensor: 1, generatedAt: -1 });
```

## Default Admin User
After setup, create your first admin user:

```bash
# Use the registration endpoint with proper credentials
POST http://localhost:5000/api/auth/register
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "SecurePassword123!",
  "organizationId": "your_org_id"
}
```

## Important Security Notes

1. **API Keys**: Never commit .env files with real keys
2. **Gemini API Key**: Store securely in backend only
3. **JWT Secret**: Use a strong random string
4. **Database Password**: Use strong credentials
5. **SSL/TLS**: Enable in production
6. **Rate Limiting**: Adjust limits based on your needs
7. **CORS**: Configure for your production domain

## File Structure
```
d:\air\
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── websocket/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
└── docs/
    └── API_DOCUMENTATION.md
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :5000  # Backend
lsof -i :3000  # Frontend

# Kill process
kill -9 <PID>
```

### MongoDB Connection Error
- Verify MONGODB_URI in .env
- Check MongoDB Atlas firewall settings
- Ensure IP whitelist includes your machine

### API Request Errors
- Check browser console for CORS errors
- Verify backend is running
- Check JWT token expiration
- Review middleware configuration

## Testing

### Test backend API
```bash
curl http://localhost:5000/api/health
```

### Test WebSocket
```bash
# Use a WebSocket client or browser console
const socket = io('http://localhost:5000');
socket.emit('userJoin', { userId: 'test', organizationId: 'test' });
```

## Production Deployment

1. Update environment variables for production
2. Enable HTTPS/SSL
3. Set up proper database backups
4. Configure CDN for static assets
5. Set up monitoring and logging
6. Enable rate limiting
7. Use environment-specific keys
8. Deploy using Docker or traditional hosting
