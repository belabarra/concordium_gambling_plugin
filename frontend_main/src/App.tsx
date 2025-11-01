import React from "react";
import { Header } from "./components/Header";
import { HorseRacing } from "./components/HorseRacing";
import { WalletContextProvider } from "./context/WalletContext";
import "./App.css";

function App() {
  return (
    <WalletContextProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <HorseRacing />
        </main>
      </div>
    </WalletContextProvider>
  );
}

export default App;

