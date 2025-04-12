# TrustVote Installation Guide
## Debian-Based Systems

This document provides comprehensive instructions for installing and running the TrustVote blockchain voting system on Debian-based operating systems.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Repository Setup](#repository-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Blockchain Setup](#blockchain-setup)
6. [Configuration](#configuration)
7. [Starting the Application](#starting-the-application)
8. [MetaMask Configuration](#metamask-configuration)
9. [Testing the System](#testing-the-system)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting the installation process, ensure your system has the necessary dependencies installed.

```bash
# Update package lists
sudo apt update

# Install system dependencies
sudo apt install -y git curl build-essential python3 python3-pip python3-venv nodejs npm

# Install PostgreSQL (optional - for production environments)
sudo apt install -y postgresql postgresql-contrib
```

---

## Repository Setup

Clone the TrustVote repository to your local machine.

```bash
# Create a directory for the project
mkdir -p ~/projects
cd ~/projects

# Clone the repository
git clone https://github.com/yourusername/trustvote.git
cd trustvote
```

---

## Backend Setup

Set up the Django backend application.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Set up the database (using SQLite by default)
python manage.py migrate

# Create a superuser for admin access
python manage.py createsuperuser
# Follow the prompts to create an admin user
```

---

## Frontend Setup

Set up the Vue.js frontend application.

```bash
# Navigate to the frontend directory
cd ../frontend

# Install Node.js dependencies
npm install
```

---

## Blockchain Setup

Set up the Ethereum development environment and deploy smart contracts.

### Install Blockchain Tools

```bash
# Install Truffle globally
npm install -g truffle

# Install Ganache (local Ethereum blockchain) globally
npm install -g ganache-cli

# Navigate to the contracts directory
cd ../contracts

# Install contract dependencies
npm install
```

### Start Local Blockchain

Open a new terminal and run:

```bash
# Start Ganache with 10 test accounts
ganache-cli -p 8545 -i 1337
```

Keep this terminal running throughout the development process.

### Deploy Smart Contracts

In a new terminal:

```bash
cd ~/projects/trustvote/contracts

# Compile the contracts
truffle compile

# Deploy the contracts to the local blockchain
truffle migrate --reset
```

Note the deployed contract addresses that appear in the terminal, especially the ElectionFactory contract address. You'll need this for configuration.

---

## Configuration

Configure both the backend and frontend applications.

### Backend Configuration

```bash
cd ~/projects/trustvote/backend

# Create a .env file for configuration
cat > .env << EOL
DEBUG=True
SECRET_KEY=yoursecretkey
ALLOWED_HOSTS=localhost,127.0.0.1
ETHEREUM_NODE_URL=http://localhost:8545
CONTRACT_ADDRESS=0xYourElectionFactoryContractAddress
EOL
```

Replace `0xYourElectionFactoryContractAddress` with the actual contract address from the deployment step.

### Frontend Configuration

```bash
cd ~/projects/trustvote/frontend

# Create .env file for frontend configuration
cat > .env.local << EOL
VUE_APP_API_URL=http://localhost:8000/api
VUE_APP_ETHEREUM_NETWORK_ID=1337
EOL
```

---

## Starting the Application

Start both the backend and frontend servers.

### Start Backend Server

In one terminal:

```bash
cd ~/projects/trustvote/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

### Start Frontend Server

In another terminal:

```bash
cd ~/projects/trustvote/frontend
npm run serve
```

The application should now be accessible at `http://localhost:8080` (or the port shown in the frontend terminal).

The admin interface can be accessed at `http://localhost:8000/admin` using the superuser credentials you created.

---

## MetaMask Configuration

Configure MetaMask to work with your local blockchain.

1. Install the MetaMask extension for your browser if you haven't already.

2. Once installed, create a new wallet or import an existing one.

3. Connect MetaMask to your local blockchain:
   - Click on the MetaMask icon
   - Click on the network dropdown at the top
   - Select "Add Network"
   - Fill in:
     - Network Name: `Local Ganache`
     - New RPC URL: `http://localhost:8545`
     - Chain ID: `1337`
     - Currency Symbol: `ETH`
   - Click Save

4. Import a test account from Ganache:
   - Look for the private keys in the Ganache terminal output
   - In MetaMask, click on your account icon -> Import Account
   - Paste the private key and click Import

Now you have test ETH to interact with the blockchain.

---

## Testing the System

Follow these steps to test the full functionality of the TrustVote system:

1. **Register a User**:
   - Open `http://localhost:8080` in your browser
   - Click "Register" and create a new user account

2. **Whitelist the User**:
   - Log in to the admin interface at `http://localhost:8000/admin`
   - Navigate to the Users section
   - Find the user you created
   - Check the "is_whitelisted" option and save

3. **Connect MetaMask**:
   - Log in as the user you created
   - Click the "Connect Wallet" button in the navigation bar
   - Approve the connection in the MetaMask popup

4. **Create an Election**:
   - As an admin, navigate to the Election Management section
   - Click "Create New Election"
   - Fill in the required details including positions and candidates
   - Save the election

5. **Cast a Vote**:
   - Log in as a regular user
   - Navigate to the Elections page
   - Select an active election
   - Choose candidates for each position
   - Submit your vote and confirm in MetaMask

6. **View Results**:
   - After the election ends (you can manually close it as admin)
   - Navigate to the election details
   - Click "View Results" to see the voting outcomes

---

## Troubleshooting

### Common Issues and Solutions

#### Database Migration Issues
```
python manage.py makemigrations
python manage.py migrate --run-syncdb
```

#### MetaMask Connection Problems
- Ensure Ganache is running
- Check that you've added the correct network settings
- Verify you've imported an account with sufficient ETH

#### Smart Contract Deployment Failures
- Check Ganache is running and accessible
- Ensure your terminal is in the correct directory
- Verify Truffle configuration in `truffle-config.js`

#### CORS Errors
- Check your backend is running with the correct allowed hosts
- Verify API URL in frontend configuration
- Check browser console for specific error messages

#### Blockchain Transaction Errors
- Ensure you have enough ETH in your MetaMask account
- Check that the contract is deployed correctly
- Make sure you're on the correct network (Chain ID 1337)

---

## Production Deployment

For production deployment, additional steps are necessary:

- Use PostgreSQL instead of SQLite
- Configure proper SSL certificates
- Set up a production web server (Nginx, Apache)
- Deploy to a proper Ethereum network (testnet or mainnet)
- Set up proper environment variables

Refer to the `DEPLOYMENT.md` document for detailed production deployment instructions.

---

*This installation guide is for development and testing purposes. For production deployments, additional security measures should be implemented.*