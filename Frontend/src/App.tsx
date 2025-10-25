import React from "react";
import { Header } from "./components/Header";
import { HorseRacing } from "./components/HorseRacing";
import { WalletContextProvider } from "./context/WalletContext";
import { 
  WithWalletConnector, 
  WalletConnectionProps,
  TESTNET 
} from "@concordium/react-components";
import "./App.css";

function AppContent(props: WalletConnectionProps) {
  return (
    <WalletContextProvider>
      <div className="app">
        <Header walletConnectionProps={props} />
        <main className="main-content">
          <HorseRacing walletConnectionProps={props} />
        </main>
      </div>
    </WalletContextProvider>
  );
}

function App() {
  return (
    <WithWalletConnector network={TESTNET}>
      {(props) => <AppContent {...props} />}
    </WithWalletConnector>
  );
}

export default App;

