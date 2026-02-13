**Stellar Wallet:**

A decentralized expense-splitting app built on the Stellar Testnet.
Stellar Wallet lets groups track shared expenses and settle balances using Stellar testnet assets in a transparent, super fast, and low-fee environment.

**Overview:**

Stellar Wallet enables users to:
Create shared expense groups
Add and split expenses between members
Track who owes whom
Settle balances using Stellar testnet payments
View transaction history recorded on-chain
All settlements are executed on the Stellar Testnet, making it ideal for experimentation and learning without real financial risk.

**Built on Stellar:**

Stellar Development Foundation maintains the Stellar network, a decentralized blockchain designed for fast, low-cost financial transactions.
Stellar Testnet is a testing environment that mirrors the main network but uses test tokens instead of real assets.

**Why Stellar?**

⚡ Fast finality (3–5 seconds)

💸 Very low transaction fees

🌍 Designed for global payments

🧪 Safe sandbox via Testnet

🛠 How It Works

Users create a group.
Members are added with their Stellar testnet public keys.
Expenses are recorded and split equally (or custom split).
The app calculates net balances.
Users settle debts via Stellar testnet transactions.
Transactions are confirmed on-chain.

🏗 Architecture

Frontend: React+Vite
Blockchain Layer: Stellar Testnet
Wallet Integration: Freighter.

**Installation:**

Ensure you have a Freighter wallet extension installed
Check that you're on Testnet (not Mainnet)
Check browser console for errors
<img width="303" height="229" alt="image" src="https://github.com/user-attachments/assets/29bf3ec2-91c9-4e94-80c0-94fd73f53e29" />

**Using the Testnet:**

To use Freighter Wallet:
Generate a Stellar testnet account.
Fund it using the Stellar Friendbot:
Add your public key to the app.
Start splitting expenses.

**Check transaction:**

Copy your transaction hash
Visit: https://lab.stellar.org/transaction/dashboard?$=network$id=testnet&label=Testnet&horizonUrl=https:////horizon-testnet.stellar.org&rpcUrl=https:////soroban-testnet.stellar.org&passphrase=Test%20SDF%20Network%20/;%20September%202015;;
Paste your hash and click Load transaction
Verify the transaction


**Future Improvements:**

Smart contract-based automation (Soroban)
Multi-asset support
