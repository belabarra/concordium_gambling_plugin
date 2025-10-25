import React from "react";
import { Header } from "./components/Header";
import { WalletContextProvider } from "./context/WalletContext";
import "./App.css";

function App() {
  return (
    <WalletContextProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <div className="content-container">
            <h2>Welcome to Concordium Gambling dApp</h2>
            <p>Connect your wallet to get started!</p>
          </div>
        </main>
      </div>
    </WalletContextProvider>
  );
}

export default App;

