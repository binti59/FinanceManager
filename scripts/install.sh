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
# Function to update system packages
update_system() {
    log_info "Updating system packages..."
    
    apt update -y
    apt upgrade -y
    
    log_success "System packages updated"
}
# Function to install required packages
install_packages() {
    log_info "Installing required packages..."
    
    # Install basic packages
    apt install -y curl wget git unzip zip build-essential python3 python3-pip
    
    # Install Nginx
    if ! package_installed "nginx"; then
        log_info "Installing Nginx..."
        apt install -y nginx
        systemctl enable nginx
        systemctl start nginx
        log_success "Nginx installed"
    else
        log_info "Nginx is already installed"
    fi
    
    # Install PostgreSQL
    if ! package_installed "postgresql"; then
        log_info "Installing PostgreSQL..."
        apt install -y postgresql postgresql-contrib
        systemctl enable postgresql
        systemctl start postgresql
        log_success "PostgreSQL installed"
    else
        log_info "PostgreSQL is already installed"
    fi
    
    # Install Node.js
    if ! command_exists "node"; then
        log_info "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
        log_success "Node.js installed"
    else
        local node_version=$(node -v)
        log_info "Node.js is already installed (${node_version})"
    fi
    
    # Install PM2
    if ! command_exists "pm2"; then
        log_info "Installing PM2..."
        npm install -g pm2
        log_success "PM2 installed"
    else
        log_info "PM2 is already installed"
    fi
    
    # Install Certbot for SSL
    if ! command_exists "certbot"; then
        log_info "Installing Certbot..."
        apt install -y certbot python3-certbot-nginx
        log_success "Certbot installed"
    else
        log_info "Certbot is already installed"
    fi
    
    log_success "All required packages installed"
}
# Function to set up the database
setup_database() {
    log_info "Setting up database..."
    
    # Create log directory for database setup
    mkdir -p /var/log/finance-app
    chmod 755 /var/log/finance-app
    
    # Run the database setup script
    chmod +x ./scripts/setup_database.sh
    ./scripts/setup_database.sh
    
    log_success "Database setup completed"
}
# Function to deploy the application
deploy_application() {
    log_info "Deploying application..."
    
    # Set application directory
    local app_dir="/var/www/finance-app"
    
    # Check if application directory exists
    if [ -d "$app_dir" ]; then
        log_info "Application directory already exists, backing up..."
        local backup_dir="${app_dir}_backup_$(date +%Y%m%d%H%M%S)"
        mv "$app_dir" "$backup_dir"
        log_info "Backed up to $backup_dir"
    fi
    
    # Create application directory
    mkdir -p "$app_dir"
    
    # Copy application files
    log_info "Copying application files..."
    cp -r ./backend "$app_dir/"
    cp -r ./frontend "$app_dir/"
    cp -r ./nginx "$app_dir/"
    cp -r ./scripts "$app_dir/"
    
    # Create log directories
    mkdir -p /var/log/finance-app
    chmod 755 /var/log/finance-app
    
    mkdir -p /home/ubuntu/logs/finance-app
    chmod 755 /home/ubuntu/logs/finance-app
    
    # Set up environment variables
    log_info "Setting up environment variables..."
    
    # Generate secure JWT secrets
    local jwt_secret=$(openssl rand -hex 32)
    local jwt_refresh_secret=$(openssl rand -hex 32)
    
    # Create .env file from template
    cp "$app_dir/backend/.env.example" "$app_dir/backend/.env"
    
    # Update .env file with secure values
    sed -i "s/your_jwt_secret_here/$jwt_secret/g" "$app_dir/backend/.env"
    sed -i "s/your_jwt_refresh_secret_here/$jwt_refresh_secret/g" "$app_dir/backend/.env"
    sed -i "s/your_password_here/dvp3YoSKQ1E3\/2EX/g" "$app_dir/backend/.env"
    
    # Install backend dependencies
    log_info "Installing backend dependencies..."
    cd "$app_dir/backend"
    npm install
    
    # Initialize database schema
    log_info "Initializing database schema..."
    npx sequelize-cli db:migrate
    
    # Set up PM2
    log_info "Setting up PM2..."
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    log_success "Application deployed successfully"
}
# Function to configure Nginx
configure_nginx() {
    log_info "Configuring Nginx..."
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/finance-app << 'EOF'
server {
    listen 80;
    server_name finance.bikramjitchowdhury.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
    
    # Enable the site
    ln -sf /etc/nginx/sites-available/finance-app /etc/nginx/sites-enabled/
    
    # Test Nginx configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
    
    log_success "Nginx configured successfully"
}
# Function to set up SSL
setup_ssl() {
    log_info "Setting up SSL..."
    
    # Prompt for email address
    read -p "Enter email address for Let's Encrypt notifications: " email_address
    
    # Obtain SSL certificate
    certbot --nginx -d finance.bikramjitchowdhury.com --non-interactive --agree-tos -m "$email_address"
    
    log_success "SSL set up successfully"
}
# Function to configure firewall
configure_firewall() {
    log_info "Configuring firewall..."
    
    # Check if UFW is installed
    if ! command_exists "ufw"; then
        log_info "Installing UFW..."
        apt install -y ufw
    fi
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow application port
    ufw allow 5000/tcp
    
    # Enable firewall if not already enabled
    if ! ufw status | grep -q "Status: active"; then
        log_info "Enabling firewall..."
        echo "y" | ufw enable
    fi
    
    log_success "Firewall configured successfully"
}
# Function to set up monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Install monitoring tools
    apt install -y htop iotop
    
    # Set up log rotation
    cat > /etc/logrotate.d/finance-app << 'EOF'
/var/log/finance-app/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload nginx
    endscript
}
EOF
    
    log_success "Monitoring set up successfully"
}
# Function to perform final checks
final_checks() {
    log_info "Performing final checks..."
    
    # Check if Nginx is running
    if service_running "nginx"; then
        log_success "Nginx is running"
    else
        log_error "Nginx is not running"
        systemctl start nginx
    fi
    
    # Check if PostgreSQL is running
    if service_running "postgresql"; then
        log_success "PostgreSQL is running"
    else
        log_error "PostgreSQL is not running"
        systemctl start postgresql
    fi
    
    # Check if application is running
    if pm2 list | grep -q "finance-app-backend"; then
        log_success "Application is running"
    else
        log_error "Application is not running"
        cd /var/www/finance-app/backend
        pm2 start ecosystem.config.js
        pm2 save
    fi
    
    # Check if application is accessible
    if curl -s http://localhost:5000/api/health | grep -q "status.*ok"; then
        log_success "Application is accessible"
    else
        log_warning "Application is not accessible"
    fi
    
    log_success "Final checks completed"
}
# Main function
main() {
    # Clear log file
    > "$LOG_FILE"
    
    # Display banner
    display_banner
    
    # Confirm installation
    if ! confirm "Do you want to install the Personal Finance Management System?" "Y"; then
        log_info "Installation cancelled"
        exit 0
    fi
    
    # Check requirements
    check_requirements
    
    # Update system
    update_system
    
    # Install packages
    install_packages
    
    # Set up database
    setup_database
    
    # Deploy application
    deploy_application
    
    # Configure Nginx
    configure_nginx
    
    # Set up SSL
    if confirm "Do you want to set up SSL with Let's Encrypt?" "Y"; then
        setup_ssl
    else
        log_info "SSL setup skipped"
    fi
    
    # Configure firewall
    if confirm "Do you want to configure the firewall?" "Y"; then
        configure_firewall
    else
        log_info "Firewall configuration skipped"
    fi
    
    # Set up monitoring
    if confirm "Do you want to set up monitoring?" "Y"; then
        setup_monitoring
    else
        log_info "Monitoring setup skipped"
    fi
    
    # Perform final checks
    final_checks
    
    log_success "Installation completed successfully"
    echo ""
    echo "You can access the application at: https://finance.bikramjitchowdhury.com"
    echo ""
}
# Run main function
main
