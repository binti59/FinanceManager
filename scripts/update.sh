#!/bin/bash

# Update Script for Personal Finance App
# This script updates the application from GitHub and implements changes

# Log file
LOG_FILE="/var/log/finance-app-update.log"
APP_DIR="/var/www/finance-app"
BACKUP_DIR="/var/backups/finance-app"
CONFIG_DIR="$APP_DIR/backend/config"
DB_CONFIG="$CONFIG_DIR/config.json"
ENV_FILE="$APP_DIR/backend/.env"
FRONTEND_ENV="$APP_DIR/frontend/.env"
GITHUB_REPO="https://github.com/binti59/FinanceManager.git"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Function to log messages
log_message() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Function to check if a command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        log_message "SUCCESS: $1"
    else
        log_message "ERROR: $1"
        log_message "Update failed. Please check the log file for details."
        exit 1
    fi
}

# Create necessary directories if they don't exist
create_directories() {
    log_message "INFO: Creating necessary directories..."
    
    # Create app directory if it doesn't exist
    if [ ! -d "$APP_DIR" ]; then
        mkdir -p "$APP_DIR"
        check_status "Created application directory"
    fi
    
    # Create backup directory if it doesn't exist
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        check_status "Created backup directory"
    fi
    
    # Create config directory if it doesn't exist
    if [ ! -d "$CONFIG_DIR" ]; then
        mkdir -p "$CONFIG_DIR"
        check_status "Created config directory"
    fi
    
    # Create scripts directory if it doesn't exist
    if [ ! -d "$APP_DIR/scripts" ]; then
        mkdir -p "$APP_DIR/scripts"
        check_status "Created scripts directory"
    fi
}

# Backup current application
backup_application() {
    log_message "INFO: Backing up current application..."
    
    if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR)" ]; then
        tar -czf "$BACKUP_DIR/finance-app-backup-$TIMESTAMP.tar.gz" -C "$(dirname $APP_DIR)" "$(basename $APP_DIR)"
        check_status "Application backup created at $BACKUP_DIR/finance-app-backup-$TIMESTAMP.tar.gz"
    else
        log_message "INFO: No existing application to backup"
    fi
}

# Save current configuration
save_configuration() {
    log_message "INFO: Saving current configuration..."
    
    # Save database configuration if it exists
    if [ -f "$DB_CONFIG" ]; then
        cp "$DB_CONFIG" "$BACKUP_DIR/config.json.bak"
        check_status "Database configuration saved"
    fi
    
    # Save backend environment file if it exists
    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "$BACKUP_DIR/.env.backend.bak"
        check_status "Backend environment file saved"
    fi
    
    # Save frontend environment file if it exists
    if [ -f "$FRONTEND_ENV" ]; then
        cp "$FRONTEND_ENV" "$BACKUP_DIR/.env.frontend.bak"
        check_status "Frontend environment file saved"
    fi
    
    # Save Nginx configuration if it exists
    if [ -f "/etc/nginx/sites-available/finance-app" ]; then
        cp "/etc/nginx/sites-available/finance-app" "$BACKUP_DIR/finance-app.nginx.bak"
        check_status "Nginx configuration saved"
    fi
}

# Update application from GitHub
update_from_github() {
    log_message "INFO: Updating application from GitHub..."
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        log_message "INFO: Git not found. Installing git..."
        apt-get update && apt-get install -y git
        check_status "Git installation"
    fi
    
    # If app directory is empty or doesn't contain a git repository, clone the repo
    if [ ! -d "$APP_DIR/.git" ]; then
        log_message "INFO: No git repository found. Cloning from GitHub..."
        rm -rf "$APP_DIR"
        git clone "$GITHUB_REPO" "$APP_DIR"
        check_status "Repository cloning"
    else
        # If it's a git repository, pull the latest changes
        log_message "INFO: Updating existing repository..."
        cd "$APP_DIR"
        git fetch origin
        git reset --hard origin/main
        check_status "Repository update"
    fi
}

# Restore configuration
restore_configuration() {
    log_message "INFO: Restoring configuration..."
    
    # Create default config.json if it doesn't exist
    if [ ! -f "$DB_CONFIG" ]; then
        log_message "INFO: Creating default database configuration..."
        mkdir -p "$CONFIG_DIR"
        cat > "$DB_CONFIG" << 'EOF'
{
  "development": {
    "username": "finance_user",
    "password": "dtP5+x/lehFhyoOi",
    "database": "finance_app",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "test": {
    "username": "finance_user",
    "password": "dtP5+x/lehFhyoOi",
    "database": "finance_app_test",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "username": "finance_user",
    "password": "dtP5+x/lehFhyoOi",
    "database": "finance_app",
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
        check_status "Default database configuration created"
    elif [ -f "$BACKUP_DIR/config.json.bak" ]; then
        # Restore from backup if it exists
        cp "$BACKUP_DIR/config.json.bak" "$DB_CONFIG"
        check_status "Database configuration restored from backup"
    fi
    
    # Restore backend environment file if backup exists
    if [ -f "$BACKUP_DIR/.env.backend.bak" ]; then
        cp "$BACKUP_DIR/.env.backend.bak" "$ENV_FILE"
        check_status "Backend environment file restored from backup"
    elif [ ! -f "$ENV_FILE" ]; then
        # Create default .env file if it doesn't exist
        log_message "INFO: Creating default backend environment file..."
        cat > "$ENV_FILE" << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://finance_user:dtP5+x/lehFhyoOi@localhost:5432/finance_app
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
EOF
        check_status "Default backend environment file created"
    fi
    
    # Restore frontend environment file if backup exists
    if [ -f "$BACKUP_DIR/.env.frontend.bak" ]; then
        cp "$BACKUP_DIR/.env.frontend.bak" "$FRONTEND_ENV"
        check_status "Frontend environment file restored from backup"
    elif [ ! -f "$FRONTEND_ENV" ]; then
        # Create default frontend .env file if it doesn't exist
        log_message "INFO: Creating default frontend environment file..."
        cat > "$FRONTEND_ENV" << 'EOF'
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=production
EOF
        check_status "Default frontend environment file created"
    fi
}

# Update dependencies
update_dependencies() {
    log_message "INFO: Updating dependencies..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_message "INFO: Node.js not found. Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
        check_status "Node.js installation"
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_message "INFO: npm not found. Installing npm..."
        apt-get install -y npm
        check_status "npm installation"
    fi
    
    # Update backend dependencies
    log_message "INFO: Updating backend dependencies..."
    cd "$APP_DIR/backend"
    npm install --production
    check_status "Backend dependencies update"
    
    # Update frontend dependencies
    log_message "INFO: Updating frontend dependencies..."
    cd "$APP_DIR/frontend"
    npm install --production
    check_status "Frontend dependencies update"
}

# Build frontend
build_frontend() {
    log_message "INFO: Building frontend..."
    cd "$APP_DIR/frontend"
    npm run build
    check_status "Frontend build"
}

# Update database
update_database() {
    log_message "INFO: Updating database..."
    
    # Check if PostgreSQL is installed
    if ! command -v psql &> /dev/null; then
        log_message "INFO: PostgreSQL not found. Installing PostgreSQL..."
        apt-get install -y postgresql postgresql-contrib
        check_status "PostgreSQL installation"
        
        # Start PostgreSQL service
        systemctl start postgresql
        systemctl enable postgresql
        check_status "PostgreSQL service start"
    fi
    
    # Run database migrations
    log_message "INFO: Running database migrations..."
    cd "$APP_DIR/backend"
    npx sequelize-cli db:migrate
    check_status "Database migrations"
}

# Configure Nginx
configure_nginx() {
    log_message "INFO: Configuring Nginx..."
    
    # Check if Nginx is installed
    if ! command -v nginx &> /dev/null; then
        log_message "INFO: Nginx not found. Installing Nginx..."
        apt-get install -y nginx
        check_status "Nginx installation"
    fi
    
    # Copy Nginx configuration from repository to the correct location
    if [ -f "$APP_DIR/nginx/finance-app.conf" ]; then
        log_message "INFO: Copying Nginx configuration from repository..."
        cp "$APP_DIR/nginx/finance-app.conf" /etc/nginx/sites-available/finance-app
        check_status "Nginx configuration copied"
    else
        # Create Nginx configuration if it doesn't exist in the repository
        log_message "INFO: Creating Nginx configuration..."
        cat > /etc/nginx/sites-available/finance-app << 'EOF'
server {
    listen 80;
    server_name finance.bikramjitchowdhury.com;

    location / {
        root /var/www/finance-app/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
        check_status "Nginx configuration creation"
    fi
    
    # Enable the site - CRITICAL FIX: Always create the symbolic link
    log_message "INFO: Enabling Nginx site configuration..."
    if [ -L /etc/nginx/sites-enabled/finance-app ]; then
        rm /etc/nginx/sites-enabled/finance-app
    fi
    ln -s /etc/nginx/sites-available/finance-app /etc/nginx/sites-enabled/
    check_status "Nginx site enabled"
    
    # Test Nginx configuration
    nginx -t
    check_status "Nginx configuration test"
    
    # Reload Nginx
    systemctl reload nginx
    check_status "Nginx reload"
}

# Configure firewall
configure_firewall() {
    log_message "INFO: Configuring firewall..."
    
    # Check if ufw is installed
    if ! command -v ufw &> /dev/null; then
        log_message "INFO: ufw not found. Installing ufw..."
        apt-get install -y ufw
        check_status "ufw installation"
    fi
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow http
    ufw allow https
    
    # Allow application ports
    ufw allow 5000
    ufw allow 4000
    
    # Enable firewall if not already enabled
    if [ "$(ufw status | grep -o "inactive")" == "inactive" ]; then
        echo "y" | ufw enable
    fi
    
    check_status "Firewall configuration"
}

# Restart application
restart_application() {
    log_message "INFO: Restarting application..."
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        log_message "INFO: PM2 not found. Installing PM2..."
        npm install -g pm2
        check_status "PM2 installation"
    fi
    
    # Stop existing processes
    pm2 stop all 2>/dev/null || true
    
    # Start backend
    cd "$APP_DIR/backend"
    pm2 start server.js --name "finance-app-backend"
    check_status "Backend start"
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 to start on boot
    pm2 startup
    check_status "PM2 startup configuration"
}

# Main execution
main() {
    log_message "INFO: Starting Personal Finance App update process..."
    
    # Create necessary directories
    create_directories
    
    # Backup current application
    backup_application
    
    # Save current configuration
    save_configuration
    
    # Update application from GitHub
    update_from_github
    
    # Restore configuration
    restore_configuration
    
    # Update dependencies
    update_dependencies
    
    # Build frontend
    build_frontend
    
    # Update database
    update_database
    
    # Configure Nginx
    configure_nginx
    
    # Configure firewall
    configure_firewall
    
    # Restart application
    restart_application
    
    log_message "SUCCESS: Personal Finance App update completed successfully!"
}

# Run the main function
main
