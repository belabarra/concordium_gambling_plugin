import EventEmitter from "events";
import { detectConcordiumProvider, WalletApi } from "@concordium/browser-wallet-api-helpers";
import {
  serializeTypeValue,
  toBuffer,
  HexString,
  CredentialStatements,
  VerifiablePresentation,
  AccountAddress,
  AccountTransactionType,
  AccountTransactionHeader,
  AccountTransactionPayload,
} from "@concordium/web-sdk";
import SignClient from "@walletconnect/sign-client";
import type { SessionTypes } from "@walletconnect/sign-client";
import QRCodeModal from "@walletconnect/qrcode-modal";

// Abstract wallet provider class
export abstract class WalletProvider extends EventEmitter {
  connectedAccount: string | undefined;

  // Connect to the wallet and return the selected account
  abstract connect(): Promise<string | undefined>;

  // Optional method to disconnect from the wallet
  disconnect?(): Promise<void>;

  // Request a ZK proof from the wallet
  abstract requestVerifiablePresentation(
    challenge: HexString,
    statement: CredentialStatements,
  ): Promise<VerifiablePresentation>;

  // Sign and send transaction
  abstract signAndSendTransaction(
    accountAddress: AccountAddress.Type,
    type: AccountTransactionType,
    payload: AccountTransactionPayload,
    header: AccountTransactionHeader
  ): Promise<string>;

  // Update state and emit event when account changes
  protected onAccountChanged(new_account: string | undefined) {
    this.connectedAccount = new_account;
    this.emit("accountChanged", new_account);
  }
}

// Browser Wallet Provider Implementation
let browserWalletInstance: BrowserWalletProvider | undefined;

export class BrowserWalletProvider extends WalletProvider {
  // Private reference to the wallet API
  constructor(private provider: WalletApi) {
    super();
    // Set up event listeners for account changes
    provider.on("accountChanged", (account) => super.onAccountChanged(account));
    provider.on("accountDisconnected", async () => {
      // When disconnected, check if there's another selected account
      super.onAccountChanged(
        (await provider.getMostRecentlySelectedAccount()) ?? undefined
      );
    });
  }

  // Singleton pattern - ensure only one instance exists
  static async getInstance() {
    if (browserWalletInstance === undefined) {
      const provider = await detectConcordiumProvider();
      browserWalletInstance = new BrowserWalletProvider(provider);
    }
    return browserWalletInstance;
  }

  // Connect to the browser wallet
  async connect(): Promise<string | undefined> {
    // Request accounts and update state
    const new_connected_account = (await this.provider.requestAccounts())[0];
    super.onAccountChanged(new_connected_account);
    return new_connected_account;
  }

  // Request a verifiable presentation (ZK proof) from the browser wallet
  async requestVerifiablePresentation(
    challenge: HexString,
    statement: CredentialStatements,
  ): Promise<VerifiablePresentation> {
    return await this.provider.requestVerifiablePresentation(
      challenge,
      statement,
    );
  }

  // Sign and send transaction through browser wallet
  async signAndSendTransaction(
    accountAddress: AccountAddress.Type,
    type: AccountTransactionType,
    payload: AccountTransactionPayload,
    header: AccountTransactionHeader
  ): Promise<string> {
    // Browser wallet API expects specific format
    const txHash = await this.provider.sendTransaction(
      AccountAddress.toBase58(accountAddress),
      type,
      payload as any,
      header as any
    );
    return txHash;
  }
}

// Mobile Wallet (WalletConnect) Provider Implementation
let walletConnectInstance: WalletConnectProvider | undefined;

// WalletConnect error type checking
function isWalletConnectError(e: any): e is { code: number; message: string } {
  return typeof e === "object" && "code" in e && "message" in e;
}

export class WalletConnectProvider extends WalletProvider {
  private topic: string | undefined;

  constructor(private client: SignClient) {
    super();
  }

  // Singleton pattern
  static async getInstance() {
    if (walletConnectInstance === undefined) {
      const client = await SignClient.init({
        projectId: "76324905a70fe5c388bab46d3e0564dc", // Replace with your WalletConnect project ID
        metadata: {
          name: "Concordium Gambling dApp",
          description: "A gambling dApp on Concordium",
          url: window.location.origin,
          icons: ["https://walletconnect.com/walletconnect-logo.png"],
        },
      });
      walletConnectInstance = new WalletConnectProvider(client);
    }
    return walletConnectInstance;
  }

  // Connect to mobile wallet via WalletConnect
  async connect(): Promise<string | undefined> {
    const { uri, approval } = await this.client.connect({
      requiredNamespaces: {
        ccd: {
          methods: [
            "sign_and_send_transaction",
            "sign_message",
            "request_verifiable_presentation",
          ],
          chains: ["ccd:testnet"], // Use "ccd:testnet" or "ccd:mainnet"
          events: ["accounts_changed", "chain_changed"],
        },
      },
    });

    if (uri) {
      QRCodeModal.open(uri, () => {
        console.log("QR Code Modal closed");
      });
    }

    const session = await approval();
    QRCodeModal.close();

    this.topic = session.topic;
    const account = this.getAccount(session.namespaces);

    // Listen for session updates
    this.client.on("session_update", ({ topic, params }) => {
      if (topic === this.topic) {
        super.onAccountChanged(this.getAccount(params.namespaces));
      }
    });

    super.onAccountChanged(account);
    return account;
  }

  // Request a verifiable presentation (ZK proof) from mobile wallet
  async requestVerifiablePresentation(
    challenge: HexString,
    statement: CredentialStatements,
  ): Promise<VerifiablePresentation> {
    if (this.topic === undefined) {
      throw new Error("Not connected to wallet");
    }

    // Serialize the parameters
    const serializedParams = JSON.stringify({
      challenge,
      credentialStatements: statement.map(({ statement: statementItems, idQualifier }) => ({
        idQualifier: { ...idQualifier },
        statement: statementItems.map(({ attributeTag, type, ...rest }) => ({
          attributeTag,
          type,
          ...Object.fromEntries(
            Object.entries(rest).map(([key, value]) => [
              key,
              toBuffer(serializeTypeValue(value as any, type), "hex"),
            ]),
          ),
        })),
      })),
    });

    try {
      const result = await this.client.request({
        topic: this.topic,
        request: {
          method: "request_verifiable_presentation",
          params: { paramsJson: serializedParams },
        },
        chainId: "ccd:testnet", // Use "ccd:testnet" or "ccd:mainnet"
      });

      return VerifiablePresentation.fromString(
        (result as any).verifiablePresentationJson,
      );
    } catch (e) {
      if (isWalletConnectError(e)) {
        throw new Error(
          "Generating proof request rejected in wallet: " + JSON.stringify(e),
        );
      }
      throw e;
    }
  }

  // Disconnect from the wallet
  async disconnect(): Promise<void> {
    if (this.topic === undefined) {
      return;
    }

    await this.client.disconnect({
      topic: this.topic,
      reason: {
        code: 1,
        message: "user disconnecting",
      },
    });

    this.connectedAccount = undefined;
    this.topic = undefined;
    super.onAccountChanged(this.connectedAccount);
  }

  // Sign and send transaction through WalletConnect
  async signAndSendTransaction(
    accountAddress: AccountAddress.Type,
    type: AccountTransactionType,
    payload: AccountTransactionPayload,
    header: AccountTransactionHeader
  ): Promise<string> {
    if (this.topic === undefined) {
      throw new Error("Not connected to wallet");
    }

    // Serialize the transaction for WalletConnect
    const serializedPayload = JSON.stringify({
      type,
      payload,
      header: {
        ...header,
        expiry: header.expiry.expiryEpochSeconds.toString(),
        nonce: header.nonce.toString(),
        sender: AccountAddress.toBase58(header.sender),
      }
    });

    try {
      const result = await this.client.request({
        topic: this.topic,
        request: {
          method: "sign_and_send_transaction",
          params: {
            transaction: serializedPayload,
            address: AccountAddress.toBase58(accountAddress),
          },
        },
        chainId: "ccd:testnet",
      });

      return (result as any).transactionHash || result;
    } catch (e) {
      if (isWalletConnectError(e)) {
        throw new Error(
          "Transaction rejected in wallet: " + JSON.stringify(e)
        );
      }
      throw e;
    }
  }

  // Helper to extract Concordium account from WalletConnect namespaces
  private getAccount(ns: SessionTypes.Namespaces): string | undefined {
    const [, , account] = ns["ccd"].accounts[0].split(":");
    return account;
  }
}

