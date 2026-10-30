# Deployment Configuration Guide

## Production Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database backups automated
- [ ] SSL/TLS certificates obtained
- [ ] Email service configured
- [ ] Gemini API quotas checked
- [ ] Rate limiting thresholds set
- [ ] Monitoring and logging configured
- [ ] Error tracking (Sentry) setup
- [ ] CDN configured for static assets
- [ ] Backup database strategy

### Server Configuration

#### AWS EC2 / Google Cloud
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB driver (if using remote DB)
# Already handled via npm packages

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx as reverse proxy
sudo apt-get install -y nginx
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:5000/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

### Database Security

```javascript
// MongoDB Atlas Security
1. Enable 2FA on Atlas account
2. Configure IP Whitelist
3. Create dedicated database user
4. Use VPC Peering if available
5. Enable encryption at rest
6. Enable backup
```

### Application Deployment

```bash
# 1. Clone repository
git clone <your-repo> /var/www/airsense-cloud
cd /var/www/airsense-cloud

# 2. Install dependencies
npm install --production

# 3. Build frontend
cd frontend
npm run build
cd ..

# 4. Setup environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with production values
cp frontend/.env.example frontend/.env
# Edit frontend/.env with production values

# 5. Start with PM2
pm2 start backend/server.js --name "airsense-backend"
pm2 start "npm start --prefix frontend" --name "airsense-frontend"
pm2 save
```

### SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

### Monitoring & Logging

```bash
# Install PM2 Monitoring
pm2 install pm2-logrotate
pm2 install pm2-auto-pull

# Install system monitoring
sudo apt-get install -y htop
sudo apt-get install -y curl
sudo apt-get install -y wget

# Setup Sentry for error tracking
# 1. Create Sentry account
# 2. Add Sentry SDK to backend and frontend
# 3. Configure in environment variables
```

### Database Backup Strategy

```bash
# Automated daily backup
0 2 * * * mongobackup.sh

# mongobackup.sh
#!/bin/bash
mongodump --uri="$MONGODB_URI" --out=/backups/mongo-$(date +%Y%m%d)
```

### Performance Optimization

```javascript
// Backend optimizations
1. Enable GZIP compression
2. Implement caching headers
3. Use database indexing
4. Implement pagination
5. Use Connection pooling
6. Enable query optimization
```

### Security Hardening

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Disable SSH password login
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Setup fail2ban
sudo apt-get install -y fail2ban
```

### Environment Variables (Production)

```bash
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=<production_db_uri>
JWT_SECRET=<strong_random_secret>
REFRESH_TOKEN_SECRET=<strong_random_secret>
GEMINI_API_KEY=<your_api_key>
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
EMAIL_HOST=<smtp_host>
EMAIL_USER=<email>
EMAIL_PASSWORD=<password>
CLOUDINARY_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>

# Frontend
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_SOCKET_URL=https://your-domain.com
REACT_APP_ENV=production
```

### Docker Production Deployment

```bash
# Build production images
docker build -t airsense-backend:latest -f docker/Dockerfile.backend .
docker build -t airsense-frontend:latest -f docker/Dockerfile.frontend .

# Push to registry
docker push your-registry/airsense-backend:latest
docker push your-registry/airsense-frontend:latest

# Deploy using docker-compose or Kubernetes
docker-compose -f docker/docker-compose.yml up -d
```

### Health Monitoring

```bash
# Endpoint to check
GET /api/health

# Response
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Scaling Strategy

1. **Horizontal Scaling**: Use load balancer
2. **Database Scaling**: MongoDB sharding
3. **Caching**: Redis for session/data caching
4. **CDN**: CloudFlare or Cloudinary
5. **Microservices**: Separate prediction service

### Monitoring Stack

```
- PM2 Monitoring
- New Relic (optional)
- Sentry (error tracking)
- CloudWatch/Stackdriver (logs)
- Prometheus + Grafana (metrics)
```

### Backup & Recovery

```bash
# Daily backup
0 2 * * * /path/to/backup-script.sh

# Weekly archive
0 3 * * 0 /path/to/archive-script.sh

# Monthly offsite backup
0 4 1 * * /path/to/offsite-backup-script.sh
```

### Rollback Procedure

```bash
# Keep last 3 versions
git tag -l | sort -V | tail -n +2 | head -n -3 | xargs git tag -d

# Rollback to previous version
git checkout <commit_hash>
npm install --production
npm run build
pm2 restart all
```

## Maintenance Schedule

- **Daily**: Monitor logs, check disk space
- **Weekly**: Review error reports, backup integrity check
- **Monthly**: Security updates, performance analysis
- **Quarterly**: Dependency updates, security audit

## Support & Monitoring

- Set up alert notifications
- Configure log aggregation
- Enable performance monitoring
- Setup incident response procedures
