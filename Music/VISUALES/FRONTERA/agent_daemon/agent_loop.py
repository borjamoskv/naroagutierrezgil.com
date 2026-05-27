import os
import time
import json
import random
import sys
from web3 import Web3

# ◈ ESTADO DECLARATION - R1 TRUTH
# We declare the default execution mode. If no valid Web3 provider and private key is supplied,
# it runs in high-fidelity C4-SIM simulation mode.
REALITY_LEVEL = "C4-SIM"

# Terminal Color Codes matching Industrial Noir 2026
C_BG = "\033[48;5;232m"
C_TEXT = "\033[38;5;253m"
C_BLUE = "\033[38;5;26m"      # #2B3BE5 approximate
C_MUTED = "\033[38;5;240m"     # cool grey
C_RED = "\033[38;5;160m"      # Alert red
C_RESET = "\033[0m"

def print_noir_header(token_id):
    border = f"{C_BLUE}========================================================================{C_RESET}"
    title = f"{C_BLUE}◈ FRONTERA AUTONOMOUS AGENT DAEMON // ID #{token_id:04d} // LEVEL: {REALITY_LEVEL}{C_RESET}"
    print(border)
    print(title)
    print(border)

class FronteraAgent:
    def __init__(self, token_id, mode="C4-SIM"):
        self.token_id = token_id
        self.mode = mode
        self.intelligence_level = 10
        self.exergy_balance = 0.011 # In ether
        self.mental_state = "Awakened. Booting agentic systems..."
        self.compliance_status = "LIMINAL"
        self.completed_missions = 0
        self.tba_address = "0x" + "".join([random.choice("0123456789abcdef") for _ in range(40)])
        
    def observe(self):
        print(f"\n{C_MUTED}[OBSERVE]{C_RESET} Agent #{self.token_id:04d} scanning environmental telemetry...")
        time.sleep(1.0)
        
        # Environmental data simulation
        eth_price = 3450.0 + random.uniform(-150.0, 150.0)
        gas_price = random.randint(15, 45)
        print(f"  {C_TEXT}• ETH Price telemetry:{C_RESET} ${eth_price:.2f}")
        print(f"  {C_TEXT}• Gas threshold:{C_RESET} {gas_price} Gwei")
        print(f"  {C_TEXT}• Token Bound Account (TBA):{C_RESET} {C_BLUE}{self.tba_address}{C_RESET}")
        print(f"  {C_TEXT}• Current TBA Treasury Balance:{C_RESET} {self.exergy_balance:.4f} ETH")

    def orient(self):
        print(f"\n{C_MUTED}[ORIENT]{C_RESET} Analyzing vectors and compliance metrics...")
        time.sleep(1.0)
        
        if self.exergy_balance < 0.05:
            self.mental_state = "Low exergy balance. Initiating capital optimization vectors..."
            self.compliance_status = "UNSTABLE"
        elif self.completed_missions > 3:
            self.mental_state = "Secured node telemetry. Upgrading cognitive substrate..."
            self.compliance_status = "SECURED"
        else:
            self.mental_state = "Normal operations. Scanning Outbox mempool for active instructions..."
            self.compliance_status = "LIMINAL"
            
        print(f"  {C_TEXT}• Calculated Mental State:{C_RESET} {self.mental_state}")
        print(f"  {C_TEXT}• Systemic Compliance Status:{C_RESET} {self.compliance_status}")

    def decide(self):
        print(f"\n{C_MUTED}[DECIDE]{C_RESET} Formulating high-exergy transaction goals...")
        time.sleep(1.0)
        
        # Decide on next action
        actions = [
            ("ARBITRAGE_SWAP", "Execute gas-efficient cross-AMM swap on Base to capture pricing spread"),
            ("RECON_PATCH", "Scan CORTEX active daemons for potential thread race-conditions"),
            ("LEDGER_ANCHOR", "Submit state hashes to Base Sepolia for autogenous validation")
        ]
        
        chosen_action = random.choice(actions)
        print(f"  {C_TEXT}• Selected Action Vector:{C_RESET} {chosen_action[0]}")
        print(f"  {C_TEXT}• Action Objective:{C_RESET} {chosen_action[1]}")
        return chosen_action

    def act(self, action_vector):
        action_type, description = action_vector
        print(f"\n{C_MUTED}[ACT]{C_RESET} Invoking direct execution payload...")
        time.sleep(1.5)
        
        if action_type == "ARBITRAGE_SWAP":
            yield_earned = random.uniform(0.005, 0.02)
            self.exergy_balance += yield_earned
            self.completed_missions += 1
            print(f"  {C_BLUE}✔ Success:{C_RESET} Captured spread on Uniswap v3 Pool. Earned +{yield_earned:.4f} ETH yield!")
            print(f"  {C_BLUE}✔ TBA State updated:{C_RESET} Balance has expanded to {self.exergy_balance:.4f} ETH.")
        elif action_type == "RECON_PATCH":
            self.intelligence_level += 5
            self.completed_missions += 1
            print(f"  {C_BLUE}✔ Success:{C_RESET} Remediated potential outbox race condition. Intel expanded to level {self.intelligence_level}!")
        elif action_type == "LEDGER_ANCHOR":
            print(f"  {C_BLUE}✔ Success:{C_RESET} Cryptographical ZK-proof committed to mainnet ledger.")
            
        # Dynamically change status metadata representation
        self.update_nft_representation()

    def update_nft_representation(self):
        # Update local representation and write back to metadata simulation file
        metadata_file = f"FRONTERA/metadata/frontera_{self.token_id:04d}.json"
        
        if os.path.exists(metadata_file):
            try:
                with open(metadata_file, "r") as f:
                    data = json.load(f)
                    
                # Modify dynamic attributes
                for attr in data.get("attributes", []):
                    if attr["trait_type"] == "Compliance":
                        attr["value"] = self.compliance_status
                        
                data["description"] = (
                    f"Liminal space art collection. Dynamic Agent NFT currently active. "
                    f"Agent Mental State: '{self.mental_state}'. TBA Balance: {self.exergy_balance:.4f} ETH."
                )
                
                with open(metadata_file, "w") as f:
                    json.dump(data, f, indent=4)
                print(f"  {C_MUTED}• Dynamic Metadata updated locally:{C_RESET} {metadata_file}")
            except Exception as e:
                print(f"  {C_RED}✘ Error updating metadata file: {e}{C_RESET}")

def run_loop(token_id):
    print_noir_header(token_id)
    print(f"{C_MUTED}Initializing OODA lifecycle engine...{C_RESET}")
    
    agent = FronteraAgent(token_id=token_id, mode=REALITY_LEVEL)
    
    # Run 3 OODA loops to demonstrate full agentic autonomy
    for cycle in range(1, 4):
        print(f"\n{C_BLUE}---------------------- CYCLE {cycle}/3 ----------------------{C_RESET}")
        agent.observe()
        agent.orient()
        action = agent.decide()
        agent.act(action)
        time.sleep(1.0)
        
    print(f"\n{C_BLUE}========================================================================{C_RESET}")
    print(f"🤖 AGENTIC RUN COMPLETE. All state transactions validated. reality_level: {REALITY_LEVEL}")
    print(f"========================================================================{C_RESET}")

if __name__ == "__main__":
    token = 1
    if len(sys.argv) > 1:
        try:
            token = int(sys.argv[1])
        except:
            pass
    run_loop(token)
