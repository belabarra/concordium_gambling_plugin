import React, { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import {
  BrowserWalletProvider,
  WalletConnectProvider,
  WalletProvider,
} from "../wallet-connection";
import { Wallet, X, Smartphone, Chrome } from "lucide-react";
import "./Header.css";

export const Header: React.FC = () => {
  const { provider, setProvider, connectedAccount, setConnectedAccount } =
    useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Connect to selected wallet provider
  const connectProvider = async (walletProvider: WalletProvider) => {
    try {
      setIsConnecting(true);
      const account = await walletProvider.connect();
      console.log("Connected account:", account);
      if (account) {
        setConnectedAccount(account);
        setShowWalletModal(false);
      }
      setProvider(walletProvider);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      alert("Failed to connect to wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      await provider?.disconnect?.();
      provider?.removeAllListeners();
      setProvider(undefined);
      setConnectedAccount(undefined);
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  };

  // Listen for account changes
  useEffect(() => {
    try {
      const handleAccountChange = (newAccount: any) => {
        setConnectedAccount(newAccount);
      };

      provider?.on("accountChanged", handleAccountChange);

      return () => {
        provider?.off("accountChanged", handleAccountChange);
      };
    } catch (error) {
      console.error("Error:", error);
    }
  }, [provider, setConnectedAccount]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (provider) {
        provider?.disconnect?.().then(() => provider.removeAllListeners());
      }
    };
  }, [provider]);

  // Format account address for display
  const formatAccount = (account: string) => {
    if (account.length <= 12) return account;
    return `${account.substring(0, 6)}...${account.substring(account.length - 6)}`;
  };

  return (
    <>
      <header className="app-header">
        <div className="header-container">
          <div className="header-left">
            <h1 className="app-title">Concordium Gambling dApp</h1>
          </div>
          <div className="header-right">
            {connectedAccount ? (
              <div className="wallet-info">
                <span className="account-address">
                  {formatAccount(connectedAccount)}
                </span>
                <button
                  onClick={handleDisconnect}
                  className="disconnect-button"
                  title="Disconnect wallet"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="connect-button"
                disabled={isConnecting}
              >
                <Wallet size={18} />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <div className="modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Connect your wallet</h2>
              <button
                onClick={() => setShowWalletModal(false)}
                className="modal-close"
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              {/* Browser Wallet Option */}
              <div
                onClick={async () => {
                  if (!isConnecting) {
                    connectProvider(await BrowserWalletProvider.getInstance());
                  }
                }}
                className={`wallet-option ${isConnecting ? "disabled" : ""}`}
              >
                <div className="wallet-icon">
                  <Chrome size={32} />
                </div>
                <div className="wallet-info-text">
                  <h3>Browser Wallet</h3>
                  <p>Connect using Concordium Browser Wallet extension</p>
                </div>
              </div>

              {/* Mobile Wallet Option */}
              <div
                onClick={async () => {
                  if (!isConnecting) {
                    connectProvider(await WalletConnectProvider.getInstance());
                  }
                }}
                className={`wallet-option ${isConnecting ? "disabled" : ""}`}
              >
                <div className="wallet-icon">
                  <Smartphone size={32} />
                </div>
                <div className="wallet-info-text">
                  <h3>Mobile Wallet</h3>
                  <p>Connect using Concordium Mobile Wallet via WalletConnect</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

