#!/bin/bash

# Update the installation script to use ports 5000 and 5001 instead of 3000 and 4000
# This script modifies the backend and frontend configuration files

# Update backend port in .env file
update_backend_env() {
  echo "Updating backend .env file..."
  
  # Create or update backend .env file
  cat > /var/www/finance-app/backend/.env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://bikram:dtP5+x/lehFhyoOi@localhost:5432/finance_app
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
EOF

  echo "Backend .env file updated to use port 5000"
}

# Update frontend environment file
update_frontend_env() {
  echo "Updating frontend .env file..."
  
  # Create or update frontend .env file
  cat > /var/www/finance-app/frontend/.env << 'EOF'
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=production
EOF

  echo "Frontend .env file updated to use backend port 5000"
}

# Update Nginx configuration
update_nginx_config() {
  echo "Updating Nginx configuration..."
  
  # Create or update Nginx configuration
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

  # Enable the site if not already enabled
  if [ ! -L /etc/nginx/sites-enabled/finance-app ]; then
    ln -s /etc/nginx/sites-available/finance-app /etc/nginx/sites-enabled/
  fi
  
  # Test Nginx configuration
  nginx -t
  
  if [ $? -eq 0 ]; then
    # Reload Nginx if test passed
    systemctl reload nginx
    echo "Nginx configuration updated and reloaded"
  else
    echo "Nginx configuration test failed"
    exit 1
  fi
}

# Update firewall rules
update_firewall() {
  echo "Updating firewall rules..."
  
  if command -v ufw &> /dev/null; then
    # Allow new ports
    ufw allow 5000
    ufw allow 5001
    
    echo "Firewall rules updated to allow ports 5000 and 5001"
  else
    echo "UFW firewall not found, skipping firewall configuration"
  fi
}

# Main execution
echo "Starting port configuration update..."
update_backend_env
update_frontend_env
update_nginx_config
update_firewall
echo "Port configuration update completed successfully"
