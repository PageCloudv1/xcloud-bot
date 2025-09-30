# 🚀 xCloud Bot - Deployment Guide

## Production Server Setup

### Server Information

- **IP**: 72.167.222.237
- **OS**: Ubuntu 22.04 LTS
- **User**: rootkit
- **Password**: 103020Aa@@

## Quick Setup

### 1. Initial Server Setup

Run the setup script on your Ubuntu server:

```bash
# Clone repository
git clone https://github.com/PageCloudv1/xcloud-bot.git
cd xcloud-bot

# Run setup script
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh
```

### 2. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

| Secret Name    | Value        |
| -------------- | ------------ |
| `SSH_PASSWORD` | `103020Aa@@` |

### 3. Deploy Application

```bash
# Deploy to production
npm run deploy:production

# Or deploy to staging
npm run deploy:staging
```

## Manual Deployment

If you need to deploy manually:

```bash
# SSH to server
ssh rootkit@72.167.222.237

# Navigate to app directory
cd /opt/xcloud-bot/current

# Pull latest changes
git pull origin main

# Install dependencies
npm ci --production

# Build application
npm run build

# Restart application
pm2 restart xcloud-bot
```

## Application Management

### PM2 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs xcloud-bot

# Restart app
pm2 restart xcloud-bot

# Stop app
pm2 stop xcloud-bot

# Monitor in real-time
pm2 monit
```

### Nginx Commands

```bash
# Check status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### Application Logs

```bash
# Application logs
tail -f /var/log/xcloud-bot/app.log

# PM2 logs
pm2 logs xcloud-bot --lines 100

# System logs
journalctl -u nginx -f
```

## Environment Configuration

### Production Environment Variables

Edit `/opt/xcloud-bot/current/.env`:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# GitHub Configuration
GH_APP_ID=your_app_id
GH_PRIVATE_KEY_PATH=/opt/xcloud-bot/current/github-private-key.pem
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Database (if using MongoDB)
DATABASE_URL=mongodb://localhost:27017/xcloud-bot-prod

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/xcloud-bot/app.log
```

## Monitoring & Maintenance

### Health Checks

```bash
# Check if app is running
curl http://localhost:3000/health

# Check from outside
curl http://72.167.222.237/health
```

### Backup Management

```bash
# Manual backup
/opt/xcloud-bot/scripts/backup.sh

# View backups
ls -la /opt/xcloud-bot/backups/

# Restore from backup
cd /opt/xcloud-bot
tar -xzf backups/xcloud-bot-backup-YYYYMMDD_HHMMSS.tar.gz -C current/
```

### System Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
cd /opt/xcloud-bot/current
npm update

# Restart after updates
pm2 restart xcloud-bot
```

## Troubleshooting

### Common Issues

#### App Won't Start

```bash
# Check logs
pm2 logs xcloud-bot

# Check environment variables
pm2 env xcloud-bot

# Restart with fresh environment
pm2 delete xcloud-bot
pm2 start dist/index.js --name xcloud-bot
```

#### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

#### Port Issues

```bash
# Check what's using port 3000
sudo netstat -tlnp | grep 3000

# Kill process on port
sudo fuser -k 3000/tcp
```

### Performance Monitoring

```bash
# System resources
htop

# Disk usage
df -h

# Memory usage
free -h

# PM2 monitoring
pm2 monit
```

## Security Considerations

### Firewall Rules

```bash
# Check UFW status
sudo ufw status

# Allow specific ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
```

### SSL/HTTPS Setup

To add SSL certificate:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Deployment Workflow

The CD pipeline automatically:

1. ✅ Builds the application
2. ✅ Creates deployment package
3. ✅ Stops current application
4. ✅ Backs up current version
5. ✅ Uploads new version
6. ✅ Installs dependencies
7. ✅ Starts new application
8. ✅ Configures reverse proxy
9. ✅ Cleans old deployments

## Support

For issues or questions:

- Check logs: `pm2 logs xcloud-bot`
- Monitor system: `pm2 monit`
- View deployment status in GitHub Actions
- Contact: xCloud Team

