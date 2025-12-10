# Deployment Guide

Complete guide for deploying the Attendance Management System (AMS-AI) to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
  - [VPS/Cloud Server](#vpscloud-server)
  - [Docker Deployment](#docker-deployment)
  - [Heroku Deployment](#heroku-deployment)
- [Environment Configuration](#environment-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Database Setup](#database-setup)
- [Reverse Proxy (Nginx)](#reverse-proxy-nginx)
- [Process Management (PM2)](#process-management-pm2)
- [Monitoring & Logging](#monitoring--logging)
- [Backup Strategy](#backup-strategy)
- [Security Checklist](#security-checklist)

---

## Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 2 GB | 4+ GB |
| Storage | 20 GB | 50+ GB |
| Node.js | v14.x | v18.x LTS |
| MongoDB | v4.4 | v6.x |

### Required Software

- Node.js (v14.0.0+)
- MongoDB (v4.4+)
- FFmpeg (for video processing)
- Git
- PM2 (for production)
- Nginx (as reverse proxy)

---

## Local Development

### Quick Start

```bash
# Clone repository
git clone https://github.com/Asad-xnb/Attendance-Management-System.git
cd Attendance-Management-System

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your settings

# Start MongoDB
mongod

# Start development server
npm start
```

### Development Environment Variables

```env
# .env (development)
MONGODB_URI=mongodb://localhost:27017/ams-ai
SESSION_SECRET=dev-secret-key-change-in-production
PORT=3000
NODE_ENV=development
```

---

## Production Deployment

### VPS/Cloud Server

#### Step 1: Server Setup (Ubuntu/Debian)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install MongoDB
sudo apt install -y mongodb
sudo systemctl enable mongodb
sudo systemctl start mongodb

# Install FFmpeg
sudo apt install -y ffmpeg

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### Step 2: Application Setup

```bash
# Create application directory
sudo mkdir -p /var/www/ams-ai
sudo chown $USER:$USER /var/www/ams-ai

# Clone repository
cd /var/www/ams-ai
git clone https://github.com/Asad-xnb/Attendance-Management-System.git .

# Install dependencies
npm install --production

# Create production environment file
sudo nano .env
```

#### Step 3: Environment Configuration

```env
# .env (production)
MONGODB_URI=mongodb://localhost:27017/ams-ai
SESSION_SECRET=your-very-long-random-secret-key-here
PORT=3000
NODE_ENV=production
```

#### Step 4: Start Application with PM2

```bash
# Start application
pm2 start app.js --name "ams-ai"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs
```

---

### Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p uploads/faces uploads/videos

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "app.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: ams-ai
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/ams-ai
      - SESSION_SECRET=${SESSION_SECRET}
    volumes:
      - ./uploads:/usr/src/app/uploads
    depends_on:
      - mongo
    networks:
      - ams-network

  mongo:
    image: mongo:6
    container_name: ams-mongo
    restart: unless-stopped
    volumes:
      - mongo-data:/data/db
    networks:
      - ams-network

volumes:
  mongo-data:

networks:
  ams-network:
    driver: bridge
```

#### Deploy with Docker

```bash
# Build and start containers
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop containers
docker-compose down
```

---

### Heroku Deployment

#### Step 1: Prepare Application

```bash
# Create Procfile
echo "web: node app.js" > Procfile

# Ensure package.json has start script
# "scripts": { "start": "node app.js" }
```

#### Step 2: Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create your-ams-ai-app

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set SESSION_SECRET=your-secret-key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open application
heroku open
```

**Note:** Heroku's ephemeral filesystem means uploaded files won't persist. Use cloud storage (AWS S3, Cloudinary) for production file uploads.

---

## Environment Configuration

### Production Environment Variables

```env
# Server
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://username:password@host:27017/ams-ai?authSource=admin

# Security
SESSION_SECRET=generate-64-character-random-string-here

# Optional: File Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1

# Optional: Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Generate Secure Session Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Database Setup

### MongoDB Security

```bash
# Connect to MongoDB
mongosh

# Create admin user
use admin
db.createUser({
  user: "adminUser",
  pwd: "securePassword123",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

# Create application user
use ams-ai
db.createUser({
  user: "amsUser",
  pwd: "applicationPassword123",
  roles: [ { role: "readWrite", db: "ams-ai" } ]
})
```

### Enable Authentication

Edit `/etc/mongod.conf`:
```yaml
security:
  authorization: enabled
```

Restart MongoDB:
```bash
sudo systemctl restart mongod
```

Update connection string:
```env
MONGODB_URI=mongodb://amsUser:applicationPassword123@localhost:27017/ams-ai?authSource=ams-ai
```

---

## Reverse Proxy (Nginx)

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/ams-ai

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # File upload size
    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /public/ {
        alias /var/www/ams-ai/public/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/ams-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Process Management (PM2)

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ams-ai',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

### PM2 Commands

```bash
# Start with ecosystem file
pm2 start ecosystem.config.js --env production

# View status
pm2 status

# View logs
pm2 logs ams-ai

# Restart application
pm2 restart ams-ai

# Reload (zero-downtime)
pm2 reload ams-ai

# Monitor
pm2 monit
```

---

## Monitoring & Logging

### PM2 Monitoring

```bash
# Install PM2 log rotation
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Application Logging

Add logging to your application:
```javascript
// In app.js
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Access logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'), 
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));
```

---

## Backup Strategy

### Automated Database Backup

```bash
#!/bin/bash
# /usr/local/bin/backup-ams.sh

BACKUP_DIR="/backups/ams-ai"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
MONGODB_URI="mongodb://localhost:27017/ams-ai"

# Create backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/$DATE.tar.gz" -C "$BACKUP_DIR" "$DATE"
rm -rf "$BACKUP_DIR/$DATE"

# Delete backups older than 7 days
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Schedule with cron:
```bash
# Run daily at 2 AM
0 2 * * * /usr/local/bin/backup-ams.sh >> /var/log/ams-backup.log 2>&1
```

---

## Security Checklist

### Pre-Deployment

- [ ] Change all default passwords
- [ ] Generate secure SESSION_SECRET
- [ ] Enable MongoDB authentication
- [ ] Configure firewall (UFW)
- [ ] Set up SSL/HTTPS
- [ ] Remove development dependencies
- [ ] Set NODE_ENV=production

### Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Post-Deployment

- [ ] Test all authentication flows
- [ ] Verify file upload limits
- [ ] Check error handling
- [ ] Monitor application logs
- [ ] Set up automated backups
- [ ] Configure monitoring alerts

---

## Troubleshooting

### Common Issues

**Application won't start:**
```bash
# Check PM2 logs
pm2 logs ams-ai --lines 100

# Check if port is in use
sudo lsof -i :3000
```

**Database connection failed:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Test connection
mongosh "mongodb://localhost:27017/ams-ai"
```

**Nginx 502 Bad Gateway:**
```bash
# Check if app is running
pm2 status

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

**Face detection not working:**
```bash
# Check FFmpeg installation
ffmpeg -version

# Verify face-api models exist
ls -la public/scripts/
ls -la FACE_API_Models/
```
