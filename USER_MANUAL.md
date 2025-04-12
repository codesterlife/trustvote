# TrustVote System User Manual

![TrustVote Logo](frontend/public/logo.png)

**Version 1.0**  
**Date: April 12, 2025**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
   - [System Requirements](#system-requirements)
   - [Creating an Account](#creating-an-account)
   - [Logging In](#logging-in)
   - [Connecting Your Wallet](#connecting-your-wallet)
3. [Voter Guide](#voter-guide)
   - [Viewing Available Elections](#viewing-available-elections)
   - [Participating in an Election](#participating-in-an-election)
   - [Casting Your Vote](#casting-your-vote)
   - [Verifying Your Vote](#verifying-your-vote)
   - [Viewing Election Results](#viewing-election-results)
   - [Managing Your Profile](#managing-your-profile)
   - [Viewing Your Voting History](#viewing-your-voting-history)
4. [Administrator Guide](#administrator-guide)
   - [Dashboard Overview](#dashboard-overview)
   - [Creating a New Election](#creating-a-new-election)
   - [Managing Elections](#managing-elections)
   - [Adding Candidates](#adding-candidates)
   - [Managing Voters](#managing-voters)
   - [Monitoring Election Status](#monitoring-election-status)
   - [Viewing Analytics](#viewing-analytics)
   - [Closing Elections](#closing-elections)
5. [Technical Background](#technical-background)
   - [Blockchain Integration](#blockchain-integration)
   - [Smart Contract Architecture](#smart-contract-architecture)
   - [Vote Security and Anonymity](#vote-security-and-anonymity)
   - [Data Flow and Storage](#data-flow-and-storage)
6. [Troubleshooting](#troubleshooting)
   - [Common Issues for Voters](#common-issues-for-voters)
   - [Common Issues for Administrators](#common-issues-for-administrators)
   - [Technical Support](#technical-support)
7. [Glossary](#glossary)

---

## Introduction

TrustVote is a blockchain-based voting system designed to provide secure, transparent, and verifiable elections. The platform combines the security of blockchain technology with an intuitive user interface to make digital voting accessible to everyone.

Key features include:
- Secure authentication and voter verification
- Blockchain-powered vote storage for immutability
- Real-time election results with transparent counting
- Administrative tools for election management
- User profile management and voting history tracking

This manual provides comprehensive instructions for both voters and administrators on how to use the TrustVote system effectively.

---

## Getting Started

### System Requirements

To use the TrustVote system, you need:

- **Web Browser**: Chrome (v88+), Firefox (v85+), Edge (v88+), or Safari (v14+)
- **MetaMask Extension**: Install the MetaMask browser extension to interact with the blockchain
- **Internet Connection**: Stable broadband connection
- **Device**: Desktop, laptop, tablet, or smartphone

### Creating an Account

1. Navigate to the TrustVote website at `https://trustvote.example.com`
2. Click "Register" in the top-right corner of the homepage
3. Fill in the registration form with:
   - Username
   - Email address
   - Password (minimum 8 characters)
   - First name
   - Last name
   - Student ID (if applicable)
4. Review and accept the terms of service
5. Click "Create Account"
6. Verify your email address by clicking the link sent to your email

**Behind the scenes**: When you register, your information is stored in the TrustVote database with your password securely hashed. Your email verification creates a unique token that expires after use, ensuring account security.

### Logging In

1. Navigate to the TrustVote website
2. Click "Login" in the top-right corner
3. Enter your email and password
4. Click "Sign In"

**Behind the scenes**: The system authenticates your credentials against the database and generates a secure JWT (JSON Web Token) that is stored in your browser. This token authenticates all your interactions with the TrustVote API.

### Connecting Your Wallet

To participate in elections, you need to connect your Ethereum wallet:

1. After logging in, click on your profile icon or "Connect Wallet" in the navigation bar
2. Click "Connect MetaMask"
3. MetaMask will pop up requesting permission - click "Connect"
4. Your wallet address will now be displayed in the navigation bar

**Behind the scenes**: The system associates your MetaMask wallet address with your TrustVote account. This wallet address will be used to sign transactions and verify your votes on the blockchain. No private keys are ever shared with the TrustVote system.

---

## Voter Guide

### Viewing Available Elections

After logging in, you can view available elections:

1. Click "Elections" in the main navigation menu
2. Browse the list of upcoming, active, and past elections
3. Each election card shows:
   - Election title
   - Status (Upcoming, Active, or Closed)
   - Start and end dates
   - Number of positions

**Behind the scenes**: The system queries the database for all elections, filtering based on your access rights. For each election, it checks if you're whitelisted to participate.

### Participating in an Election

To participate in an active election:

1. From the Elections page, find an active election
2. Click on the election card to view details
3. Review the election information, including:
   - Description
   - Voting period
   - Positions and candidates

**Note**: You must be whitelisted by the election administrator to participate. If you see a "Not Whitelisted" message, contact the election administrator.

**Behind the scenes**: The system checks if your wallet address is in the election's whitelist on both the backend database and the blockchain smart contract.

### Casting Your Vote

To cast your vote in an active election:

1. From the election details page, click "Vote Now"
2. Review each position and the candidates
3. Select your preferred candidate for each position
4. Click "Continue" to review your selections
5. Review your choices carefully
6. Click "Submit Vote"
7. Confirm the transaction in MetaMask when prompted

**Behind the scenes**: When you submit your vote:
1. The system creates a vote transaction on the blockchain
2. MetaMask signs this transaction with your private key
3. The vote is recorded in the Election smart contract
4. The backend also records an anonymized reference to your vote
5. A confirmation receipt with the transaction hash is generated

### Verifying Your Vote

To verify your vote has been counted:

1. After voting, you'll see a confirmation page with your transaction hash
2. Click "View on Etherscan" to see your vote transaction on the blockchain
3. From your profile page, you can also view your voting history

**Behind the scenes**: The transaction hash is a unique identifier for your vote on the blockchain. It can be used to verify that your vote was recorded without revealing your specific candidate choices to others.

### Viewing Election Results

To view election results:

1. Navigate to the Elections page
2. Select a closed election
3. Click "View Results"
4. The results page will display:
   - Vote counts for each candidate
   - Visual charts representing the results
   - Winner for each position

For active elections, results are hidden until the election closes.

**Behind the scenes**: Results are calculated by querying the blockchain for vote tallies. The system uses smart contract functions to count votes while maintaining voter privacy.

### Managing Your Profile

To update your profile information:

1. Click on your username or profile icon in the top-right corner
2. Select "Profile" from the dropdown menu
3. Update your personal information as needed
4. Click "Save Changes"

**Behind the scenes**: Profile updates are securely sent to the backend API and stored in the database. Sensitive information is encrypted using industry-standard methods.

### Viewing Your Voting History

To view your voting history:

1. Navigate to your profile page
2. Scroll down to the "Voting History" section
3. Review your participation in past elections
4. Click on any election to view your receipt and transaction details

**Behind the scenes**: Your voting history is retrieved from both the backend database (which stores a reference to your votes) and the blockchain (which stores the actual votes). This dual-record system ensures data integrity.

---

## Administrator Guide

### Dashboard Overview

The administrator dashboard provides a complete overview of the voting system:

1. Log in with administrator credentials
2. Access the admin dashboard by clicking "Admin Dashboard" in the navigation menu
3. The dashboard displays:
   - Total elections
   - Active elections
   - Registered voters
   - Recent voting activity
   - System status

**Behind the scenes**: The dashboard aggregates data from multiple sources - the database for user and election metadata, and the blockchain for transaction counts and voting statistics.

### Creating a New Election

To create a new election:

1. From the admin dashboard, click "Elections" in the sidebar
2. Click "Create New Election"
3. Fill in the election details:
   - Title
   - Description
   - Start date and time
   - End date and time
4. Add positions (e.g., President, Treasurer):
   - Click "Add Position"
   - Enter position title
   - Set position ID (must be unique)
5. Review the details and click "Create Election"

**Behind the scenes**: Creating an election:
1. Deploys a new Election smart contract to the blockchain
2. Records the contract address in the database
3. Creates position entries in both the database and the smart contract
4. Sets up the initial election state as "Initialization"

### Managing Elections

To manage existing elections:

1. From the admin dashboard, navigate to "Elections"
2. Select an election from the list
3. The management interface allows you to:
   - Edit election details (before it starts)
   - View positions and candidates
   - Manage voter whitelist
   - Monitor voting progress
   - Change election phase

**Behind the scenes**: Changes to election details update both the database records and, where applicable, the blockchain smart contract state.

### Adding Candidates

To add candidates to an election:

1. From the election management page, click "Candidates"
2. Click "Add Candidate"
3. Fill in the candidate details:
   - Name
   - Position (select from dropdown)
   - Party affiliation (optional)
   - Bio/manifesto
   - Upload photo (optional)
   - Wallet address (optional)
4. Assign a unique candidate ID
5. Click "Add Candidate"

**Behind the scenes**: Adding a candidate:
1. Creates a candidate record in the database
2. Registers the candidate in the Election smart contract
3. Associates the candidate with the specified position
4. Assigns a unique ID used for vote counting

### Managing Voters

To manage voters for an election:

1. From the election management page, click "Voters"
2. View the list of registered users
3. To whitelist a voter:
   - Find the user in the list
   - Click "Whitelist"
   - Confirm the action
4. To remove whitelisting:
   - Select the voter
   - Click "Remove from Whitelist"
   - Confirm the action

**Behind the scenes**: Whitelisting a voter:
1. Updates the user's status in the database
2. Adds the voter's wallet address to the whitelist in the Election smart contract
3. Grants blockchain-level permission to cast votes

### Monitoring Election Status

To monitor an ongoing election:

1. From the admin dashboard, select the active election
2. View real-time statistics:
   - Number of votes cast
   - Voter turnout percentage
   - Time remaining
3. Check for any reported issues or system alerts

**Behind the scenes**: The monitoring system:
1. Periodically polls the blockchain for new vote transactions
2. Updates the database with aggregated statistics
3. Checks for anomalies or suspicious activities

### Viewing Analytics

To access detailed analytics:

1. From the admin dashboard, click "Analytics" in the sidebar
2. View comprehensive data visualizations including:
   - Voter participation over time
   - Election status distribution
   - Vote distribution across positions
   - Device and browser statistics

**Behind the scenes**: The analytics system:
1. Aggregates data from the database and blockchain
2. Processes the data through statistical algorithms
3. Generates visualizations using Chart.js
4. Updates in real-time as new data becomes available

### Closing Elections

To close an election:

1. From the election management page, click "Change Phase"
2. Select "Close Election"
3. Confirm your action
4. The system will:
   - Stop accepting new votes
   - Finalize all pending transactions
   - Calculate and publish results

**Behind the scenes**: Closing an election:
1. Updates the election status in the database
2. Calls the smart contract's closeElection function
3. Finalizes the vote tallying on the blockchain
4. Generates and stores the official results

---

## Technical Background

### Blockchain Integration

TrustVote integrates with the Ethereum blockchain to provide secure and transparent voting:

- **Smart Contracts**: Written in Solidity, they handle vote recording and counting
- **Web3.js**: JavaScript library that connects the frontend to the Ethereum blockchain
- **MetaMask**: Browser extension that manages user's Ethereum accounts and signs transactions

The system uses a dual-storage approach:
1. **Blockchain**: Stores actual votes and ensures immutability
2. **Database**: Stores user information, election metadata, and references to blockchain transactions

### Smart Contract Architecture

The TrustVote system uses two primary smart contracts:

1. **ElectionFactory Contract**:
   - Creates new Election contracts
   - Maintains a registry of all deployed elections
   - Manages global whitelisting of voters

2. **Election Contract**:
   - Specific to each election
   - Stores positions and candidates
   - Records votes
   - Manages election phases (init, voting, closed)
   - Counts votes and determines winners

The contracts implement a permission system to ensure only:
- Administrators can create elections and add candidates
- Whitelisted voters can cast votes
- The election owner can change election phases

### Vote Security and Anonymity

TrustVote ensures vote security through several mechanisms:

- **Blockchain Immutability**: Once cast, votes cannot be altered
- **Transaction Signing**: All votes require cryptographic signatures via MetaMask
- **One Vote Per Position**: Smart contracts enforce that each voter can only vote once per position
- **Whitelisting**: Only approved voters can participate in each election

While the blockchain is public, vote anonymity is maintained by:
- Storing only the wallet address, not the user's identity
- Using a reference ID system to disconnect votes from personal information
- Implementing zero-knowledge proofs for advanced anonymity (in development)

### Data Flow and Storage

When a user interacts with TrustVote, data flows through several systems:

1. **User Registration**:
   - User data → Backend API → Database
   - Email verification → User account activation

2. **Wallet Connection**:
   - MetaMask → Web3.js → Backend API → Database
   - Wallet address stored with user account

3. **Voting Process**:
   - Vote selection → Web3.js → MetaMask signing
   - Signed transaction → Ethereum network → Smart contract
   - Vote confirmation → Backend API → Database

4. **Results Calculation**:
   - Smart contract vote counts → Web3.js → Frontend
   - Visualization rendering → User display

---

## Troubleshooting

### Common Issues for Voters

#### Cannot Connect Wallet
- **Issue**: MetaMask not detecting or connecting to TrustVote
- **Solution**:
  1. Ensure MetaMask is installed and unlocked
  2. Check that you're using a supported browser
  3. Refresh the page and try again
  4. If problems persist, try disconnecting and reconnecting MetaMask

#### Transaction Failed
- **Issue**: Vote transaction fails to be confirmed
- **Solution**:
  1. Check your MetaMask has sufficient ETH for gas
  2. Ensure you're on the correct network
  3. Wait for network congestion to decrease
  4. Try setting a higher gas price in MetaMask

#### Not Whitelisted
- **Issue**: Receiving "Not whitelisted for this election" message
- **Solution**:
  1. Ensure your wallet is correctly connected
  2. Verify you're using the same wallet that was whitelisted
  3. Contact the election administrator to confirm your whitelist status

### Common Issues for Administrators

#### Cannot Deploy Election
- **Issue**: Election creation fails at contract deployment
- **Solution**:
  1. Check your admin wallet has sufficient ETH for deployment
  2. Verify all required fields are completed correctly
  3. Check network status and gas prices
  4. Try deploying with higher gas limits

#### Voter Whitelist Issues
- **Issue**: Unable to whitelist voters
- **Solution**:
  1. Verify the voter has registered and connected a wallet
  2. Check that you're entering the correct wallet address
  3. Ensure the election is still in initialization phase
  4. Try whitelisting in smaller batches

#### Results Not Displaying
- **Issue**: Election results not showing after closing
- **Solution**:
  1. Verify the election status is correctly set to "Closed"
  2. Check for pending transactions in MetaMask
  3. Wait for blockchain confirmation (can take several minutes)
  4. Refresh the browser and try again

### Technical Support

If you encounter issues not covered in this troubleshooting section:

1. **In-app Help**: Click the "Help" icon in the bottom-right corner
2. **Support Email**: Contact support@trustvote.example.com
3. **Knowledge Base**: Visit help.trustvote.example.com
4. **System Status**: Check status.trustvote.example.com for any ongoing issues

Include the following information when seeking support:
- Your username (do not share your password)
- Browser and version
- Description of the issue
- Screenshots of any error messages
- Transaction hash (if applicable)

---

## Glossary

- **Blockchain**: A distributed digital ledger that records transactions across multiple computers
- **Candidate**: An individual running for a position in an election
- **Election Contract**: A smart contract deployed specifically for one election
- **Gas**: The fee required to execute operations on the Ethereum network
- **MetaMask**: A cryptocurrency wallet browser extension that allows users to interact with the Ethereum blockchain
- **Position**: A role or office that candidates are competing for in an election
- **Smart Contract**: Self-executing contract with the terms directly written into code
- **Transaction Hash**: A unique identifier for a blockchain transaction
- **Wallet Address**: A unique identifier that allows a user to receive cryptocurrency
- **Whitelist**: A list of approved voters who are permitted to participate in an election
- **Web3**: The concept of a decentralized web built on blockchain technology
- **Zero-knowledge Proof**: A method by which one party can prove to another party that they know a value, without conveying any additional information

---

*This user manual is subject to updates as new features are added to the TrustVote system. For the latest version, please visit documentation.trustvote.example.com.*