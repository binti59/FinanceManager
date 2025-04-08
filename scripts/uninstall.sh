#!/bin/bash
# Personal Finance Management System - Uninstall Script
# This script removes the Personal Finance Management System from your server

# Exit on error
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="/tmp/finance-app-uninstall.log"

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
    echo -e "${RED}"
    echo "============================================================"
    echo "  Personal Finance Management System - Uninstall Script     "
    echo "============================================================"
    echo -e "${NC}"
    echo "This script will remove the Personal Finance Management System"
    echo "from your server."
    echo ""
    echo "The uninstallation includes:"
    echo "  - Stopping and removing the application from PM2"
    echo "  - Removing application files"
    echo "  - Removing Nginx configuration"
    echo "  - Optionally removing the database"
    echo ""
    echo "Log file: $LOG_FILE"
    echo ""
}

# Function to check if application is installed
check_installation() {
    log_info "Checking existing installation..."
    
    # Check if application directory exists
    if [ ! -d "/var/www/finance-app" ]; then
        log_warning "Application directory not found. Application may not be installed."
        
        if ! confirm "Continue with uninstallation?" "N"; then
            log_info "Uninstallation cancelled"
            exit 0
        fi
    fi
    
    log_success "Installation check completed"
}

# Function to stop application services
stop_services() {
    log_info "Stopping application services..."
    
    # Stop application in PM2
    if command -v pm2 >/dev/null 2>&1; then
        if pm2 list | grep -q "finance-app-backend"; then
            log_info "Stopping application in PM2..."
            pm2 stop finance-app-backend
            pm2 delete finance-app-backend
            pm2 save
        else
            log_info "Application not found in PM2"
        fi
    else
        log_warning "PM2 not installed"
    fi
    
    log_success "Application services stopped"
}

# Function to remove application files
remove_files() {
    log_info "Removing application files..."
    
    # Check if application directory exists
    if [ -d "/var/www/finance-app" ]; then
        # Create backup before removal
        if confirm "Create backup before removing files?" "Y"; then
            local backup_dir="/var/www/finance-app_backup_before_uninstall_$(date +%Y%m%d%H%M%S)"
            log_info "Creating backup at $backup_dir..."
            cp -r /var/www/finance-app "$backup_dir"
            log_success "Backup created"
        fi
        
        # Remove application directory
        log_info "Removing application directory..."
        rm -rf /var/www/finance-app
    else
        log_warning "Application directory not found"
    fi
    
    # Remove log files
    if [ -d "/var/log/finance-app" ]; then
        log_info "Removing log files..."
        rm -rf /var/log/finance-app
    fi
    
    if [ -d "/home/ubuntu/logs/finance-app" ]; then
        log_info "Removing additional log files..."
        rm -rf /home/ubuntu/logs/finance-app
    fi
    
    log_success "Application files removed"
}

# Function to remove Nginx configuration
remove_nginx_config() {
    log_info "Removing Nginx configuration..."
    
    # Remove site configuration
    if [ -f "/etc/nginx/sites-available/finance-app" ]; then
        log_info "Removing Nginx site configuration..."
        rm -f /etc/nginx/sites-available/finance-app
    fi
    
    # Remove symbolic link
    if [ -f "/etc/nginx/sites-enabled/finance-app" ]; then
        log_info "Removing Nginx site symbolic link..."
        rm -f /etc/nginx/sites-enabled/finance-app
    fi
    
    # Reload Nginx
    if systemctl is-active --quiet nginx; then
        log_info "Reloading Nginx..."
        systemctl reload nginx
    fi
    
    log_success "Nginx configuration removed"
}

# Function to remove SSL certificates
remove_ssl_certificates() {
    log_info "Removing SSL certificates..."
    
    # Check if Certbot is installed
    if command -v certbot >/dev/null 2>&1; then
        # Remove certificates
        log_info "Removing certificates for finance.bikramjitchowdhury.com..."
        certbot delete --cert-name finance.bikramjitchowdhury.com --non-interactive
    else
        log_warning "Certbot not installed"
    fi
    
    log_success "SSL certificates removed"
}

# Function to remove database
remove_database() {
    log_info "Removing database..."
    
    # Check if PostgreSQL is installed
    if command -v psql >/dev/null 2>&1; then
        # Create backup before removal
        if confirm "Create database backup before removal?" "Y"; then
            local backup_file="/tmp/finance_app_db_backup_$(date +%Y%m%d%H%M%S).sql"
            log_info "Creating database backup at $backup_file..."
            sudo -u postgres pg_dump finance_app > "$backup_file"
            log_success "Database backup created"
        fi
        
        # Drop database
        log_info "Dropping database..."
        sudo -u postgres psql -c "DROP DATABASE IF EXISTS finance_app;"
        
        # Drop user
        log_info "Dropping database user..."
        sudo -u postgres psql -c "DROP USER IF EXISTS finance_user;"
    else
        log_warning "PostgreSQL not installed"
    fi
    
    log_success "Database removed"
}

# Function to remove firewall rules
remove_firewall_rules() {
    log_info "Removing firewall rules..."
    
    # Check if UFW is installed
    if command -v ufw >/dev/null 2>&1; then
        # Remove application port rule
        log_info "Removing port 5000 rule..."
        ufw delete allow 5000/tcp
    else
        log_warning "UFW not installed"
    fi
    
    log_success "Firewall rules removed"
}

# Function to perform final cleanup
final_cleanup() {
    log_info "Performing final cleanup..."
    
    # Remove log rotation configuration
    if [ -f "/etc/logrotate.d/finance-app" ]; then
        log_info "Removing log rotation configuration..."
        rm -f /etc/logrotate.d/finance-app
    fi
    
    log_success "Final cleanup completed"
}

# Main function
main() {
    # Clear log file
    > "$LOG_FILE"
    
    # Display banner
    display_banner
    
    # Confirm uninstallation
    if ! confirm "Are you sure you want to uninstall the Personal Finance Management System?" "N"; then
        log_info "Uninstallation cancelled"
        exit 0
    fi
    
    # Double-check confirmation for data loss
    if ! confirm "This will remove all application files and configurations. Are you absolutely sure?" "N"; then
        log_info "Uninstallation cancelled"
        exit 0
    fi
    
    # Check if application is installed
    check_installation
    
    # Stop application services
    stop_services
    
    # Remove application files
    remove_files
    
    # Remove Nginx configuration
    remove_nginx_config
    
    # Remove SSL certificates
    if confirm "Do you want to remove SSL certificates?" "N"; then
        remove_ssl_certificates
    else
        log_info "SSL certificate removal skipped"
    fi
    
    # Remove database
    if confirm "Do you want to remove the database?" "N"; then
        remove_database
    else
        log_info "Database removal skipped"
    fi
    
    # Remove firewall rules
    if confirm "Do you want to remove firewall rules?" "N"; then
        remove_firewall_rules
    else
        log_info "Firewall rule removal skipped"
    fi
    
    # Perform final cleanup
    final_cleanup
    
    log_success "Uninstallation completed successfully"
    echo ""
    echo "The Personal Finance Management System has been removed from your server."
    echo ""
}

# Run main function
main
