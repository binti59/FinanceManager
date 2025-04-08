#!/bin/bash

# Port Configuration Update Script for Personal Finance App
# This script updates the port configuration to avoid conflicts with existing applications

# Update backend port in .env file
update_backend_port() {
  echo "Updating backend port configuration..."
  
  # Update backend .env file
  if [ -f "/var/www/finance-app/backend/.env" ]; then
    sed -i 's/PORT=3000/PORT=5000/g' /var/www/finance-app/backend/.env
    echo "Backend port updated to 5000"
  else
    echo "Backend .env file not found"
  fi
  
  # Update frontend API URL to point to new backend port
  if [ -f "/var/www/finance-app/frontend/.env" ]; then
    sed -i 's/REACT_APP_API_URL=http:\/\/localhost:3000\/api/REACT_APP_API_URL=http:\/\/localhost:5000\/api/g' /var/www/finance-app/frontend/.env
    echo "Frontend API URL updated to use port 5000"
  else
    echo "Frontend .env file not found"
  fi
}

# Update Nginx configuration
update_nginx_config() {
  echo "Updating Nginx configuration..."
  
  if [ -f "/etc/nginx/sites-available/finance-app" ]; then
    # Backup original config
    cp /etc/nginx/sites-available/finance-app /etc/nginx/sites-available/finance-app.bak
    
    # Update the proxy_pass to use port 5000 instead of 3000
    sed -i 's/proxy_pass http:\/\/localhost:3000;/proxy_pass http:\/\/localhost:5000;/g' /etc/nginx/sites-available/finance-app
    
    # Test Nginx configuration
    nginx -t
    
    if [ $? -eq 0 ]; then
      # Reload Nginx if test passed
      systemctl reload nginx
      echo "Nginx configuration updated and reloaded"
    else
      echo "Nginx configuration test failed, reverting changes"
      cp /etc/nginx/sites-available/finance-app.bak /etc/nginx/sites-available/finance-app
    fi
  else
    echo "Nginx configuration file not found"
  fi
}

# Update firewall rules
update_firewall() {
  echo "Updating firewall rules..."
  
  if command -v ufw &> /dev/null; then
    # Remove old port rules if they exist
    ufw delete allow 3000 &> /dev/null
    ufw delete allow 4000 &> /dev/null
    
    # Add new port rules
    ufw allow 5000
    ufw allow 5001
    
    echo "Firewall rules updated to allow ports 5000 and 5001"
  else
    echo "UFW firewall not found"
  fi
}

# Update PM2 process
update_pm2() {
  echo "Updating PM2 process..."
  
  if command -v pm2 &> /dev/null; then
    # Stop and delete all existing processes
    pm2 stop all &> /dev/null
    pm2 delete all &> /dev/null
    
    # Start with new port in single instance mode first
    cd /var/www/finance-app/backend
    echo "Starting application in single instance mode..."
    pm2 start server.js --name "finance-app-backend" --time
    
    # Wait for 5 seconds to check if it's running properly
    sleep 5
    
    # Check if the application started successfully
    if pm2 list | grep -q "finance-app-backend" && pm2 list | grep -q "online"; then
      echo "Application started successfully in single instance mode"
      
      # Save PM2 configuration
      pm2 save
    else
      echo "ERROR: Application failed to start. Checking logs..."
      pm2 logs --lines 50
      exit 1
    fi
  else
    echo "PM2 not found. Installing PM2..."
    npm install -g pm2
    update_pm2  # Recursive call after installing PM2
  fi
}

# Main execution
echo "Starting port configuration update..."
update_backend_port
update_nginx_config
update_firewall
update_pm2
echo "Port configuration update completed"
