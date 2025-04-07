#!/bin/bash

# install_finance_app.sh - Installation script for Personal Finance App
# This script installs the Personal Finance App without requiring GitHub authentication

# Log file
LOG_FILE="/var/log/finance-app-install.log"
APP_DIR="/var/www/finance-app"
CONFIG_DIR="$APP_DIR/backend/config"
DB_CONFIG="$CONFIG_DIR/config.json"
ENV_FILE="$APP_DIR/backend/.env"
FRONTEND_ENV="$APP_DIR/frontend/.env"

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
        log_message "Installation failed. Please check the log file for details."
        exit 1
    fi
}

# Check if script is run as root
if [ "$(id -u)" != "0" ]; then
    log_message "ERROR: This script must be run as root"
    exit 1
fi

# Create log file
touch $LOG_FILE
chmod 644 $LOG_FILE

# Welcome message
log_message "INFO: Personal Finance App Installation Script"
log_message "INFO: This script will install the Personal Finance App on your server"

# Prompt for confirmation
read -p "Do you want to proceed with the installation? [Y/n] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ ! $REPLY = "" ]]; then
    log_message "INFO: Installation cancelled by user"
    exit 0
fi

# Check system requirements
log_message "INFO: Checking system requirements..."
CPU_CORES=$(nproc)
TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
FREE_DISK=$(df -m / | awk 'NR==2 {print $4}')

log_message "INFO: CPU Cores: $CPU_CORES"
log_message "INFO: Total Memory: $TOTAL_MEM MB"
log_message "INFO: Free Disk Space: $FREE_DISK MB"

if [ $CPU_CORES -lt 2 ]; then
    log_message "WARNING: Minimum 2 CPU cores recommended (found $CPU_CORES)"
fi

if [ $TOTAL_MEM -lt 2048 ]; then
    log_message "WARNING: Minimum 2GB RAM recommended (found $TOTAL_MEM MB)"
fi

if [ $FREE_DISK -lt 5120 ]; then
    log_message "WARNING: Minimum 5GB free disk space recommended (found $FREE_DISK MB)"
fi

check_status "System requirements check completed"

# Collect configuration information
log_message "INFO: Collecting configuration information..."

# Database configuration
read -p "PostgreSQL database name [finance_app]: " DB_NAME
DB_NAME=${DB_NAME:-finance_app}

read -p "PostgreSQL username [finance_user]: " DB_USER
DB_USER=${DB_USER:-finance_user}

read -p "PostgreSQL password [auto-generate]: " DB_PASSWORD
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 12)
    log_message "INFO: Generated database password: $DB_PASSWORD"
fi

# Domain configuration
read -p "Domain name (leave empty for IP-based access): " DOMAIN_NAME

# HTTPS configuration
read -p "Enable HTTPS with Let's Encrypt? [Y/n]: " -n 1 -r ENABLE_HTTPS
echo
ENABLE_HTTPS=${ENABLE_HTTPS:-Y}

if [[ $ENABLE_HTTPS =~ ^[Yy]$ ]]; then
    read -p "Email address for Let's Encrypt notifications: " EMAIL_ADDRESS
    if [ -z "$EMAIL_ADDRESS" ]; then
        log_message "ERROR: Email address is required for Let's Encrypt"
        exit 1
    fi
fi

# Application port
read -p "Application port [3000]: " APP_PORT
APP_PORT=${APP_PORT:-3000}

check_status "Configuration information collected"

# Update system packages
log_message "INFO: Updating system packages..."
apt-get update && apt-get upgrade -y
check_status "System packages updated"

# Install required packages
log_message "INFO: Installing required packages..."
apt-get install -y curl wget git unzip zip htop ufw fail2ban
check_status "Required packages installed"

# Set timezone to UTC
log_message "INFO: Setting timezone to UTC..."
timedatectl set-timezone UTC
check_status "Timezone set to UTC"

# Configure firewall
log_message "INFO: Configuring firewall..."
ufw allow ssh
ufw allow http
ufw allow https
ufw allow 3000
ufw allow 4000
if [ "$(ufw status | grep -o "inactive")" == "inactive" ]; then
    echo "y" | ufw enable
fi
check_status "Firewall configured"

# Install Node.js
log_message "INFO: Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    log_message "INFO: Node.js version: $(node -v)"
    log_message "INFO: npm version: $(npm -v)"
else
    log_message "INFO: Node.js is already installed"
    log_message "INFO: Node.js version: $(node -v)"
    log_message "INFO: npm version: $(npm -v)"
fi
check_status "Node.js installed"

# Install PostgreSQL
log_message "INFO: Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    apt-get install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql
else
    log_message "INFO: PostgreSQL is already installed"
    systemctl enable postgresql
    systemctl start postgresql
fi
check_status "PostgreSQL installed and running"

# Install Nginx
log_message "INFO: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl enable nginx
    systemctl start nginx
else
    log_message "INFO: Nginx is already installed"
    systemctl enable nginx
    systemctl start nginx
fi
check_status "Nginx installed and running"

# Install PM2
log_message "INFO: Installing PM2..."
npm install -g pm2
log_message "INFO: PM2 version: $(pm2 -v)"
check_status "PM2 installed"

# Configure PostgreSQL
log_message "INFO: Configuring PostgreSQL..."
# Create database
sudo -u postgres psql -c "ALTER ROLE postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
log_message "INFO: Database $DB_NAME created"

# Create user
sudo -u postgres psql -c "CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD';"
log_message "INFO: User $DB_USER created"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
log_message "INFO: Privileges granted to $DB_USER on $DB_NAME"
check_status "PostgreSQL configured"

# Create application directory structure
log_message "INFO: Creating application directory structure..."
mkdir -p $APP_DIR/{frontend,backend}
mkdir -p $APP_DIR/backend/{src,config,public}
mkdir -p $APP_DIR/frontend/{public,src}
check_status "Application directory structure created"

# Create backend configuration
log_message "INFO: Creating backend configuration..."
mkdir -p $CONFIG_DIR
cat > $DB_CONFIG << EOF
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
check_status "Backend database configuration created"

# Create backend environment file
cat > $ENV_FILE << EOF
NODE_ENV=production
PORT=$APP_PORT
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
EOF
check_status "Backend environment file created"

# Create frontend environment file
cat > $FRONTEND_ENV << EOF
REACT_APP_API_URL=http://localhost:$APP_PORT/api
REACT_APP_ENV=production
EOF
check_status "Frontend environment file created"

# Create backend package.json
log_message "INFO: Creating backend package.json..."
cat > $APP_DIR/backend/package.json << 'EOF'
{
  "name": "finance-app-backend",
  "version": "1.0.0",
  "description": "Personal Finance App Backend",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "express-validator": "^7.0.1",
    "jsonwebtoken": "^9.0.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "pg": "^8.10.0",
    "pg-hstore": "^2.3.4",
    "sequelize": "^6.31.0",
    "sequelize-cli": "^6.6.0"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "nodemon": "^2.0.22",
    "supertest": "^6.3.3"
  }
}
EOF
check_status "Backend package.json created"

# Create frontend package.json
log_message "INFO: Creating frontend package.json..."
cat > $APP_DIR/frontend/package.json << 'EOF'
{
  "name": "finance-app-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.10.6",
    "@emotion/styled": "^11.10.6",
    "@mui/icons-material": "^5.11.16",
    "@mui/material": "^5.12.1",
    "@reduxjs/toolkit": "^1.9.5",
    "axios": "^1.3.6",
    "chart.js": "^4.2.1",
    "date-fns": "^2.29.3",
    "formik": "^2.2.9",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.2.0",
    "react-redux": "^8.0.5",
    "react-router-dom": "^6.10.0",
    "react-scripts": "5.0.1",
    "yup": "^1.1.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF
check_status "Frontend package.json created"

# Create basic backend files
log_message "INFO: Creating basic backend files..."

# Create server.js
cat > $APP_DIR/backend/src/server.js << 'EOF'
require('dotenv').config();
const app = require('./app');
const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
EOF

# Create app.js
cat > $APP_DIR/backend/src/app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { sequelize } = require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/accounts', require('./routes/account.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/budgets', require('./routes/budget.routes'));
app.use('/api/goals', require('./routes/goal.routes'));
app.use('/api/investments', require('./routes/investment.routes'));
app.use('/api/reports', require('./routes/report.routes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

// Database connection test
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established successfully');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = app;
EOF

# Create models index.js
mkdir -p $APP_DIR/backend/src/models
cat > $APP_DIR/backend/src/models/index.js << 'EOF'
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
EOF

# Create basic route files
mkdir -p $APP_DIR/backend/src/routes
cat > $APP_DIR/backend/src/routes/auth.routes.js << 'EOF'
const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Auth service is running' });
});

module.exports = router;
EOF

# Create other route files
for route in user account transaction category budget goal investment report; do
  cat > $APP_DIR/backend/src/routes/${route}.routes.js << EOF
const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '${route} service is running' });
});

module.exports = router;
EOF
done

check_status "Basic backend files created"

# Create basic frontend files
log_message "INFO: Creating basic frontend files..."

# Create public/index.html
mkdir -p $APP_DIR/frontend/public
cat > $APP_DIR/frontend/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Personal Finance Manager - Track your finances, budgets, and investments"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
    />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/icon?family=Material+Icons"
    />
    <title>Personal Finance Manager</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF

# Create manifest.json
cat > $APP_DIR/frontend/public/manifest.json << 'EOF'
{
  "short_name": "Finance Manager",
  "name": "Personal Finance Manager",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
EOF

# Create basic frontend placeholder
mkdir -p $APP_DIR/frontend/src
cat > $APP_DIR/frontend/src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# Create index.css
cat > $APP_DIR/frontend/src/index.css << 'EOF'
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
EOF

# Create App.js
cat > $APP_DIR/frontend/src/App.js << 'EOF'
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Personal Finance Manager</h1>
        <p>Your comprehensive financial management solution</p>
      </header>
      <main>
        <p>Welcome to the Personal Finance Manager. This application is currently being set up.</p>
      </main>
    </div>
  );
}

export default App;
EOF

# Create App.css
cat > $APP_DIR/frontend/src/App.css << 'EOF'
.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  min-height: 20vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
  padding: 20px;
}

main {
  padding: 20px;
}
EOF

check_status "Basic frontend files created"

# Create update script
log_message "INFO: Creating update script..."
cat > $APP_DIR/scripts/update.sh << 'EOF'
#!/bin/bash

# Automated Update Script for Personal Finance App
# This script automatically updates the application from GitHub and implements changes

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
    "username": "bikram",
    "password": "dtP5+x/lehFhyoOi",
    "database": "finance_app",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "test": {
    "username": "bikram",
    "password": "dtP5+x/lehFhyoOi",
    "database": "finance_app_test",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "username": "bikram",
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
PORT=3000
DATABASE_URL=postgresql://bikram:dtP5+x/lehFhyoOi@localhost:5432/finance_app
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
REACT_APP_API_URL=http://localhost:3000/api
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
    
    # Create Nginx configuration
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
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
    check_status "Nginx configuration creation"
    
    # Enable the site
    if [ ! -L /etc/nginx/sites-enabled/finance-app ]; then
        ln -s /etc/nginx/sites-available/finance-app /etc/nginx/sites-enabled/
        check_status "Nginx site enabled"
    fi
    
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
    ufw allow 3000
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
EOF
chmod +x $APP_DIR/scripts/update.sh
check_status "Update script created"

# Install backend dependencies
log_message "INFO: Installing backend dependencies..."
cd $APP_DIR/backend
npm install
check_status "Backend dependencies installed"

# Install frontend dependencies
log_message "INFO: Installing frontend dependencies..."
cd $APP_DIR/frontend
npm install
check_status "Frontend dependencies installed"

# Build frontend
log_message "INFO: Building frontend..."
cd $APP_DIR/frontend
npm run build
check_status "Frontend built"

# Initialize Sequelize
log_message "INFO: Initializing Sequelize..."
cd $APP_DIR/backend
npx sequelize-cli init
check_status "Sequelize initialized"

# Run database migrations
log_message "INFO: Running database migrations..."
cd $APP_DIR/backend
npx sequelize-cli db:migrate
check_status "Database migrations completed"

# Configure Nginx
log_message "INFO: Configuring Nginx..."
if [ -n "$DOMAIN_NAME" ]; then
    # Domain-based configuration
    cat > /etc/nginx/sites-available/finance-app << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    location / {
        root $APP_DIR/frontend/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
else
    # IP-based configuration
    cat > /etc/nginx/sites-available/finance-app << EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    location / {
        root $APP_DIR/frontend/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
fi

# Enable the site
if [ ! -L /etc/nginx/sites-enabled/finance-app ]; then
    ln -s /etc/nginx/sites-available/finance-app /etc/nginx/sites-enabled/
fi

# Remove default site if it exists
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Test Nginx configuration
nginx -t
check_status "Nginx configuration"

# Reload Nginx
systemctl reload nginx
check_status "Nginx reloaded"

# Configure HTTPS with Let's Encrypt if enabled
if [[ $ENABLE_HTTPS =~ ^[Yy]$ ]] && [ -n "$DOMAIN_NAME" ]; then
    log_message "INFO: Configuring HTTPS with Let's Encrypt..."
    
    # Install Certbot
    apt-get install -y certbot python3-certbot-nginx
    
    # Obtain SSL certificate
    certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos -m $EMAIL_ADDRESS
    check_status "SSL certificate obtained"
    
    # Setup auto-renewal
    systemctl enable certbot.timer
    systemctl start certbot.timer
    check_status "Certbot auto-renewal configured"
fi

# Start application with PM2
log_message "INFO: Starting application with PM2..."
cd $APP_DIR/backend
pm2 start src/server.js --name "finance-app-backend"
check_status "Application started"

# Save PM2 configuration
pm2 save
check_status "PM2 configuration saved"

# Setup PM2 to start on boot
pm2 startup
check_status "PM2 startup configured"

# Create uninstall script
log_message "INFO: Creating uninstall script..."
cat > $APP_DIR/scripts/uninstall.sh << 'EOF'
#!/bin/bash

# Uninstall script for Personal Finance App
# This script removes the Personal Finance App from your server

# Log file
LOG_FILE="/var/log/finance-app-uninstall.log"
APP_DIR="/var/www/finance-app"
BACKUP_DIR="/var/backups/finance-app"
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
        log_message "Uninstallation failed. Please check the log file for details."
        exit 1
    fi
}

# Check if script is run as root
if [ "$(id -u)" != "0" ]; then
    log_message "ERROR: This script must be run as root"
    exit 1
fi

# Create log file
touch $LOG_FILE
chmod 644 $LOG_FILE

# Welcome message
log_message "INFO: Personal Finance App Uninstallation Script"
log_message "INFO: This script will remove the Personal Finance App from your server"

# Prompt for confirmation
read -p "Do you want to proceed with the uninstallation? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_message "INFO: Uninstallation cancelled by user"
    exit 0
fi

# Backup application before uninstalling
log_message "INFO: Creating final backup before uninstallation..."
if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR)" ]; then
    mkdir -p "$BACKUP_DIR"
    tar -czf "$BACKUP_DIR/finance-app-final-backup-$TIMESTAMP.tar.gz" -C "$(dirname $APP_DIR)" "$(basename $APP_DIR)"
    check_status "Final backup created at $BACKUP_DIR/finance-app-final-backup-$TIMESTAMP.tar.gz"
fi

# Stop and remove PM2 processes
log_message "INFO: Stopping application processes..."
if command -v pm2 &> /dev/null; then
    pm2 stop finance-app-backend 2>/dev/null || true
    pm2 delete finance-app-backend 2>/dev/null || true
    pm2 save
    check_status "Application processes stopped"
fi

# Remove Nginx configuration
log_message "INFO: Removing Nginx configuration..."
if [ -L /etc/nginx/sites-enabled/finance-app ]; then
    rm /etc/nginx/sites-enabled/finance-app
fi
if [ -f /etc/nginx/sites-available/finance-app ]; then
    rm /etc/nginx/sites-available/finance-app
fi
systemctl reload nginx
check_status "Nginx configuration removed"

# Prompt for database removal
read -p "Do you want to remove the database? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_message "INFO: Removing database..."
    if command -v psql &> /dev/null; then
        # Get database name from config file
        if [ -f "$APP_DIR/backend/config/config.json" ]; then
            DB_NAME=$(grep -o '"database": "[^"]*"' "$APP_DIR/backend/config/config.json" | head -1 | cut -d'"' -f4)
            DB_USER=$(grep -o '"username": "[^"]*"' "$APP_DIR/backend/config/config.json" | head -1 | cut -d'"' -f4)
            
            if [ -n "$DB_NAME" ]; then
                sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
                check_status "Database $DB_NAME removed"
            fi
            
            if [ -n "$DB_USER" ]; then
                sudo -u postgres psql -c "DROP ROLE IF EXISTS $DB_USER;"
                check_status "Database user $DB_USER removed"
            fi
        else
            log_message "WARNING: Could not find database configuration file"
        fi
    else
        log_message "WARNING: PostgreSQL not found, skipping database removal"
    fi
fi

# Remove application files
log_message "INFO: Removing application files..."
if [ -d "$APP_DIR" ]; then
    rm -rf "$APP_DIR"
    check_status "Application files removed"
fi

log_message "SUCCESS: Personal Finance App has been uninstalled successfully!"
log_message "INFO: A final backup was created at $BACKUP_DIR/finance-app-final-backup-$TIMESTAMP.tar.gz"
EOF
chmod +x $APP_DIR/scripts/uninstall.sh
check_status "Uninstall script created"

# Display installation summary
log_message "INFO: Installation completed successfully!"
log_message "INFO: Application URL: http://$DOMAIN_NAME"
if [[ $ENABLE_HTTPS =~ ^[Yy]$ ]] && [ -n "$DOMAIN_NAME" ]; then
    log_message "INFO: Secure URL: https://$DOMAIN_NAME"
fi
log_message "INFO: API URL: http://$DOMAIN_NAME/api"
log_message "INFO: Database: $DB_NAME"
log_message "INFO: Database User: $DB_USER"
log_message "INFO: Database Password: $DB_PASSWORD"
log_message "INFO: Application Directory: $APP_DIR"
log_message "INFO: Log File: $LOG_FILE"

log_message "INFO: To update the application, run: $APP_DIR/scripts/update.sh"
log_message "INFO: To uninstall the application, run: $APP_DIR/scripts/uninstall.sh"

exit 0
