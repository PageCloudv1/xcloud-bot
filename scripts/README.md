# 🚀 xCloud Bot - Automated Setup & Deployment Scripts

## Overview

This directory contains Node.js scripts for automated server setup and deployment. These scripts eliminate the need for manual SSH connections and command execution.

## Scripts

### 📦 `setup-remote.js`

Complete automated server setup including:

- ✅ System package updates
- ✅ Node.js 20 installation
- ✅ PM2 installation and configuration
- ✅ Nginx installation and configuration
- ✅ Firewall setup (UFW)
- ✅ Application directories creation
- ✅ Repository cloning and building
- ✅ Environment configuration
- ✅ Application startup
- ✅ Log rotation setup

### 🚀 `deploy-remote.js`

Automated deployment including:

- ✅ Backup creation
- ✅ Code updates (git pull)
- ✅ Dependency installation
- ✅ Application building
- ✅ Service restart (PM2 + Nginx)
- ✅ Health verification
- ✅ Cleanup old backups

### 🛠️ `cli.js`

Main CLI interface for easy script execution.

## Quick Start

### 1. First Time Setup

```bash
# Install script dependencies and setup the entire server
npm run setup:remote
```

This will:

- Connect to your Ubuntu server (72.167.222.237)
- Install all required software (Node.js, PM2, Nginx, Git)
- Clone your repository
- Build and start the application
- Configure reverse proxy
- Set up monitoring and logs

### 2. Deploy Updates

```bash
# Deploy latest changes to the server
npm run deploy:remote
```

This will:

- Create a backup of the current version
- Pull latest changes from GitHub
- Rebuild the application
- Restart services
- Verify deployment health

## Manual Installation

If you prefer to run the scripts manually:

```bash
# Navigate to scripts directory
cd scripts

# Install dependencies
npm install

# Run setup
node setup-remote.js

# Or run deployment
node deploy-remote.js
```

## Configuration

### Server Configuration

The scripts are pre-configured for your server:

- **Host**: 72.167.222.237
- **User**: rootkit
- **Password**: 103020Aa@@
- **Deploy Path**: /opt/xcloud-bot
- **App Port**: 3000

### Dependencies

The scripts automatically install:

```json
{
  "ssh2": "^1.15.0", // SSH connection
  "chalk": "^5.3.0", // Colored output
  "ora": "^7.0.1", // Loading spinners
  "inquirer": "^9.2.12" // Interactive prompts
}
```

## Features

### 🔒 Security

- Firewall configuration (UFW)
- SSH key-based authentication support
- Secure file permissions
- Log file rotation

### 📊 Monitoring

- PM2 process monitoring
- Application health checks
- Nginx status verification
- Automated log rotation

### 💾 Backup & Recovery

- Automatic backups before deployment
- Rollback capability on deployment failure
- Retention policy (7 days)
- Backup compression

### 🔧 Maintenance

- Automatic cleanup of old deployments
- Log rotation configuration
- Performance monitoring setup
- System update automation

## Troubleshooting

### Connection Issues

```bash
# Test SSH connection manually
ssh rootkit@72.167.222.237

# Check if server is accessible
ping 72.167.222.237
```

### Application Issues

```bash
# Check application status
npm run server:status

# View application logs
npm run server:logs

# Restart application
npm run server:restart
```

### Script Debugging

The scripts provide detailed output with:

- ✅ Success indicators
- ❌ Error messages with details
- 🔄 Progress spinners
- 📊 Status information

### Common Solutions

#### Permission Denied

```bash
# Fix file permissions on server
sudo chown -R rootkit:rootkit /opt/xcloud-bot
sudo chmod +x /opt/xcloud-bot/repo/scripts/*.sh
```

#### Port Already in Use

```bash
# Kill process on port 3000
sudo fuser -k 3000/tcp
pm2 restart xcloud-bot
```

#### Nginx Configuration Error

```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Integration with GitHub Actions

These scripts work alongside the GitHub Actions workflows:

1. **Manual Setup**: Use `npm run setup:remote` for initial setup
2. **Automated Deploy**: GitHub Actions handles deployments on push to main
3. **Emergency Deploy**: Use `npm run deploy:remote` for immediate deployments

## File Structure

```
scripts/
├── package.json         # Script dependencies
├── setup-remote.js      # Complete server setup
├── deploy-remote.js     # Deployment automation
├── cli.js              # Main CLI interface
└── README.md           # This file
```

## Support

For issues or questions:

1. Check the detailed output from the scripts
2. Verify server accessibility: `ssh rootkit@72.167.222.237`
3. Check application status: `npm run server:status`
4. Review logs: `npm run server:logs`

## Next Steps

After successful setup:

1. ✅ Configure GitHub App credentials in `/opt/xcloud-bot/repo/.env`
2. ✅ Set up GitHub repository secrets for automated deployment
3. ✅ Test the application: http://72.167.222.237
4. ✅ Monitor with: `pm2 monit`

Your xCloud Bot is now ready for production! 🎉
