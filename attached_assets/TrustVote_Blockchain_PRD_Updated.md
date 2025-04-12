
# 🗳️ TrustVote — Product Requirements Document (PRD) (Blockchain-Enhanced Version)

## 📌 Project Overview
**TrustVote** is a decentralized electronic voting system built using Vue.js (frontend), Django (backend), and a blockchain-based smart contract system on Ethereum. It ensures end-to-end integrity of voting through verifiable, tamper-proof smart contract logic, leveraging MetaMask, Web3.js, and Solidity contracts for secure, transparent elections.

---

## 🎯 Goals & Objectives
- Ensure **trustless voting** using blockchain and smart contracts.
- Securely identify and whitelist eligible voters.
- Prevent multiple votes and manipulation through on-chain enforcement.
- Allow admins to manage elections through a hybrid (Django + Ethereum) backend.
- Provide real-time result visibility via smart contract reads.

---

## 👥 Target Users
- **Voters**: Students eligible to vote using MetaMask.
- **Admins**: Election officials who manage users, elections, and candidate data.

---

## 🏗️ Tech Stack

| Layer            | Technology                             |
|------------------|----------------------------------------|
| Frontend         | Vue.js, Bootstrap CSS, Vue Router      |
| Backend          | Django + Django REST Framework (DRF)   |
| Database         | Django builtin SQLite3                 |
| Smart Contracts  | Solidity                               |
| Dev Framework    | Truffle, Ganache                       |
| Blockchain       | Ethereum (local & testnet)             |
| Wallet           | MetaMask                               |
| Web3 Bridge      | Web3.js                                |

---

## 🔐 Authentication Flow

### Voter Registration
- User registers via frontend and is saved in Django.
- Admin verifies and whitelists voter by updating the contract.

### Login
- User logs in with **MetaMask** wallet.
- Off-chain authentication (student ID) links to MetaMask address.

---

## 📲 Core User Flows

### 1. Voter Flow
- Register → Admin Approval → Connect MetaMask → View Elections → Cast Vote → View Results

### 2. Admin Flow
- Login → Add/Verify Users → Deploy Election → Whitelist Voters → Monitor Results

---

## ✅ Voter Functionality

| Feature             | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| MetaMask Connect    | Voter signs in with MetaMask                                                |
| Whitelist Check     | Contract confirms voter is allowed to vote                                  |
| Voting Page         | Shows candidates and positions                                              |
| Cast Vote           | On-chain transaction sent via Web3 to contract                              |
| Vote Success Page   | Shows blockchain confirmation, timestamp, and selection                     |
| View Results        | Reads on-chain tally via `getResults()` only after election has ended       |

---

## 🧑‍💼 Admin Functionality

| Feature               | Description                                                           |
|-----------------------|-----------------------------------------------------------------------|
| Dashboard Tabs        | Manage Elections, Candidates, Voters, Results                         |
| Add/Edit Elections    | Also deploys election smart contracts                                 |
| Add Candidates        | Updates both Django and contract state                                |
| Whitelist Voters      | Calls contract to approve voter addresses                             |
| Election Phase Mgmt   | Contract controlled phases: `Init`, `Voting`, `Closed`                |
| View Live Results     | Uses Web3.js to read from contract directly                           |

---

## 🧱 Blockchain & Security

| Feature                 | Description                                                      |
|-------------------------|------------------------------------------------------------------|
| Smart Contracts         | Enforces voting logic and state changes                         |
| MetaMask                | Used for voter identity and transaction signing                 |
| Web3.js                 | Frontend bridge to smart contracts                              |
| Truffle + Ganache       | Dev environment for testing contracts                           |
| Vote Immutability       | Votes recorded on-chain, cannot be altered                      |
| No Double Voting        | Contract restricts users to vote only once                      |

---

## 🖼️ UI/UX Design Goals

- MetaMask-based interaction for voting
- Responsive admin dashboard with election management
- Feedback on voting status (confirmed by transaction hash)
- Animated success screens for vote confirmations

---

## 🗳️ Smart Contract Features

- `ElectionFactory.sol` to deploy new elections
- `Election.sol` to manage:
  - Voter whitelist
  - Vote casting per position
  - Candidate registration
  - Phase management (`Init`, `Voting`, `Closed`)
- `getWinner()` and `getResults()` public views

---

## 🗂️ Data Structures

### ✅ On-Chain Voter Data
```solidity
mapping(address => bool) public hasVoted;
mapping(address => bool) public isWhitelisted;
```

### ✅ Vote Record Format
```json
{
  "electionId": 1,
  "positionId": 101,
  "candidateId": 201,
  "wallet": "0xabc123...",
  "timestamp": "2025-04-11T13:00:00Z"
}
```

### ✅ Election Format
```json
{
  "electionId": 1,
  "title": "2025 Student Council Elections",
  "description": "Annual elections for key student council positions.",
  "startTime": "2025-04-15T08:00:00Z",
  "endTime": "2025-04-15T20:00:00Z",
  "status": "Voting",
  "positions": [
    {
      "positionId": 101,
      "title": "President",
      "candidates": [201, 202]
    },
    {
      "positionId": 102,
      "title": "Vice President",
      "candidates": [203, 204]
    }
  ],
  "parties": [
    {
      "partyId": 1,
      "name": "Unity Party",
      "logoUrl": "/logos/unity.png"
    },
    {
      "partyId": 2,
      "name": "Green Future",
      "logoUrl": "/logos/green-future.png"
    }
  ]
}
```

### ✅ Candidate Format
```json
{
  "candidateId": 201,
  "name": "Jane Doe",
  "positionId": 101,
  "electionId": 1,
  "partyId": 1,
  "bio": "3rd-year Computer Science student",
  "manifesto": "Enhance campus sustainability and communication.",
  "photoUrl": "/candidates/jane.jpg",
  "wallet": "0xabc123..."
}
```

---

## 🗓️ Timeline / Milestones

| Phase               | Task Set                                 | Status         |
|---------------------|------------------------------------------|----------------|
| Phase 1             | Frontend Setup + Routing                 | ⏳ Upcoming    |
| Phase 2             | Admin Dashboard + Election Mgmt UI       | ⏳ Upcoming    |
| Phase 3             | Smart Contract Design & Deployment       | ⏳ Upcoming    |
| Phase 4             | Web3.js + MetaMask Integration           | ⏳ Upcoming    | 
| Phase 5             | Final QA + Blockchain Audit + UI Polish  | ⏳ Upcoming    |

---

## 🧪 Testing & Validation

- Truffle unit tests for smart contracts
- Frontend tests for form and UI integrity
- Manual QA of transaction flows on Ganache & testnets
- Voter registration and access control validations

---

## 📦 Deliverables

- Full-stack blockchain voting system with:
  - MetaMask login
  - Smart contract-based vote logic
  - Admin dashboard
  - Blockchain-recorded results

---

## 💡 Future Enhancements

- QR code or mobile-based voter registration
- zk-SNARKs to enable anonymous voting
- DAO-style token-based elections
- Biometric verification on registration
