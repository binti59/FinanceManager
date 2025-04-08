#!/bin/bash
# Personal Finance Management System - Update Script
# This script updates an existing installation of the Personal Finance Management System

# Exit on error
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="/tmp/finance-app-update.log"

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
    echo "  Personal Finance Management System - Update Script        "
    echo "============================================================"
    echo -e "${NC}"
    echo "This script will update your existing installation of the"
    echo "Personal Finance Management System."
    echo ""
    echo "The update includes:"
    echo "  - Backing up current installation"
    echo "  - Pulling latest changes from repository"
    echo "  - Updating dependencies"
    echo "  - Applying database migrations"
    echo "  - Restarting services"
    echo ""
    echo "Log file: $LOG_FILE"
    echo ""
}

# Function to check if application is installed
check_installation() {
    log_info "Checking existing installation..."
    
    # Check if application directory exists
    if [ ! -d "/var/www/finance-app" ]; then
        log_error "Application is not installed. Please run install.sh first."
        exit 1
    fi
    
    # Check if backend directory exists
    if [ ! -d "/var/www/finance-app/backend" ]; then
        log_error "Backend directory not found. Installation may be corrupted."
        exit 1
    fi
    
    # Check if PM2 is running the application
    if ! pm2 list | grep -q "finance-app-backend"; then
        log_warning "Application is not running in PM2."
    fi
    
    log_success "Installation check completed"
}

# Function to backup current installation
backup_installation() {
    log_info "Backing up current installation..."
    
    # Create backup directory
    local backup_dir="/var/www/finance-app_backup_$(date +%Y%m%d%H%M%S)"
    
    # Copy files to backup directory
    cp -r /var/www/finance-app "$backup_dir"
    
    # Backup database
    local db_backup_file="$backup_dir/database_backup.sql"
    sudo -u postgres pg_dump finance_app > "$db_backup_file"
    
    log_success "Installation backed up to $backup_dir"
}

# Function to update application files
update_files() {
    log_info "Updating application files..."
    
    # Stop application
    log_info "Stopping application..."
    pm2 stop finance-app-backend
    
    # Update backend files
    log_info "Updating backend files..."
    cp -r ./backend/* /var/www/finance-app/backend/
    
    # Update frontend files
    log_info "Updating frontend files..."
    cp -r ./frontend/* /var/www/finance-app/frontend/
    
    # Update nginx files
    log_info "Updating nginx files..."
    cp -r ./nginx/* /var/www/finance-app/nginx/
    
    # Update scripts
    log_info "Updating scripts..."
    cp -r ./scripts/* /var/www/finance-app/scripts/
    
    log_success "Application files updated"
}

# Function to update dependencies
update_dependencies() {
    log_info "Updating dependencies..."
    
    # Update backend dependencies
    log_info "Updating backend dependencies..."
    cd /var/www/finance-app/backend
    npm install
    
    log_success "Dependencies updated"
}

# Function to apply database migrations
apply_migrations() {
    log_info "Applying database migrations..."
    
    # Run migrations
    cd /var/www/finance-app/backend
    npx sequelize-cli db:migrate
    
    log_success "Database migrations applied"
}

# Function to restart services
restart_services() {
    log_info "Restarting services..."
    
    # Restart application
    cd /var/www/finance-app/backend
    pm2 restart finance-app-backend
    pm2 save
    
    # Reload Nginx
    systemctl reload nginx
    
    log_success "Services restarted"
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
    
    # Confirm update
    if ! confirm "Do you want to update the Personal Finance Management System?" "Y"; then
        log_info "Update cancelled"
        exit 0
    fi
    
    # Check if application is installed
    check_installation
    
    # Backup current installation
    if confirm "Do you want to backup the current installation?" "Y"; then
        backup_installation
    else
        log_info "Backup skipped"
    fi
    
    # Update application files
    update_files
    
    # Update dependencies
    update_dependencies
    
    # Apply database migrations
    apply_migrations
    
    # Restart services
    restart_services
    
    # Perform final checks
    final_checks
    
    log_success "Update completed successfully"
    echo ""
    echo "You can access the application at: https://finance.bikramjitchowdhury.com"
    echo ""
}

# Run main function
main
