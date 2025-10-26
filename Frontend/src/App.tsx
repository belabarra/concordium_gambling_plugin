import React from "react";
import { Header } from "./components/Header";
import { HorseRacing } from "./components/HorseRacing";
import { WalletContextProvider } from "./context/WalletContext";
import { UserContextProvider } from "./context/UserContext";
import "./App.css";

/**
 * Main App Component
 *
 * CONTEXT PROVIDERS EXPLAINED:
 * We wrap the app with two context providers:
 * 1. WalletContextProvider - Manages wallet connection and age verification
 * 2. UserContextProvider - Manages user registration and gambling sessions
 *
 * NESTING ORDER MATTERS:
 * - WalletContext is outer because UserContext needs wallet info
 * - Components inside can access both contexts via hooks
 */
function App() {
  return (
    <WalletContextProvider>
      <UserContextProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <HorseRacing />
          </main>
        </div>
      </UserContextProvider>
    </WalletContextProvider>
  );
}

export default App;

