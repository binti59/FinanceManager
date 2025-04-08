#!/bin/bash

# Personal Finance Management System - Uninstallation Script
# This script removes the Personal Finance Management System from a server.

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
    echo "  Personal Finance Management System - Uninstallation Script  "
    echo "============================================================"
    echo -e "${NC}"
    echo "This script will remove the Personal Finance Management System"
    echo "from your server."
    echo ""
    echo "The uninstallation includes:"
    echo "  - Stopping and removing the application services"
    echo "  - Removing the application files"
    echo "  - Removing the Nginx configuration"
    echo "  - Optionally removing the database"
    echo "  - Optionally removing backup files"
    echo "  - Optionally removing installed software"
    echo ""
    echo "Log file: $LOG_FILE"
    echo ""
    echo -e "${RED}WARNING: This action is irreversible!${NC}"
    echo ""
}

# Function to stop application services
stop_services() {
    log_info "Stopping application services..."
    
    # Stop PM2 processes
    if command -v pm2 >/dev/null 2>&1; then
        if pm2 list | grep -q "finance-app-api"; then
            pm2 stop finance-app-api
            pm2 delete finance-app-api
            pm2 save
            log_info "PM2 processes stopped and removed"
        else
            log_info "No PM2 processes found for the application"
        fi
    else
        log_info "PM2 is not installed"
    fi
    
    log_success "Application services stopped"
}

# Function to remove Nginx configuration
remove_nginx_config() {
    log_info "Removing Nginx configuration..."
    
    # Remove Nginx configuration files - check both with and without .conf extension
    if [ -f /etc/nginx/sites-enabled/finance-app ]; then
        rm -f /etc/nginx/sites-enabled/finance-app
        log_info "Removed Nginx configuration from sites-enabled"
    elif [ -f /etc/nginx/sites-enabled/finance-app.conf ]; then
        rm -f /etc/nginx/sites-enabled/finance-app.conf
        log_info "Removed Nginx configuration from sites-enabled"
    fi
    
    if [ -f /etc/nginx/sites-available/finance-app ]; then
        rm -f /etc/nginx/sites-available/finance-app
        log_info "Removed Nginx configuration from sites-available"
    elif [ -f /etc/nginx/sites-available/finance-app.conf ]; then
        rm -f /etc/nginx/sites-available/finance-app.conf
        log_info "Removed Nginx configuration from sites-available"
    fi
    
    # Reload Nginx if it's running
    if systemctl is-active --quiet nginx; then
        systemctl reload nginx
        log_info "Nginx reloaded"
    fi
    
    log_success "Nginx configuration removed"
}

# Function to remove SSL certificates
remove_ssl_certificates() {
    log_info "Checking for SSL certificates..."
    
    # Check if certbot is installed
    if command -v certbot >/dev/null 2>&1; then
        # Get list of domains
        domains=$(certbot certificates 2>/dev/null | grep -oP "(?<=Domains: ).*")
        
        if [ -n "$domains" ]; then
            log_info "Found SSL certificates for domains: $domains"
            
            if confirm "Do you want to remove the SSL certificates?" "N"; then
                # Extract first domain from the list
                first_domain=$(echo $domains | cut -d' ' -f1)
                
                # Delete certificates
                certbot delete --cert-name $first_domain
                log_info "SSL certificates removed"
            else
                log_info "SSL certificates will be kept"
            fi
        else
            log_info "No SSL certificates found"
        fi
    else
        log_info "Certbot is not installed"
    fi
}

# Function to remove application files
remove_application_files() {
    log_info "Removing application files..."
    
    # Remove application directory
    if [ -d /var/www/finance-app ]; then
        rm -rf /var/www/finance-app
        log_info "Removed application directory"
    else
        log_info "Application directory not found"
    fi
    
    # Remove log files
    if [ -d /var/log/finance-app ]; then
        if confirm "Do you want to remove application log files?" "N"; then
            rm -rf /var/log/finance-app
            log_info "Removed application log files"
        else
            log_info "Application log files will be kept"
        fi
    fi
    
    # Remove backup scripts
    if [ -f /usr/local/bin/backup-finance-db.sh ]; then
        rm -f /usr/local/bin/backup-finance-db.sh
        log_info "Removed database backup script"
    fi
    
    if [ -f /usr/local/bin/backup-finance-app.sh ]; then
        rm -f /usr/local/bin/backup-finance-app.sh
        log_info "Removed application backup script"
    fi
    
    # Remove cron jobs
    (crontab -l 2>/dev/null | grep -v "backup-finance") | crontab -
    log_info "Removed backup cron jobs"
    
    log_success "Application files removed"
}

# Function to remove database
remove_database() {
    if confirm "Do you want to remove the application database?" "N"; then
        log_info "Removing database..."
        
        # Prompt for database name
        read -p "Enter database name to remove [finance_app]: " DB_NAME
        DB_NAME=${DB_NAME:-finance_app}
        
        # Prompt for database user
        read -p "Enter database user to remove [finance_user]: " DB_USER
        DB_USER=${DB_USER:-finance_user}
        
        # Confirm database removal
        if confirm "Are you sure you want to remove database '$DB_NAME' and user '$DB_USER'? This action cannot be undone!" "N"; then
            # Drop database and user
            sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
            sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;"
            
            log_success "Database and user removed"
        else
            log_info "Database removal cancelled"
        fi
    else
        log_info "Database will be kept"
    fi
}

# Function to remove backup files
remove_backup_files() {
    if [ -d /var/backups/finance-app ]; then
        if confirm "Do you want to remove backup files?" "N"; then
            log_info "Removing backup files..."
            
            rm -rf /var/backups/finance-app
            log_success "Backup files removed"
        else
            log_info "Backup files will be kept"
        fi
    else
        log_info "No backup files found"
    fi
}

# Function to remove installed software
remove_installed_software() {
    if confirm "Do you want to remove installed software (Node.js, PM2, etc.)?" "N"; then
        log_info "Removing installed software..."
        
        # Remove PM2
        if command -v pm2 >/dev/null 2>&1; then
            npm uninstall -g pm2
            log_info "PM2 removed"
        fi
        
        # Ask about removing Node.js
        if command -v node >/dev/null 2>&1 && confirm "Do you want to remove Node.js?" "N"; then
            apt purge -y nodejs
            apt autoremove -y
            log_info "Node.js removed"
        fi
        
        # Ask about removing Nginx
        if command -v nginx >/dev/null 2>&1 && confirm "Do you want to remove Nginx?" "N"; then
            apt purge -y nginx nginx-common
            apt autoremove -y
            log_info "Nginx removed"
        fi
        
        # Ask about removing PostgreSQL
        if command -v psql >/dev/null 2>&1 && confirm "Do you want to remove PostgreSQL?" "N"; then
            apt purge -y postgresql postgresql-contrib
            apt autoremove -y
            log_info "PostgreSQL removed"
        fi
        
        log_success "Requested software removed"
    else
        log_info "Installed software will be kept"
    fi
}

# Function to display uninstallation summary
display_summary() {
    echo -e "${GREEN}"
    echo "============================================================"
    echo "  Personal Finance Management System - Uninstallation Summary  "
    echo "============================================================"
    echo -e "${NC}"
    echo "Uninstallation completed successfully!"
    echo ""
    echo "The following actions were performed:"
    echo "  - Application services were stopped"
    echo "  - Nginx configuration was removed"
    echo "  - Application files were removed"
    echo ""
    echo "Uninstallation Log:"
    echo "  $LOG_FILE"
    echo ""
    echo "Thank you for using the Personal Finance Management System."
    echo "============================================================"
}

# Main uninstallation function
main() {
    # Initialize log file
    > "$LOG_FILE"
    
    # Display banner
    display_banner
    
    # Confirm uninstallation
    if ! confirm "Are you sure you want to uninstall the Personal Finance Management System?" "N"; then
        log_info "Uninstallation cancelled by user"
        exit 0
    fi
    
    # Double-check confirmation
    if ! confirm "This will remove the application and its data. Are you absolutely sure?" "N"; then
        log_info "Uninstallation cancelled by user"
        exit 0
    fi
    
    # Stop application services
    stop_services
    
    # Remove Nginx configuration
    remove_nginx_config
    
    # Remove SSL certificates
    remove_ssl_certificates
    
    # Remove application files
    remove_application_files
    
    # Remove database
    remove_database
    
    # Remove backup files
    remove_backup_files
    
    # Remove installed software
    remove_installed_software
    
    # Display uninstallation summary
    display_summary
}

# Run main uninstallation function
main
