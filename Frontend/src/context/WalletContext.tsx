import React, { createContext, useContext, useState, ReactNode } from "react";
import { WalletProvider } from "../wallet-connection";

interface WalletContextType {
  provider: WalletProvider | undefined;
  setProvider: (provider: WalletProvider | undefined) => void;
  connectedAccount: string | undefined;
  setConnectedAccount: (account: string | undefined) => void;
  isAgeVerified: boolean;
  setIsAgeVerified: (verified: boolean) => void;
  ageVerificationStatus: "pending" | "verifying" | "verified" | "failed" | null;
  setAgeVerificationStatus: (status: "pending" | "verifying" | "verified" | "failed" | null) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [provider, setProvider] = useState<WalletProvider | undefined>(
    undefined
  );
  const [connectedAccount, setConnectedAccount] = useState<string | undefined>(
    undefined
  );
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(false);
  const [ageVerificationStatus, setAgeVerificationStatus] = useState<
    "pending" | "verifying" | "verified" | "failed" | null
  >(null);

  return (
    <WalletContext.Provider
      value={{ 
        provider, 
        setProvider, 
        connectedAccount, 
        setConnectedAccount,
        isAgeVerified,
        setIsAgeVerified,
        ageVerificationStatus,
        setAgeVerificationStatus
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletContextProvider");
  }
  return context;
};

