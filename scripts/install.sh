#!/bin/bash

# Personal Finance Management System - Installation Script
# This script automates the deployment of the Personal Finance Management System
# to a Contabo VPS server.

# Exit on error
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="/tmp/finance-app-install.log"

# Function to log messages
log() {
    local message="$1"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    echo -e "${timestamp} - ${message}" | tee -a "$LOG_FILE"
}

# Function to log success messages
log_success() {
    log "${GREEN}SUCCESS: $1${NC}"
}

# Function to log info messages
log_info() {
    log "${BLUE}INFO: $1${NC}"
}

# Function to log warning messages
log_warning() {
    log "${YELLOW}WARNING: $1${NC}"
}

# Function to log error messages
log_error() {
    log "${RED}ERROR: $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a package is installed
package_installed() {
    dpkg -l "$1" | grep -q ^ii
}

# Function to check if a service is running
service_running() {
    systemctl is-active --quiet "$1"
}

# Function to prompt for confirmation
confirm() {
    local prompt="$1"
    local default="$2"
    
    if [ "$default" = "Y" ]; then
        local options="[Y/n]"
    else
        local options="[y/N]"
    fi
    
    read -p "$prompt $options " response
    
    if [ -z "$response" ]; then
        response="$default"
    fi
    
    case "$response" in
        [yY][eE][sS]|[yY]) 
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Function to display script banner
display_banner() {
    echo -e "${BLUE}"
    echo "============================================================"
    echo "  Personal Finance Management System - Installation Script  "
    echo "============================================================"
    echo -e "${NC}"
    echo "This script will install and configure the Personal Finance"
    echo "Management System on your Contabo VPS server."
    echo ""
    echo "The installation includes:"
    echo "  - System updates and required packages"
    echo "  - Node.js, PostgreSQL, Nginx, and PM2"
    echo "  - Database setup and configuration"
    echo "  - Application deployment from GitHub"
    echo "  - Nginx configuration and SSL setup"
    echo "  - Backup and monitoring setup"
    echo ""
    echo "Log file: $LOG_FILE"
    echo ""
}

# Function to check system requirements
check_requirements() {
    log_info "Checking system requirements..."
    
    # Check if running as root
    if [ "$(id -u)" -ne 0 ]; then
        log_error "This script must be run as root"
        exit 1
    fi
    
    # Check if running on a supported OS
    if [ ! -f /etc/os-release ]; then
        log_error "Unsupported operating system"
        exit 1
    fi
    
    source /etc/os-release
    if [ "$ID" != "ubuntu" ] && [ "$ID" != "debian" ]; then
        log_error "This script is designed for Ubuntu/Debian systems"
        exit 1
    fi
    
    # Check minimum system resources
    local cpu_cores=$(nproc)
    local total_memory=$(free -m | awk '/^Mem:/{print $2}')
    local free_disk=$(df -m / | awk 'NR==2 {print $4}')
    
    log_info "CPU Cores: $cpu_cores"
    log_info "Total Memory: $total_memory MB"
    log_info "Free Disk Space: $free_disk MB"
    
    if [ "$cpu_cores" -lt 2 ]; then
        log_warning "Recommended minimum: 2 CPU cores"
    fi
    
    if [ "$total_memory" -lt 4000 ]; then
        log_warning "Recommended minimum: 4GB RAM"
    fi
    
    if [ "$free_disk" -lt 10000 ]; then
        log_warning "Recommended minimum: 10GB free disk space"
    fi
    
    log_success "System requirements check completed"
}

# Function to collect configuration information
collect_config() {
    log_info "Collecting configuration information..."
    
    # Database configuration
    read -p "PostgreSQL database name [finance_app]: " DB_NAME
    DB_NAME=${DB_NAME:-finance_app}
    
    read -p "PostgreSQL username [finance_user]: " DB_USER
    DB_USER=${DB_USER:-finance_user}
    
    read -p "PostgreSQL password [auto-generate]: " DB_PASSWORD
    if [ -z "$DB_PASSWORD" ]; then
        DB_PASSWORD=$(openssl rand -base64 12)
        log_info "Generated database password: $DB_PASSWORD"
    fi
    
    # Domain configuration
    read -p "Domain name (leave empty for IP-based access): " DOMAIN_NAME
    
    if [ -n "$DOMAIN_NAME" ]; then
        read -p "Enable HTTPS with Let's Encrypt? [Y/n]: " ENABLE_HTTPS
        ENABLE_HTTPS=${ENABLE_HTTPS:-Y}
        
        if [[ "$ENABLE_HTTPS" =~ ^[Yy]$ ]]; then
            read -p "Email address for Let's Encrypt notifications: " EMAIL_ADDRESS
            if [ -z "$EMAIL_ADDRESS" ]; then
                log_warning "Email address is required for Let's Encrypt"
                read -p "Email address for Let's Encrypt notifications: " EMAIL_ADDRESS
            fi
        fi
    else
        ENABLE_HTTPS="N"
        log_info "Using IP-based access, HTTPS will not be enabled"
    fi
    
    # GitHub configuration
    read -p "GitHub repository URL [https://github.com/binti59/FinanceManager.git]: " REPO_URL
    REPO_URL=${REPO_URL:-https://github.com/binti59/FinanceManager.git}
    
    read -p "GitHub username [binti59]: " GITHUB_USER
    GITHUB_USER=${GITHUB_USER:-binti59}
    
    read -p "GitHub token: " GITHUB_TOKEN
    if [ -z "$GITHUB_TOKEN" ]; then
        log_warning "GitHub token is required for private repositories"
        read -p "GitHub token: " GITHUB_TOKEN
    fi
    
    # Application configuration
    read -p "Application port [5000]: " APP_PORT
    APP_PORT=${APP_PORT:-5000}
    
    # JWT secrets
    JWT_SECRET=$(openssl rand -base64 32)
    JWT_REFRESH_SECRET=$(openssl rand -base64 32)
    
    log_success "Configuration information collected"
}

# Function to update system packages
update_system() {
    log_info "Updating system packages..."
    
    apt update
    apt upgrade -y
    
    log_success "System packages updated"
}

# Function to install required packages
install_packages() {
    log_info "Installing required packages..."
    
    apt install -y curl wget git unzip zip htop ufw fail2ban
    
    log_success "Required packages installed"
}

# Function to set timezone
set_timezone() {
    log_info "Setting timezone to UTC..."
    
    timedatectl set-timezone UTC
    
    log_success "Timezone set to UTC"
}

# Function to configure firewall
configure_firewall() {
    log_info "Configuring firewall..."
    
    if ! command_exists ufw; then
        apt install -y ufw
    fi
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow application ports
    ufw allow 5000/tcp
    ufw allow 4000/tcp
    
    # Enable firewall if not already enabled
    if ! ufw status | grep -q "Status: active"; then
        echo "y" | ufw enable
    fi
    
    log_success "Firewall configured"
}

# Function to install Node.js
install_nodejs() {
    log_info "Installing Node.js..."
    
    if command_exists node && node -v | grep -q "v18"; then
        log_info "Node.js 18.x is already installed"
    else
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
    fi
    
    log_info "Node.js version: $(node -v)"
    log_info "npm version: $(npm -v)"
    
    log_success "Node.js installed"
}

# Function to install PostgreSQL
install_postgresql() {
    log_info "Installing PostgreSQL..."
    
    if package_installed postgresql; then
        log_info "PostgreSQL is already installed"
    else
        apt install -y postgresql postgresql-contrib
    fi
    
    # Start and enable PostgreSQL service
    systemctl start postgresql
    systemctl enable postgresql
    
    if service_running postgresql; then
        log_success "PostgreSQL installed and running"
    else
        log_error "Failed to start PostgreSQL service"
        exit 1
    fi
}

# Function to install Nginx
install_nginx() {
    log_info "Installing Nginx..."
    
    if package_installed nginx; then
        log_info "Nginx is already installed"
    else
        apt install -y nginx
    fi
    
    # Start and enable Nginx service
    systemctl start nginx
    systemctl enable nginx
    
    if service_running nginx; then
        log_success "Nginx installed and running"
    else
        log_error "Failed to start Nginx service"
        exit 1
    fi
}

# Function to install PM2
install_pm2() {
    log_info "Installing PM2..."
    
    if command_exists pm2; then
        log_info "PM2 is already installed"
    else
        npm install -g pm2
    fi
    
    log_info "PM2 version: $(pm2 --version)"
    
    log_success "PM2 installed"
}

# Function to configure PostgreSQL
configure_postgresql() {
    log_info "Configuring PostgreSQL..."
    
    # Set PostgreSQL password
    sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '$DB_PASSWORD';"
    
    # Create database and user
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        log_info "Database $DB_NAME already exists"
    else
        sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
        log_info "Database $DB_NAME created"
    fi
    
    if sudo -u postgres psql -c "\du" | grep -qw $DB_USER; then
        log_info "User $DB_USER already exists"
    else
        sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';"
        log_info "User $DB_USER created"
    fi
    
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    log_info "Privileges granted to $DB_USER on $DB_NAME"
    
    log_success "PostgreSQL configured"
}

# Function to clone repository
clone_repository() {
    log_info "Cloning repository..."
    
    # Create application directory
    mkdir -p /var/www/finance-app
    
    # Clone repository
    if [ -d "/var/www/finance-app/.git" ]; then
        log_info "Repository already cloned, pulling latest changes"
        cd /var/www/finance-app
        git pull
    else
        if [ -n "$GITHUB_TOKEN" ]; then
            git clone https://$GITHUB_USER:$GITHUB_TOKEN@github.com/${REPO_URL#https://github.com/} /var/www/finance-app
        else
            git clone $REPO_URL /var/www/finance-app
        fi
    fi
    
    log_success "Repository cloned to /var/www/finance-app"
}

# Function to setup backend
setup_backend() {
    log_info "Setting up backend..."
    
    # Navigate to backend directory
    cd /var/www/finance-app/backend
    
    # Install dependencies
    npm install
    
    # Create .env file
    cat > .env << EOF
# Application
NODE_ENV=production
PORT=$APP_PORT
API_URL=${DOMAIN_NAME:+https://$DOMAIN_NAME/api}${DOMAIN_NAME:+http://$DOMAIN_NAME/api}
CLIENT_URL=${DOMAIN_NAME:+https://$DOMAIN_NAME}${DOMAIN_NAME:+http://$DOMAIN_NAME}

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Authentication
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=${DOMAIN_NAME:+https://$DOMAIN_NAME}${DOMAIN_NAME:+http://$DOMAIN_NAME}

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/finance-app/app.log
EOF
    
    # Create log directory
    mkdir -p /var/log/finance-app
    
    # Create database config file
    mkdir -p ./config
    cat > ./config/config.json << EOF
{
  "development": {
    "username": "$DB_USER",
    "password": "$DB_PASSWORD",
    "database": "$DB_NAME",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "test": {
    "username": "$DB_USER",
    "password": "$DB_PASSWORD",
    "database": "${DB_NAME}_test",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "username": "$DB_USER",
    "password": "$DB_PASSWORD",
    "database": "$DB_NAME",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "logging": false,
    "pool": {
      "max": 5,
      "min": 0,
      "acquire": 30000,
      "idle": 10000
    }
  }
}
EOF
    
    # Run database migrations
    if [ -f "./node_modules/.bin/sequelize-cli" ]; then
        npx sequelize-cli db:migrate
        
        # Seed initial data if available
        if [ -d "./seeders" ]; then
            npx sequelize-cli db:seed:all
        fi
    fi
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: "finance-app-api",
      script: "./src/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: $APP_PORT
      },
      watch: false,
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/var/log/finance-app/error.log",
      out_file: "/var/log/finance-app/out.log",
      merge_logs: true
    }
  ]
};
EOF
    
    # Start backend with PM2
    pm2 start ecosystem.config.js
    
    # Save PM2 process list
    pm2 save
    
    # Configure PM2 to start on boot
    pm2 startup
    
    log_success "Backend setup completed"
}

# Function to setup frontend
setup_frontend() {
    log_info "Setting up frontend..."
    
    # Navigate to frontend directory
    cd /var/www/finance-app/frontend
    
    # Install dependencies
    npm install
    
    # Create .env file
    cat > .env << EOF
REACT_APP_API_URL=${DOMAIN_NAME:+https://$DOMAIN_NAME/api}${DOMAIN_NAME:+http://$DOMAIN_NAME/api}
REACT_APP_ENV=production
EOF
    
    # Build frontend
    npm run build
    
    log_success "Frontend setup completed"
}

# Function to configure Nginx
configure_nginx() {
    log_info "Configuring Nginx..."
    
    # Create Nginx configuration file
    if [ -f "/var/www/finance-app/nginx/finance-app.conf" ]; then
        log_info "Using Nginx configuration from repository..."
        cp /var/www/finance-app/nginx/finance-app.conf /etc/nginx/sites-available/finance-app
    else
        log_info "Creating Nginx configuration..."
        cat > /etc/nginx/sites-available/finance-app << EOF
server {
    listen 80;
    ${DOMAIN_NAME:+server_name $DOMAIN_NAME www.$DOMAIN_NAME;}
    
    # Frontend static files
    root /var/www/finance-app/frontend/build;
    index index.html;
    
    # Frontend routes - ensure all tabs work with client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:$APP_PORT/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Gzip compression
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types
        application/javascript
        application/json
        application/x-javascript
        application/xml
        application/xml+rss
        text/css
        text/javascript
        text/plain
        text/xml;
}
EOF
    fi
    
    # Enable Nginx configuration
    log_info "Enabling Nginx site configuration..."
    if [ -L /etc/nginx/sites-enabled/finance-app ]; then
        rm /etc/nginx/sites-enabled/finance-app
    fi
    ln -sf /etc/nginx/sites-available/finance-app /etc/nginx/sites-enabled/
    
    # Test Nginx configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
    
    log_success "Nginx configured"
}

# Function to setup SSL with Let's Encrypt
setup_ssl() {
    if [ "$ENABLE_HTTPS" = "Y" ] && [ -n "$DOMAIN_NAME" ]; then
        log_info "Setting up SSL with Let's Encrypt..."
        
        # Install Certbot
        apt install -y certbot python3-certbot-nginx
        
        # Obtain SSL certificate
        certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos --email $EMAIL_ADDRESS
        
        # Verify auto-renewal
        certbot renew --dry-run
        
        log_success "SSL setup completed"
    else
        log_info "Skipping SSL setup"
    fi
}

# Function to setup backup scripts
setup_backup() {
    log_info "Setting up backup scripts..."
    
    # Create backup directory
    mkdir -p /var/backups/finance-app
    
    # Create database backup script
    cat > /usr/local/bin/backup-finance-db.sh << EOF
#!/bin/bash

# Configuration
DB_NAME="$DB_NAME"
DB_USER="$DB_USER"
BACKUP_DIR="/var/backups/finance-app"
TIMESTAMP=\$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="\$BACKUP_DIR/finance_app_\$TIMESTAMP.sql"
LOG_FILE="/var/log/finance-app/backup.log"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p \$BACKUP_DIR

# Log start
echo "\$(date): Starting database backup" >> \$LOG_FILE

# Perform backup
PGPASSWORD="$DB_PASSWORD" pg_dump -U \$DB_USER \$DB_NAME > \$BACKUP_FILE

# Check if backup was successful
if [ \$? -eq 0 ]; then
  # Compress backup
  gzip \$BACKUP_FILE
  echo "\$(date): Backup completed successfully and compressed to \$BACKUP_FILE.gz" >> \$LOG_FILE
  
  # Remove old backups
  find \$BACKUP_DIR -name "finance_app_*.sql.gz" -type f -mtime +\$RETENTION_DAYS -delete
  echo "\$(date): Removed backups older than \$RETENTION_DAYS days" >> \$LOG_FILE
else
  echo "\$(date): Backup failed" >> \$LOG_FILE
  exit 1
fi
EOF
    
    # Make backup script executable
    chmod +x /usr/local/bin/backup-finance-db.sh
    
    # Create application backup script
    cat > /usr/local/bin/backup-finance-app.sh << EOF
#!/bin/bash

# Configuration
APP_DIR="/var/www/finance-app"
BACKUP_DIR="/var/backups/finance-app"
TIMESTAMP=\$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="\$BACKUP_DIR/finance_app_files_\$TIMESTAMP.tar.gz"
LOG_FILE="/var/log/finance-app/backup.log"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p \$BACKUP_DIR

# Log start
echo "\$(date): Starting application backup" >> \$LOG_FILE

# Perform backup
tar -czf \$BACKUP_FILE -C \$(dirname \$APP_DIR) \$(basename \$APP_DIR)

# Check if backup was successful
if [ \$? -eq 0 ]; then
  echo "\$(date): Application backup completed successfully to \$BACKUP_FILE" >> \$LOG_FILE
  
  # Remove old backups
  find \$BACKUP_DIR -name "finance_app_files_*.tar.gz" -type f -mtime +\$RETENTION_DAYS -delete
  echo "\$(date): Removed backups older than \$RETENTION_DAYS days" >> \$LOG_FILE
else
  echo "\$(date): Application backup failed" >> \$LOG_FILE
  exit 1
fi
EOF
    
    # Make backup script executable
    chmod +x /usr/local/bin/backup-finance-app.sh
    
    # Setup cron jobs for backups
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-finance-db.sh") | crontab -
    (crontab -l 2>/dev/null; echo "0 3 * * 0 /usr/local/bin/backup-finance-app.sh") | crontab -
    
    log_success "Backup scripts setup completed"
}

# Function to display installation summary
display_summary() {
    echo -e "${GREEN}"
    echo "============================================================"
    echo "  Personal Finance Management System - Installation Summary  "
    echo "============================================================"
    echo -e "${NC}"
    echo "Installation completed successfully!"
    echo ""
    echo "Application URL:"
    if [ -n "$DOMAIN_NAME" ]; then
        if [ "$ENABLE_HTTPS" = "Y" ]; then
            echo "  https://$DOMAIN_NAME"
        else
            echo "  http://$DOMAIN_NAME"
        fi
    else
        echo "  http://$(hostname -I | awk '{print $1}')"
    fi
    echo ""
    echo "API URL:"
    if [ -n "$DOMAIN_NAME" ]; then
        if [ "$ENABLE_HTTPS" = "Y" ]; then
            echo "  https://$DOMAIN_NAME/api"
        else
            echo "  http://$DOMAIN_NAME/api"
        fi
    else
        echo "  http://$(hostname -I | awk '{print $1}')/api"
    fi
    echo ""
    echo "Database Information:"
    echo "  Name: $DB_NAME"
    echo "  User: $DB_USER"
    echo "  Password: $DB_PASSWORD"
    echo ""
    echo "Installation Log:"
    echo "  $LOG_FILE"
    echo ""
    echo "Backup Scripts:"
    echo "  Database: /usr/local/bin/backup-finance-db.sh"
    echo "  Application: /usr/local/bin/backup-finance-app.sh"
    echo ""
    echo "Thank you for installing the Personal Finance Management System!"
    echo "============================================================"
}

# Main installation function
main() {
    # Initialize log file
    > "$LOG_FILE"
    
    # Display banner
    display_banner
    
    # Check system requirements
    check_requirements
    
    # Collect configuration information
    collect_config
    
    # Update system packages
    update_system
    
    # Install required packages
    install_packages
    
    # Set timezone
    set_timezone
    
    # Configure firewall
    configure_firewall
    
    # Install Node.js
    install_nodejs
    
    # Install PostgreSQL
    install_postgresql
    
    # Install Nginx
    install_nginx
    
    # Install PM2
    install_pm2
    
    # Configure PostgreSQL
    configure_postgresql
    
    # Clone repository
    clone_repository
    
    # Setup backend
    setup_backend
    
    # Setup frontend
    setup_frontend
    
    # Configure Nginx
    configure_nginx
    
    # Setup SSL with Let's Encrypt
    setup_ssl
    
    # Setup backup scripts
    setup_backup
    
    # Display installation summary
    display_summary
}

# Run main installation function
main
