import { useState } from "react";
import { Header } from "./components/Header";
import { HorseRacing } from "./components/HorseRacing";
import { ResponsibleGamblingTools } from "./components/ResponsibleGamblingTools";
import { WalletContextProvider } from "./context/WalletContext";
import { ResponsibleGamblingProvider } from "./context/ResponsibleGamblingContext";
import { 
  WithWalletConnector, 
  WalletConnectionProps,
  TESTNET 
} from "@concordium/react-components";
import "./App.css";

function AppContent(props: WalletConnectionProps) {
  const [activeView, setActiveView] = useState<'racing' | 'rg-tools'>('racing');

  return (
    <WalletContextProvider>
      <ResponsibleGamblingProvider>
        <div className="app">
          <Header walletConnectionProps={props} />
          <nav className="app-nav">
            <button 
              className={activeView === 'racing' ? 'active' : ''}
              onClick={() => setActiveView('racing')}
            >
              🐎 Horse Racing
            </button>
            <button 
              className={activeView === 'rg-tools' ? 'active' : ''}
              onClick={() => setActiveView('rg-tools')}
            >
              🛡️ Responsible Gambling
            </button>
          </nav>
          <main className="main-content">
            {activeView === 'racing' && <HorseRacing walletConnectionProps={props} />}
            {activeView === 'rg-tools' && <ResponsibleGamblingTools />}
          </main>
        </div>
      </ResponsibleGamblingProvider>
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

