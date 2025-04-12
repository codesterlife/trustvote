# TrustVote Deployment Guide

This document provides instructions for deploying the TrustVote blockchain-based voting system to a production environment.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Smart Contract Deployment](#smart-contract-deployment)
5. [Configuration](#configuration)
6. [Security Considerations](#security-considerations)
7. [Scaling](#scaling)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements
- **Server**: Modern Linux distribution (Ubuntu 22.04 LTS recommended)
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Database**: PostgreSQL 14+
- **Web Server**: Nginx 1.18+
- **Blockchain Node**: Ethereum node (Geth, Infura, or similar)
- **SSL Certificate**: Let's Encrypt or commercial SSL

### Software Dependencies
- Python 3.10+
- Node.js 18+
- npm 9+
- Truffle Suite
- Web3.js

## Backend Deployment

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/trustvote.git
cd trustvote
```

### 2. Setup Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```
DEBUG=False
SECRET_KEY=your_very_secure_secret_key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgres://user:password@localhost:5432/trustvote
ETHEREUM_NODE_URL=https://your-ethereum-node-url
CONTRACT_ADDRESS=0xYourDeployedFactoryContractAddress
```

### 4. Setup Database

```bash
python manage.py migrate
python manage.py createsuperuser
```

### 5. Collect Static Files

```bash
python manage.py collectstatic
```

### 6. Setup Gunicorn Service

Create a systemd service file for the backend:

```bash
sudo nano /etc/systemd/system/trustvote.service
```

Add the following content:

```
[Unit]
Description=TrustVote Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/trustvote/backend
Environment="PATH=/path/to/trustvote/backend/venv/bin"
ExecStart=/path/to/trustvote/backend/venv/bin/gunicorn trustvote.wsgi:application --workers 3 --bind 127.0.0.1:8000

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable trustvote.service
sudo systemctl start trustvote.service
```

### 7. Configure Nginx

Create an Nginx server block:

```bash
sudo nano /etc/nginx/sites-available/trustvote
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # API endpoints
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Django admin and static files
    location /admin {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /static/ {
        alias /path/to/trustvote/backend/staticfiles/;
    }
    
    # Frontend app
    location / {
        root /path/to/trustvote/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

Enable the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/trustvote /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Frontend Deployment

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env.production` file:

```
NODE_ENV=production
VUE_APP_API_URL=https://yourdomain.com/api
VUE_APP_ETHEREUM_NETWORK_ID=1  # Use 1 for mainnet, 3 for Ropsten, etc.
```

### 3. Build for Production

```bash
npm run build
```

The compiled assets will be placed in the `dist` directory, which should be served by Nginx as configured above.

## Smart Contract Deployment

### 1. Configure Truffle

Update `truffle-config.js` to include your production network:

```javascript
const HDWalletProvider = require('@truffle/hdwallet-provider');
const mnemonic = process.env.MNEMONIC;

module.exports = {
  networks: {
    // Development network
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    // Production network (e.g., Ethereum Mainnet)
    mainnet: {
      provider: () => new HDWalletProvider(
        mnemonic, 
        `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
      ),
      network_id: 1,
      gas: 5500000,
      gasPrice: 20000000000,  // 20 Gwei
      confirmations: 2,
      timeoutBlocks: 200
    }
  },
  compilers: {
    solc: {
      version: "0.8.10",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
```

### 2. Deploy Smart Contracts

```bash
cd contracts
export MNEMONIC="your twelve word mnemonic phrase"
export INFURA_PROJECT_ID="your infura project id"
npx truffle migrate --network mainnet
```

Record the deployed contract addresses and update both the backend environment variables and frontend configuration.

## Configuration

### Key Environment Variables

#### Backend `.env`
- `DEBUG`: Set to False in production
- `SECRET_KEY`: Django secret key for CSRF and session security
- `ALLOWED_HOSTS`: Comma-separated list of allowed domains
- `DATABASE_URL`: PostgreSQL database connection string
- `ETHEREUM_NODE_URL`: URL of your Ethereum node
- `CONTRACT_ADDRESS`: Address of the deployed ElectionFactory contract

#### Frontend `.env.production`
- `VUE_APP_API_URL`: URL of your backend API
- `VUE_APP_ETHEREUM_NETWORK_ID`: ID of the Ethereum network you're using (1 for mainnet)

## Security Considerations

1. **SSL/TLS**: Always use HTTPS in production
2. **API Authentication**: Ensure all sensitive API endpoints require authentication
3. **Rate Limiting**: Implement rate limiting on login and registration endpoints
4. **Database Security**: 
   - Use strong passwords
   - Limit database access to the application server
   - Regular backups
5. **Private Keys**: 
   - Never store private keys or mnemonics in the code
   - Use environment variables or secure key management services
6. **Smart Contract Security**:
   - Consider a professional audit for your smart contracts
   - Implement access controls for admin functions
7. **Input Validation**: Ensure all user inputs are properly validated and sanitized

## Scaling

### Backend Scaling
- Increase the number of Gunicorn workers as load increases
- Consider using a load balancer for horizontal scaling
- Optimize database queries with proper indexing
- Implement caching for frequently accessed data

### Frontend Scaling
- Use a CDN to serve static assets
- Implement client-side caching strategies
- Consider server-side rendering for improved initial load performance

### Blockchain Scaling
- Implement proper gas price strategies
- Consider Layer 2 solutions for high-volume applications
- Use event indexing for faster data retrieval

## Monitoring

1. **Application Monitoring**:
   - Set up application logging with a service like Sentry
   - Implement health check endpoints

2. **Server Monitoring**:
   - Configure server monitoring with Prometheus, Grafana, or a similar stack
   - Monitor CPU, RAM, disk usage, and network traffic

3. **Database Monitoring**:
   - Monitor database performance and query times
   - Set up alerts for slow queries

4. **Blockchain Monitoring**:
   - Monitor transaction confirmations
   - Track gas prices and transaction costs

## Troubleshooting

### Common Issues

1. **API Connection Failures**:
   - Check Nginx configuration
   - Verify CORS settings
   - Check for firewall issues

2. **Database Connection Issues**:
   - Verify database credentials
   - Check PostgreSQL logs
   - Ensure the database server is accessible

3. **Smart Contract Interactions**:
   - Verify the contract addresses in configuration
   - Check for sufficient gas
   - Verify network connectivity to the Ethereum node

4. **SSL/TLS Issues**:
   - Check certificate validity
   - Verify certificate paths in Nginx config

### Support

For additional support, please:
1. Check the project documentation
2. Open an issue on the GitHub repository
3. Contact the development team at support@trustvote.example.com