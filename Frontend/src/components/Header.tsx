import React, { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import {
  BrowserWalletProvider,
  WalletConnectProvider,
  WalletProvider,
} from "../wallet-connection";
import { Wallet, X, Smartphone, Chrome, ShieldCheck } from "lucide-react";
import "./Header.css";
import {
  CredentialStatements,
  HexString,
} from "@concordium/web-sdk";
import { WalletConnectionProps } from "@concordium/react-components";

interface HeaderProps {
  walletConnectionProps?: WalletConnectionProps; // Optional for future use
}

export const Header: React.FC<HeaderProps> = () => {
  const {
    provider,
    setProvider,
    connectedAccount,
    setConnectedAccount,
    setIsAgeVerified,
    ageVerificationStatus,
    setAgeVerificationStatus,
  } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Generate a random challenge for age verification
  const generateChallenge = (): HexString => {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("") as HexString;
  };

  // Calculate date 18 years ago in YYYYMMDD format
  const getMinimumAgeDate = (): string => {
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    const year = eighteenYearsAgo.getFullYear();
    const month = String(eighteenYearsAgo.getMonth() + 1).padStart(2, "0");
    const day = String(eighteenYearsAgo.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  // Verify user age using Zero-Knowledge Proof
  const verifyAge = async (walletProvider: WalletProvider) => {
    try {
      setAgeVerificationStatus("verifying");
      
      // Generate challenge
      const challenge = generateChallenge();
      
      // Calculate the maximum date of birth (18 years ago)
      const maxDob = getMinimumAgeDate();
      
      // Create credential statement for age verification
      // User must prove DOB is on or before maxDob (meaning they're 18+)
      const statement: CredentialStatements = [
        {
          statement: [
            {
              type: "AttributeInRange",
              attributeTag: "dob",
              lower: "19000101", // Reasonable lower bound
              upper: maxDob, // Must be born on or before this date
            },
          ],
          idQualifier: {
            type: "cred",
            issuers: [0, 1, 2, 3, 4, 5, 6], // Accept credentials from common identity providers (testnet & mainnet)
          },
        },
      ];

      console.log("Requesting age proof with max DOB:", maxDob);

      // Request verifiable presentation from wallet
      const proof = await walletProvider.requestVerifiablePresentation(
        challenge,
        statement
      );

      console.log("Age proof received:", proof);

      // Basic validation - check if proof exists
      if (proof && proof.type === "VerifiablePresentation") {
        setIsAgeVerified(true);
        setAgeVerificationStatus("verified");
        
        // Store verification in localStorage (expires in 24 hours)
        const verificationData = {
          account: walletProvider.connectedAccount,
          verified: true,
          timestamp: Date.now(),
        };
        localStorage.setItem("age_verification", JSON.stringify(verificationData));
        
        alert("✓ Age verification successful! You are 18 or older.");
        return true;
      } else {
        throw new Error("Invalid proof received");
      }
    } catch (error) {
      console.error("Age verification failed:", error);
      setIsAgeVerified(false);
      setAgeVerificationStatus("failed");
      
      alert(
        "Age verification failed. You must be 18 or older to use this gambling platform.\n\n" +
        "Please make sure you have a verified identity in your Concordium wallet."
      );
      
      // Disconnect wallet if age verification fails
      await handleDisconnect();
      return false;
    }
  };

  // Check if age verification is still valid from previous session
  const checkStoredVerification = (account: string): boolean => {
    try {
      const stored = localStorage.getItem("age_verification");
      if (!stored) return false;

      const data = JSON.parse(stored);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      // Check if verification is for same account and not expired
      if (
        data.account === account &&
        data.verified &&
        Date.now() - data.timestamp < twentyFourHours
      ) {
        setIsAgeVerified(true);
        setAgeVerificationStatus("verified");
        return true;
      }
      
      // Clear expired or invalid verification
      localStorage.removeItem("age_verification");
      return false;
    } catch (error) {
      console.error("Error checking stored verification:", error);
      return false;
    }
  };

  // Connect to selected wallet provider
  const connectProvider = async (walletProvider: WalletProvider) => {
    try {
      setIsConnecting(true);
      const account = await walletProvider.connect();
      console.log("Connected account:", account);
      
      if (account) {
        setConnectedAccount(account);
        setProvider(walletProvider);
        setShowWalletModal(false);
        
        // Check if we have a valid stored verification
        const hasStoredVerification = checkStoredVerification(account);
        
        if (!hasStoredVerification) {
          // Request age verification
          setAgeVerificationStatus("pending");
          
          // Small delay to ensure UI updates
          setTimeout(async () => {
            const verified = await verifyAge(walletProvider);
            if (!verified) {
              // If verification failed, connection is already disconnected
              console.log("Age verification required but failed");
            }
          }, 500);
        }
      }
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
      
      // Clear age verification state
      setIsAgeVerified(false);
      setAgeVerificationStatus(null);
      localStorage.removeItem("age_verification");
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
                {/* Age Verification Status Badge */}
                {ageVerificationStatus && (
                  <div
                    className={`verification-badge ${ageVerificationStatus}`}
                    title={
                      ageVerificationStatus === "verified"
                        ? "Age verified (18+)"
                        : ageVerificationStatus === "verifying"
                        ? "Verifying age..."
                        : ageVerificationStatus === "failed"
                        ? "Age verification failed"
                        : "Age verification pending"
                    }
                  >
                    <ShieldCheck
                      size={16}
                      className={ageVerificationStatus === "verified" ? "verified-icon" : ""}
                    />
                    {ageVerificationStatus === "verified" && <span>18+</span>}
                    {ageVerificationStatus === "verifying" && <span>Verifying...</span>}
                    {ageVerificationStatus === "pending" && <span>Pending</span>}
                    {ageVerificationStatus === "failed" && <span>Failed</span>}
                  </div>
                )}
                
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

