#!/bin/zsh

set -e

SESSION="trustvote"
ENV_FILE="./frontend/.env.local"
TEMP_LOG="./migration_output.log"
GANACHE_CMD="ganache-cli -p 7545 -i 1337 -m 'protect similar rain note absorb hen case unusual ability sniff fury'"

print_msg() {
  echo "-----------------------------"
  echo "$1"
  echo "-----------------------------"
}

change_dir_if_needed() {
  echo "[ \"\$(basename \\\"\\\$PWD\\\")\" != \"$1\" ] && cd $1"
}

# Rename tmux windows for clarity
print_msg "✏ Renaming tmux windows..."
tmux rename-window -t "$SESSION:0" "frontend"
tmux rename-window -t "$SESSION:1" "backend"
tmux rename-window -t "$SESSION:2" "ganache"
tmux rename-window -t "$SESSION:3" "truffle"
tmux rename-window -t "$SESSION:4" "block-explorer"

# Start each service in its window
print_msg "📤 Sending startup commands to tmux windows..."

# Window 0 - Frontend
tmux select-window -t "${SESSION}:frontend"
tmux send-keys -t "${SESSION}:frontend" "$(change_dir_if_needed frontend); npm run serve" C-m

# Window 1 - Backend
tmux select-window -t "${SESSION}:backend"
tmux send-keys -t "${SESSION}:backend" "$(change_dir_if_needed backend); [ -z "$VIRTUAL_ENV" ] && source ./venv/bin/activate; python3 manage.py runserver 0.0.0.0:8000" C-m

# Window 2 - Ganache CLI
tmux select-window -t "${SESSION}:ganache"
tmux send-keys -t "${SESSION}:ganache" "$GANACHE_CMD" C-m

# Window 3 - Truffle
tmux select-window -t "${SESSION}:truffle"
print_msg "⚙ Running Truffle migration and capturing output..."
tmux send-keys -t "${SESSION}:truffle" "truffle compile --all && \
rm -f ./frontend/src/contracts/Election.json ./frontend/src/contracts/ElectionFactory.json && \
cp ./build/contracts/Election.json ./frontend/src/contracts/Election.json && \
cp ./build/contracts/ElectionFactory.json ./frontend/src/contracts/ElectionFactory.json && \
truffle migrate --reset --network development | tee $TEMP_LOG" C-m

# Window 4 - Block Explorer
tmux select-window -t "${SESSION}:block-explorer"
tmux send-keys -t "${SESSION}:block-explorer" "$(change_dir_if_needed ganache-cli-block-explorer); go run router.go rpcRequestGo.go" C-m
tmux select-window -t "${SESSION}:5"

# Wait for Truffle to complete
print_msg "⏳ Waiting for Truffle migration to complete..."
sleep 2  # Adjust as needed for your machine

# Extract contract address
# ADDRESS=$(grep -A 1 "ElectionFactory" $TEMP_LOG | grep "contract address" | awk '{print $4}')
print_msg "📌 Extracting ElectionFactory address..."
ADDRESS=$(grep -oP 'ElectionFactory deployed at \K0x[a-fA-F0-9]+' $TEMP_LOG)

if [[ -z "$ADDRESS" ]]; then
  echo "❌ Could not extract ElectionFactory address from migration log."
  exit 1
fi

print_msg "✅ Detected ElectionFactory address: $ADDRESS"

# Update .env.local
if grep -q "^VUE_APP_ELECTION_FACTORY_ADDRESS=" "$ENV_FILE"; then
#   sed -i '' "s|^VUE_APP_ELECTION_FACTORY_ADDRESS=.*|VUE_APP_ELECTION_FACTORY_ADDRESS=$ADDRESS|" "$ENV_FILE"
    sed -i "s|^VUE_APP_ELECTION_FACTORY_ADDRESS=.*|VUE_APP_ELECTION_FACTORY_ADDRESS=$ADDRESS|" "$ENV_FILE"
else
  echo "VUE_APP_ELECTION_FACTORY_ADDRESS=$ADDRESS" >> "$ENV_FILE"
fi

print_msg "✅ Updated $ENV_FILE with new address."

# Restart Frontend
print_msg "🔁 Restarting frontend (window: frontend)..."
tmux select-window -t "${SESSION}:frontend"
tmux send-keys -t "${SESSION}:frontend" C-c
sleep 2
tmux send-keys -t "${SESSION}:frontend" "npm run serve" C-m

# Restart Ganache CLI
print_msg "🔁 Restarting Ganache CLI (window: ganache)..."
tmux select-window -t "${SESSION}:ganache"
tmux send-keys -t "${SESSION}:ganache" C-c
sleep 2
tmux send-keys -t "${SESSION}:ganache" "$GANACHE_CMD" C-m

rm -f "$TEMP_LOG"
tmux select-window -t "${SESSION}:5"
sleep 8
print_msg "✅ All tmux windows are renamed and all services are up!"
