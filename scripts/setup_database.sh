#!/bin/bash
# Database setup script for Personal Finance App

# Function to log messages
log_message() {
  echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
  log_message "PostgreSQL is not installed. Installing..."
  apt update
  apt install -y postgresql postgresql-contrib
  systemctl start postgresql
  systemctl enable postgresql
else
  log_message "PostgreSQL is already installed"
fi

# Create database user if it doesn't exist
log_message "Creating database user if it doesn't exist..."
sudo -u postgres psql -c "SELECT 1 FROM pg_roles WHERE rolname='finance_user'" | grep -q 1
if [ $? -ne 0 ]; then
  sudo -u postgres psql -c "CREATE USER finance_user WITH PASSWORD 'dvp3YoSKQ1E3/2EX';"
  log_message "Database user created"
else
  log_message "Database user already exists"
fi

# Create database if it doesn't exist
log_message "Creating database if it doesn't exist..."
sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "finance_app"
if [ $? -ne 0 ]; then
  sudo -u postgres psql -c "CREATE DATABASE finance_app OWNER finance_user;"
  log_message "Database created"
else
  log_message "Database already exists"
fi

# Grant privileges
log_message "Granting privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE finance_app TO finance_user;"

# Create extension if it doesn't exist
log_message "Creating extensions if they don't exist..."
sudo -u postgres psql -d finance_app -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# Initialize database schema
log_message "Checking if Sequelize CLI is installed..."
if ! command -v sequelize &> /dev/null; then
  log_message "Installing Sequelize CLI..."
  npm install -g sequelize-cli
fi

# Check if we're in the backend directory
if [ -f "./src/models/index.js" ]; then
  log_message "Initializing database schema..."
  npx sequelize-cli db:migrate
elif [ -d "/var/www/finance-app/backend" ]; then
  log_message "Initializing database schema..."
  cd /var/www/finance-app/backend
  npx sequelize-cli db:migrate
else
  log_message "Backend directory not found. Database schema initialization skipped."
  log_message "Please run this script from the backend directory or after installing the application."
fi

log_message "Database setup completed successfully"
