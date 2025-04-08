#!/bin/bash
# Environment verification script for Personal Finance App

# Function to verify environment variables
verify_env_file() {
  echo "Verifying environment variables..."
  
  ENV_FILE="/var/www/finance-app/backend/.env"
  
  if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: Backend .env file not found"
    return 1
  fi
  
  # Check required variables
  required_vars=("PORT" "NODE_ENV" "DB_HOST" "DB_USER" "DB_PASSWORD" "DB_NAME")
  missing_vars=()
  
  for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" "$ENV_FILE"; then
      missing_vars+=("$var")
    fi
  done
  
  if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "ERROR: Missing required environment variables: ${missing_vars[*]}"
    
    # Add missing variables with default values
    for var in "${missing_vars[@]}"; do
      case "$var" in
        "PORT")
          echo "PORT=3000" >> "$ENV_FILE"
          ;;
        "NODE_ENV")
          echo "NODE_ENV=production" >> "$ENV_FILE"
          ;;
        "DB_HOST")
          echo "DB_HOST=localhost" >> "$ENV_FILE"
          ;;
        "DB_USER")
          echo "DB_USER=financeapp" >> "$ENV_FILE"
          ;;
        "DB_PASSWORD")
          echo "DB_PASSWORD=financeapp123" >> "$ENV_FILE"
          ;;
        "DB_NAME")
          echo "DB_NAME=financeapp" >> "$ENV_FILE"
          ;;
      esac
    done
    
    echo "Added missing environment variables with default values"
  fi
  
  return 0
}

# Function to verify database connection
verify_database_connection() {
  echo "Verifying database connection..."
  
  ENV_FILE="/var/www/finance-app/backend/.env"
  
  # Extract database credentials from .env file
  DB_HOST=$(grep "^DB_HOST=" "$ENV_FILE" | cut -d= -f2)
  DB_USER=$(grep "^DB_USER=" "$ENV_FILE" | cut -d= -f2)
  DB_PASSWORD=$(grep "^DB_PASSWORD=" "$ENV_FILE" | cut -d= -f2)
  DB_NAME=$(grep "^DB_NAME=" "$ENV_FILE" | cut -d= -f2)
  
  # Check if PostgreSQL is running
  if ! systemctl is-active --quiet postgresql; then
    echo "ERROR: PostgreSQL is not running"
    echo "Starting PostgreSQL..."
    systemctl start postgresql
    systemctl enable postgresql
  fi
  
  # Check if database exists
  if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "WARNING: Database $DB_NAME does not exist"
    echo "Creating database and user..."
    
    # Create user if not exists
    if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
      sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    fi
    
    # Create database
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    
    echo "Database and user created successfully"
  fi
  
  # Test connection
  if ! sudo -u postgres psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    echo "ERROR: Failed to connect to database"
    return 1
  fi
  
  echo "Database connection verified"
  return 0
}

# Execute verification functions
verify_env_file
verify_database_connection
