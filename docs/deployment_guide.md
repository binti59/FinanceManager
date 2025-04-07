# Personal Finance Manager - Deployment Guide

## 1. Introduction

This document provides comprehensive instructions for deploying the Personal Finance Manager application to a production environment. It covers server setup, application installation, configuration, and maintenance procedures.

## 2. System Requirements

### 2.1 Server Requirements

- **Operating System**: Ubuntu 20.04 LTS or newer
- **CPU**: Minimum 2 cores (recommended 4+ cores)
- **RAM**: Minimum 4GB (recommended 8GB+)
- **Storage**: Minimum 20GB (recommended 50GB+)
- **Network**: Stable internet connection with public IP address

### 2.2 Software Requirements

- **Node.js**: v16.x or newer
- **PostgreSQL**: v13.x or newer
- **Nginx**: v1.18.0 or newer
- **Docker**: v20.10.x or newer (optional, for containerized deployment)
- **Docker Compose**: v2.x or newer (optional, for containerized deployment)

## 3. Deployment Options

### 3.1 Direct Server Deployment

Traditional deployment directly on the server, suitable for single-server setups.

### 3.2 Containerized Deployment

Docker-based deployment for better isolation and scalability.

### 3.3 Recommended Approach

For the Contabo VPS with 6 cores and 8GB RAM, we recommend the containerized deployment approach for better resource utilization and easier maintenance.

## 4. Server Preparation

### 4.1 Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 4.2 Install Required Dependencies

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install Docker (optional, for containerized deployment)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose (optional, for containerized deployment)
sudo curl -L "https://github.com/docker/compose/releases/download/v2.5.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 4.3 Configure Firewall

```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 5432/tcp  # PostgreSQL (only if accessed remotely)
sudo ufw enable
```

## 5. Database Setup

### 5.1 Configure PostgreSQL

```bash
# Create database user
sudo -u postgres createuser --interactive
# Enter name of role to add: financeapp
# Shall the new role be a superuser? (y/n) n
# Shall the new role be allowed to create databases? (y/n) y
# Shall the new role be allowed to create more new roles? (y/n) n

# Create database
sudo -u postgres createdb financeapp

# Set user password
sudo -u postgres psql
postgres=# ALTER USER financeapp WITH ENCRYPTED PASSWORD 'your_secure_password';
postgres=# \q
```

### 5.2 Enable Remote Access (Optional)

If your database is on a separate server:

```bash
sudo nano /etc/postgresql/13/main/postgresql.conf
```

Uncomment and modify:
```
listen_addresses = '*'
```

Edit pg_hba.conf:
```bash
sudo nano /etc/postgresql/13/main/pg_hba.conf
```

Add:
```
host    all             all             0.0.0.0/0               md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## 6. Application Deployment

### 6.1 Direct Server Deployment

#### 6.1.1 Clone Repository

```bash
git clone https://github.com/binti59/FinanceManager.git /var/www/financeapp
cd /var/www/financeapp
```

#### 6.1.2 Install Dependencies

```bash
# Backend
cd backend
npm install --production
cd ..

# Frontend
cd frontend
npm install --production
npm run build
cd ..
```

#### 6.1.3 Configure Environment Variables

```bash
cd backend
cp .env.example .env
nano .env
```

Update the following variables:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://financeapp:your_secure_password@localhost:5432/financeapp
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
```

#### 6.1.4 Run Database Migrations

```bash
npx sequelize-cli db:migrate
```

#### 6.1.5 Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/financeapp
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        root /var/www/financeapp/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/financeapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6.1.6 Setup Process Manager

```bash
sudo npm install -g pm2
cd /var/www/financeapp/backend
pm2 start server.js --name "financeapp"
pm2 save
pm2 startup
```

### 6.2 Containerized Deployment

#### 6.2.1 Clone Repository

```bash
git clone https://github.com/binti59/FinanceManager.git /var/www/financeapp
cd /var/www/financeapp
```

#### 6.2.2 Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

Update the environment variables as needed.

#### 6.2.3 Start Docker Containers

```bash
docker-compose up -d
```

#### 6.2.4 Configure Nginx for Docker

```bash
sudo nano /etc/nginx/sites-available/financeapp
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3001;  # Frontend container port
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;  # Backend container port
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/financeapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. SSL Configuration

### 7.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d your_domain.com
```

Follow the prompts to complete the certificate installation.

## 8. Automated Deployment

### 8.1 Using the Installation Script

The repository includes an installation script that automates the deployment process:

```bash
cd /tmp
git clone https://github.com/binti59/FinanceManager.git
cd FinanceManager
chmod +x scripts/install.sh
./scripts/install.sh
```

The script will:
1. Check system requirements
2. Install dependencies
3. Set up the database
4. Configure the application
5. Deploy the frontend and backend
6. Set up Nginx
7. Configure SSL (if domain is provided)
8. Start the application

### 8.2 Deployment to Contabo VPS

To deploy specifically to the Contabo VPS:

```bash
./scripts/install.sh --server contabo --ip 62.171.138.27
```

## 9. Post-Deployment Tasks

### 9.1 Verify Deployment

1. Check if the application is running:
   ```bash
   # For direct deployment
   pm2 status
   
   # For containerized deployment
   docker-compose ps
   ```

2. Test the API:
   ```bash
   curl http://localhost:3000/api/health
   ```

3. Access the web interface by navigating to your domain in a browser.

### 9.2 Create Admin User

```bash
# For direct deployment
cd /var/www/financeapp/backend
node scripts/create-admin.js

# For containerized deployment
docker exec -it financeapp_backend node scripts/create-admin.js
```

## 10. Backup and Restore

### 10.1 Database Backup

```bash
# For direct deployment
pg_dump -U financeapp -d financeapp > backup_$(date +%Y%m%d).sql

# For containerized deployment
docker exec -it financeapp_db pg_dump -U financeapp -d financeapp > backup_$(date +%Y%m%d).sql
```

### 10.2 Database Restore

```bash
# For direct deployment
psql -U financeapp -d financeapp < backup_file.sql

# For containerized deployment
cat backup_file.sql | docker exec -i financeapp_db psql -U financeapp -d financeapp
```

### 10.3 Automated Backups

Set up a cron job for daily backups:

```bash
sudo nano /etc/cron.daily/financeapp-backup
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/financeapp"
mkdir -p $BACKUP_DIR
pg_dump -U financeapp -d financeapp > $BACKUP_DIR/backup_$(date +%Y%m%d).sql
find $BACKUP_DIR -type f -name "backup_*.sql" -mtime +30 -delete
```

Make it executable:
```bash
sudo chmod +x /etc/cron.daily/financeapp-backup
```

## 11. Monitoring and Maintenance

### 11.1 Log Monitoring

```bash
# Application logs (direct deployment)
pm2 logs financeapp

# Application logs (containerized deployment)
docker-compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 11.2 System Monitoring

Install and configure monitoring tools:

```bash
# Install Node Exporter for Prometheus
sudo apt install -y prometheus-node-exporter

# Install and configure Netdata for real-time monitoring
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

### 11.3 Regular Maintenance Tasks

1. Update system packages:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

2. Update application:
   ```bash
   # For direct deployment
   cd /var/www/financeapp
   git pull
   cd backend
   npm install --production
   cd ../frontend
   npm install --production
   npm run build
   pm2 restart financeapp
   
   # For containerized deployment
   cd /var/www/financeapp
   git pull
   docker-compose down
   docker-compose up -d
   ```

3. Renew SSL certificate (automatic with Certbot, but can be forced):
   ```bash
   sudo certbot renew
   ```

## 12. Troubleshooting

### 12.1 Common Issues

1. **Application not starting**:
   - Check logs: `pm2 logs financeapp` or `docker-compose logs`
   - Verify environment variables
   - Check database connection

2. **Database connection issues**:
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`
   - Check database credentials
   - Ensure database exists

3. **Nginx configuration errors**:
   - Test configuration: `sudo nginx -t`
   - Check logs: `sudo tail -f /var/log/nginx/error.log`

4. **SSL certificate issues**:
   - Renew certificate: `sudo certbot renew --force-renewal`
   - Check Certbot logs: `sudo tail -f /var/log/letsencrypt/letsencrypt.log`

### 12.2 Support Resources

- GitHub Issues: https://github.com/binti59/FinanceManager/issues
- Documentation: https://github.com/binti59/FinanceManager/docs

## 13. Uninstallation

If you need to remove the application:

```bash
# Using the uninstallation script
cd /var/www/financeapp
chmod +x scripts/uninstall.sh
./scripts/uninstall.sh

# Manual uninstallation (direct deployment)
pm2 delete financeapp
sudo rm /etc/nginx/sites-enabled/financeapp
sudo rm /etc/nginx/sites-available/financeapp
sudo systemctl restart nginx
sudo -u postgres dropdb financeapp
sudo -u postgres dropuser financeapp
rm -rf /var/www/financeapp

# Manual uninstallation (containerized deployment)
cd /var/www/financeapp
docker-compose down -v
sudo rm /etc/nginx/sites-enabled/financeapp
sudo rm /etc/nginx/sites-available/financeapp
sudo systemctl restart nginx
rm -rf /var/www/financeapp
```

## 14. Conclusion

This deployment guide provides comprehensive instructions for deploying, configuring, and maintaining the Personal Finance Manager application. Follow these steps to ensure a successful deployment and smooth operation of the application in a production environment.

For any questions or issues, please refer to the troubleshooting section or contact the development team through the GitHub repository.
