# Personal Finance Management System

A comprehensive personal finance management system that allows users to track their financial health, manage accounts and transactions, set budgets and goals, and monitor progress toward financial independence.

## Overview

This project implements a comprehensive personal finance management system that allows users to connect to various financial data sources, process and extract financial details, and visualize their financial health through an interactive dashboard. The system provides insights into income, expenses, cash flow, net worth, investments, and key performance indicators (KPIs).

## Architecture

The application follows a modern three-tier architecture:

- **Frontend**: React.js with Material-UI, Redux, and Chart.js
- **Backend**: Node.js with Express, RESTful API design
- **Database**: PostgreSQL with Sequelize ORM

## Features

- **Dashboard**: Comprehensive financial dashboard with key metrics
- **Account Management**: Add, edit, and track financial accounts
- **Transaction Management**: Record and categorize income and expenses
- **Budget Management**: Create and monitor spending budgets
- **Goal Tracking**: Set and track financial goals
- **Investment Tracking**: Monitor investment performance and allocation
- **Financial Independence Calculator**: Track progress toward financial independence
- **Reports and Analytics**: Generate financial reports and insights
- **Data Import/Export**: Upload statements and export data

## Documentation

- [High-Level Design (HLD)](./docs/high_level_design.md)
- [Low-Level Design (LLD)](./docs/low_level_design.md)
- [Deployment Guide](./docs/deployment_guide.md)
- [Website Analysis](./docs/website_analysis.md)

## Installation

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Nginx (for production deployment)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/binti59/FinanceManager.git
   cd FinanceManager
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. Run database migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

6. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

7. Configure frontend environment:
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

8. Start the frontend development server:
   ```bash
   npm start
   ```

### Production Deployment

For production deployment, use the provided installation script:

```bash
chmod +x scripts/install.sh
sudo ./scripts/install.sh
```

The script will guide you through the installation process, including:
- System updates and required packages
- Node.js, PostgreSQL, Nginx, and PM2 installation
- Database setup and configuration
- Application deployment
- Nginx configuration and SSL setup
- Backup and monitoring setup

## Uninstallation

To remove the application, use the provided uninstallation script:

```bash
chmod +x scripts/uninstall.sh
sudo ./scripts/uninstall.sh
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Material-UI for the UI components
- Chart.js for data visualization
- Sequelize for database ORM
- Express for the backend framework
- React for the frontend framework
