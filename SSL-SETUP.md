# 🔒 SSL Configuration Guide

## Overview

This guide helps you configure SSL/HTTPS for your xCloud Bot deployment using Let's Encrypt free certificates.

## Quick Setup

### Option 1: Default Hostname SSL

```bash
# Configure SSL with server hostname
npm run setup:ssl
```

### Option 2: Custom Domain SSL

```bash
# Configure SSL with custom domain (if you have one)
cd scripts && node setup-ssl.js your-domain.com
```

## What Gets Configured

### 🔐 SSL Certificate

- **Provider**: Let's Encrypt (Free)
- **Type**: Domain Validated (DV)
- **Validity**: 90 days (auto-renews)
- **Encryption**: RSA 2048-bit

### 🌐 Nginx Configuration

- **HTTP → HTTPS** redirect (301)
- **Modern SSL** protocols (TLS 1.2, 1.3)
- **Security headers** (HSTS, X-Frame-Options, etc.)
- **SSL session** caching
- **Perfect Forward Secrecy**

### 🔄 Auto-Renewal

- **Cron job**: Daily check for renewal
- **Grace period**: 30 days before expiry
- **Log file**: `/var/log/ssl-renewal.log`
- **Auto-reload**: Nginx restarted on renewal

## Server Information

- **Hostname**: `237.222.167.72.host.secureserver.net`
- **IP**: `72.167.222.237`
- **Provider**: SecureServer (GoDaddy)

## After SSL Setup

### 🌐 Your URLs

```
✅ HTTPS: https://237.222.167.72.host.secureserver.net
✅ HTTPS: https://72.167.222.237
🔄 HTTP:  http://72.167.222.237 (redirects to HTTPS)
```

### 🔍 Verification

```bash
# Test HTTPS
curl -I https://237.222.167.72.host.secureserver.net

# Test redirect
curl -I http://237.222.167.72.host.secureserver.net

# Check SSL grade
https://www.ssllabs.com/ssltest/analyze.html?d=237.222.167.72.host.secureserver.net
```

## Custom Domain Setup

If you want to use a custom domain:

### 1. DNS Configuration

Point your domain to the server:

```
A     yourdomain.com      72.167.222.237
CNAME www.yourdomain.com  yourdomain.com
```

### 2. SSL Setup

```bash
cd scripts && node setup-ssl.js yourdomain.com
```

### 3. Update Application

Update your application configuration to use the new domain.

## Troubleshooting

### Common Issues

#### Certificate Not Obtained

```bash
# Check if domain resolves to server
nslookup 237.222.167.72.host.secureserver.net

# Check if port 80 is accessible
curl http://237.222.167.72.host.secureserver.net/.well-known/acme-challenge/test

# Check Let's Encrypt rate limits
https://letsencrypt.org/docs/rate-limits/
```

#### Nginx SSL Error

```bash
# Test Nginx configuration
sudo nginx -t

# Check SSL certificate files
sudo ls -la /etc/letsencrypt/live/237.222.167.72.host.secureserver.net/

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

#### Auto-Renewal Failed

```bash
# Test renewal manually
sudo certbot renew --dry-run

# Check renewal log
sudo cat /var/log/ssl-renewal.log

# Check cron job
sudo crontab -l
ls -la /etc/cron.daily/ssl-renewal
```

### Manual Certificate Management

#### Check Certificate Status

```bash
# View certificate info
sudo certbot certificates

# Check expiry date
echo | openssl s_client -connect 237.222.167.72.host.secureserver.net:443 2>/dev/null | openssl x509 -noout -dates
```

#### Force Renewal

```bash
# Force certificate renewal
sudo certbot renew --force-renewal

# Reload Nginx
sudo systemctl reload nginx
```

#### Revoke Certificate

```bash
# If needed, revoke certificate
sudo certbot revoke --cert-path /etc/letsencrypt/live/237.222.167.72.host.secureserver.net/cert.pem
```

## Security Features

### 🔒 SSL Configuration

- **Protocols**: TLS 1.2, TLS 1.3 only
- **Ciphers**: Modern, secure cipher suites
- **HSTS**: Enabled with 1-year max-age
- **Session Cache**: 10MB shared cache
- **OCSP Stapling**: Enabled for better performance

### 🛡️ Security Headers

```nginx
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### 🔄 Performance Optimizations

- **HTTP/2**: Enabled
- **Session Resumption**: Configured
- **Static File Caching**: 1 year for static assets
- **Gzip Compression**: Enabled
- **Keep-Alive**: Optimized timeouts

## Monitoring

### 📊 SSL Certificate Monitoring

```bash
# Check certificate expiry
openssl s_client -connect 237.222.167.72.host.secureserver.net:443 -servername 237.222.167.72.host.secureserver.net < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Monitor renewal logs
tail -f /var/log/ssl-renewal.log

# Check Certbot timer
sudo systemctl status certbot.timer
```

### 🔍 SSL Quality Testing

- **SSL Labs**: https://www.ssllabs.com/ssltest/
- **SSL Check**: https://www.sslshopper.com/ssl-checker.html
- **Security Headers**: https://securityheaders.com/

## Cost & Limits

### 💰 Let's Encrypt (Free)

- **Cost**: Free forever
- **Rate Limits**: 50 certs/week per domain
- **Renewal**: Every 60-90 days
- **Wildcard**: Requires DNS challenge (advanced)

### 📈 Alternative Options

If you need more features:

- **Cloudflare SSL**: Free + CDN
- **Paid Certificates**: Extended validation, insurance
- **AWS Certificate Manager**: Free for AWS services

## Support

For SSL-related issues:

1. Check the setup logs for error messages
2. Verify domain DNS resolution
3. Ensure firewall allows ports 80 and 443
4. Test with SSL Labs checker
5. Review Let's Encrypt documentation

Your xCloud Bot is now secure with HTTPS! 🔒✨
