# Trustvote

Trustvote is a decentralized electronic voting platform leveraging blockchain technology for secure and transparent elections. This guide will help you set up and run the project for the first time after cloning from GitHub.

---

## Prerequisites

- **Node.js** and **npm**
- **Python 3** and **virtualenv**
- **Ganache CLI** (for local Ethereum blockchain)
- **Truffle** (for smart contract development)
- **tmux on zsh** (optional, for managing multiple terminal sessions)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Trustvote.git
cd Trustvote
```

---

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

### 3. Set Up Python Backend

```bash
cd backend
python3 -m venv venv
source ./venv/bin/activate
pip install -r requirements.txt
```

---

### 4. Set Up Django Database

Run the following commands to set up the database and create a superuser account:

```bash
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py createsuperuser
```

Follow the prompts to set up your admin credentials.

---

### 5. Install Truffle and Ganache CLI Globally (if not already installed)

```bash
npm install -g truffle ganache-cli
```

---

### 6. Start Ganache (Local Blockchain)

```bash
ganache-cli -p 7545 -i 1337 -m "protect similar rain note absorb hen case unusual ability sniff fury"
```

---

### 7. Compile and Deploy Smart Contracts

```bash
truffle compile --all

rm ./frontend/src/contracts/Election.json
rm ./frontend/src/contracts/ElectionFactory.json

cp ./build/contracts/Election.json ./frontend/src/contracts/Election.json
cp ./build/contracts/ElectionFactory.json ./frontend/src/contracts/ElectionFactory.json

truffle migrate --reset --network development
```

**Important:**  
Copy the new `ElectionFactory` address from the migration output and update it in `./frontend/.env.local`.

---

### 8. Start the Backend Server

```bash
python3 manage.py runserver 0.0.0.0:8000
```

---

### 9. Start the Frontend Server

```bash
cd frontend
npm run serve
```

---

## Known Issues

1. **Ganache Restart Required:**  
   Always restart the Ganache server after each election creation and before candidate creation. Otherwise, candidate creation will return an `EVM revert error`.

2. **Full Project Restart for New Elections:**  
   When creating a new election after a previous one, stop all services and rerun the setup steps. Otherwise, you may encounter:  
   `web3.js:233 Deployment error: Error: ElectionCreated event not found in transaction receipt`.

---

## Tips

- Use `zsh` and `tmux` to manage the different services. Run `run_project_tmux.zsh` for an automated project startup every time after initial setup.