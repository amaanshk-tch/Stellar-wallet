import { useEffect, useState } from "react";
import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";
import * as StellarSdk from "stellar-sdk";
import "./App.css";

const server = new StellarSdk.Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

export default function App() {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        updateStatus("");
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const updateStatus = (msg, type = "") => {
    setStatus(msg);
    setStatusType(type);
  };


  const checkConnection = async () => {
    try {
      const ok = await isConnected();
      if (ok) {
        const key = await getAddress();
        if (key && key.address) {
          setConnected(true);
          setPublicKey(key.address);
          await fetchBalance(key.address);
          updateStatus("");
          return true;
        }
      }
    } catch (e) {
      console.log("Not connected");
    }
    setConnected(false);
    return false;
  };

  const connectWallet = async () => {
    updateStatus("");
    try {
      const isInstalled = await isConnected();
      if (!isInstalled) {
        updateStatus("Freighter extension not found. Please install it.", "error");
        return;
      }

      await requestAccess();
      const linked = await checkConnection();
      if (linked) {
        updateStatus("Connection successful!", "success");
      } else {
        updateStatus("Request denied", "error");
      }
    } catch (e) {
      console.error(e);
      setConnected(false);
      if (e.message === "Bad Request" || e.message === "Request rejected") {
        updateStatus("Request denied", "error");
      } else {
        updateStatus(`Connection failed: ${e.message || "Unknown error"}`, "error");
      }
    }
  };

  const sendTransaction = async () => {
    if (!recipient || !amount) {
      updateStatus("Please enter recipient address and amount.", "error");
      return;
    }

    if (parseFloat(amount) <= 0) {
      updateStatus("Amount must be greater than 0.", "error");
      return;
    }

    updateStatus("");
    setIsSending(true);
    setTxHash("");

    try {
      const sourceKey = await getAddress();
      const accountResponse = await server.loadAccount(sourceKey.address);
      const sourceAccount = new StellarSdk.Account(accountResponse.accountId(), accountResponse.sequenceNumber());

      console.log("Building transaction for account:", sourceAccount.accountId());
      console.log("Using network passphrase:", "Test SDF Network ; September 2015");

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: "Test SDF Network ; September 2015",
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: recipient,
            asset: StellarSdk.Asset.native(),
            amount: amount.toString(),
          })
        )
        .setTimeout(30)
        .build();

      console.log("Transaction built. Network:", transaction.networkPassphrase);
      console.log("Transaction XDR:", transaction.toXDR());

      const signedTx = await signTransaction(transaction.toXDR(), {
        network: "TESTNET",
        networkPassphrase: "Test SDF Network ; September 2015",
      });

      console.log("Freighter response received:", signedTx);

      if (signedTx) {
        const xdr = typeof signedTx === "string" ? signedTx : (signedTx.signedTxXdr || signedTx.signedTransaction);

        if (!xdr) {
          throw new Error("Failed to extract signed transaction from Freighter response");
        }

        console.log("Parsing signed XDR:", xdr);

        const tx = StellarSdk.TransactionBuilder.fromXDR(
          xdr,
          "Test SDF Network ; September 2015"
        );
        const result = await server.submitTransaction(tx);
        console.log("Transaction success:", result);
        setTxHash(result.hash);
        updateStatus("Transaction successful!", "success");
        await fetchBalance(sourceKey.address);
        setRecipient("");
        setAmount("");
      } else {
        updateStatus("Transaction rejected by user.", "error");
      }
    } catch (e) {
      console.error(e);
      updateStatus(`Transaction failed: ${e.message || "Unknown error"}`, "error");
    } finally {
      setIsSending(false);
    }
  };

  const disconnectWallet = () => {
    setConnected(false);
    setPublicKey("");
    setBalance(null);
    updateStatus("");
  };

  const fetchBalance = async (key) => {
    const account = await server.loadAccount(key);
    const xlm = account.balances.find(
      (b) => b.asset_type === "native"
    );
    setBalance(xlm.balance);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    updateStatus("Hash copied to clipboard!", "success");
  };

  const closeStatus = () => updateStatus("");

  return (
    <div className="app">
      <div className="background-glow" />
      <div className="card">
        <div className="card-header">
          {status && (
            <div className={`status ${statusType}`}>
              <span className="status-text">{status}</span>
              <button className="status-close" onClick={closeStatus} aria-label="Close notification">
                &times;
              </button>
            </div>
          )}
          <h1 className="title">LumenSplit</h1>
        </div>

        {!connected ? (
          <button className="button" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <>
            <div className="address-container">
              <div className="address">{publicKey}</div>
              <button
                className="disconnect-link"
                onClick={disconnectWallet}
              >
                Disconnect Wallet
              </button>
            </div>
            <div className="balance">
              Balance: <strong>{balance} XLM</strong>
            </div>


            <div className="transaction-form">
              <h3>Send XLM</h3>
              <input
                type="text"
                placeholder="Recipient Address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="input"
              />
              <input
                type="number"
                placeholder="Amount (XLM)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
                min="0"
              />
              <button
                className="button"
                onClick={sendTransaction}
                disabled={isSending}
              >
                {isSending ? "Sending..." : "Send XLM"}
              </button>
            </div>

            {txHash && (
              <div className="success-message">
                <h4 className="transaction-status-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Transaction Successful!
                </h4>
                <div className="success-header">
                  <p>Transaction ID:</p>
                  <button
                    className="copy-button"
                    onClick={() => copyToClipboard(txHash)}
                    title="Copy hash"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy
                  </button>
                </div>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hash-link"
                >
                  {txHash.substring(0, 16)}...{txHash.substring(txHash.length - 16)}
                </a>
              </div>
            )}
          </>
        )}

        <div className="footer-actions">
          <div className="footer">Split bills, not friendships.</div>
        </div>
      </div>
    </div>
  );
}
