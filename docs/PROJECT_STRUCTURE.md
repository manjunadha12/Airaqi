# Project Structure

## AirSense Cloud - Full Stack Application

```
d:\air\
│
├── backend/                          # Node.js/Express Backend
│   ├── config/                       # Configuration files
│   │   ├── database.js              # MongoDB connection
│   │   ├── email.js                 # Email service setup
│   │   └── jwt.js                   # JWT token generation
│   │
│   ├── controllers/                  # Business logic
│   │   ├── authController.js        # Authentication
│   │   ├── aqiController.js         # AQI data handling
│   │   ├── alertController.js       # Alert management
│   │   ├── predictionController.js  # AI predictions
│   │   └── reportController.js      # Report generation
│   │
│   ├── middleware/                   # Express middleware
│   │   ├── authenticate.js          # JWT verification
│   │   ├── authorize.js             # Role-based access
│   │   ├── errorHandler.js          # Error handling
│   │   ├── rateLimiter.js           # API rate limiting
│   │   └── auditLog.js              # Audit logging
│   │
│   ├── models/                       # MongoDB schemas
│   │   ├── User.js                  # User model
│   │   ├── Organization.js          # Organization model
│   │   ├── Sensor.js                # Sensor model
│   │   ├── AQIHistory.js            # AQI data model
│   │   ├── Alert.js                 # Alert model
│   │   ├── DownloadHistory.js       # Report download tracking
│   │   └── Prediction.js            # Prediction model
│   │
│   ├── routes/                       # API routes
│   │   ├── authRoutes.js            # Authentication endpoints
│   │   ├── aqiRoutes.js             # AQI endpoints
│   │   ├── alertRoutes.js           # Alert endpoints
│   │   ├── predictionRoutes.js      # Prediction endpoints
│   │   └── reportRoutes.js          # Report endpoints
│   │
│   ├── services/                     # Business services
│   │   ├── geminiService.js         # Google Gemini AI integration
│   │   ├── reportService.js         # Report generation (PDF, Excel, CSV)
│   │   └── emailService.js          # Email notifications
│   │
│   ├── utils/                        # Utility functions
│   │   ├── helpers.js               # Helper functions
│   │   └── validators.js            # Input validation
│   │
│   ├── websocket/                    # WebSocket configuration
│   │   └── socketHandler.js         # Real-time event handling
│   │
│   ├── server.js                     # Main server file
│   ├── package.json                  # Backend dependencies
│   ├── .env.example                  # Environment template
│   └── .gitignore
│
├── frontend/                         # React.js Frontend
│   ├── public/
│   │   └── index.html               # HTML template
│   │
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── Layout.jsx           # Main layout
│   │   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   │   ├── Header.jsx           # Top header
│   │   │   ├── Charts.jsx           # Chart components
│   │   │   └── Cards.jsx            # Card components
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Alerts.jsx           # Alerts page
│   │   │   └── Reports.jsx          # Reports page
│   │   │
│   │   ├── context/                  # State management
│   │   │   └── store.js             # Zustand stores
│   │   │
│   │   ├── services/                 # API services
│   │   │   ├── apiService.js        # REST API client
│   │   │   └── socketService.js     # WebSocket client
│   │   │
│   │   ├── config/                   # Configuration
│   │   │   └── api.js               # API endpoints & constants
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   ├── styles/                   # Global styles
│   │   ├── App.jsx                  # App routing
│   │   └── index.js                 # React entry point
│   │
│   ├── package.json                  # Frontend dependencies
│   ├── .env.example                  # Environment template
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── postcss.config.js             # PostCSS config
│   ├── tsconfig.json                 # TypeScript config
│   └── .gitignore
│
├── docker/                           # Docker configuration
│   ├── Dockerfile.backend            # Backend Docker image
│   ├── Dockerfile.frontend           # Frontend Docker image
│   └── docker-compose.yml            # Docker Compose setup
│
└── docs/                             # Documentation
    ├── API_DOCUMENTATION.md          # API reference
    └── SETUP_GUIDE.md                # Setup instructions
```

## Technology Stack Summary

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **AI**: Google Gemini API
- **Reports**: PDFKit, ExcelJS, CSV-writer
- **Security**: Bcrypt, Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: React 18
- **State Management**: Zustand
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Icons**: React Icons

### Cloud & Infrastructure
- **Database Hosting**: MongoDB Atlas
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **API Gateway**: Express.js with rate limiting
- **Storage**: Cloud storage ready

## Key Features Implemented

### Module 1: Air Quality Monitoring
- Real-time AQI monitoring
- Multi-sensor support
- Environmental data tracking
- Sensor status monitoring
- Dark mode support

### Module 2: User Management
- User registration & authentication
- Email verification
- Role-based access control (4 roles)
- User activity tracking
- Audit logging

### Module 3: Cloud Data Management
- Real-time data sync
- Cloud backup ready
- Data retention policies
- Performance analytics
- API response monitoring

### Module 4: AI Predictions
- 1/6/12/24-hour AQI predictions
- Gemini AI integration
- Trend analysis
- Pollution insights
- Preventive recommendations

### Module 5: Alert Management
- 6+ alert types
- Multi-channel notifications
- Alert escalation
- Custom thresholds
- Alert history tracking

### Module 6: Historical Data & Reports
- Historical AQI records
- Multiple report formats (PDF, Excel, CSV, JSON)
- Download history tracking
- Report filtering & export
- Date range analysis

## API Endpoints Overview

### Authentication (8 endpoints)
- Register, Login, Verify Email, OTP, Password Reset

### AQI Data (6 endpoints)
- Current AQI, History, Statistics, Sensor data

### Alerts (7 endpoints)
- Create, Get, Acknowledge, Resolve, Statistics

### Predictions (5 endpoints)
- Generate, Get Latest, Organization, Trends, Batch

### Reports (6 endpoints)
- Generate, Download History, Statistics, Export

## Security Features

- JWT-based authentication
- Password hashing (bcrypt)
- Email verification
- OTP verification
- Rate limiting (100 req/15min general, 5 login attempts)
- API rate limiting (30 req/min)
- CORS configuration
- Helmet.js security headers
- Audit logging
- Role-based access control
- Input validation
- Error handling

## Deployment Ready

- Docker support (Frontend & Backend)
- Docker Compose for local/prod setup
- Environment configuration templates
- Production-grade error handling
- Scalable architecture
- WebSocket support for real-time features
- Database indexing for performance
