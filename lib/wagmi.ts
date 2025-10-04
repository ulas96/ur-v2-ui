import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { Chain } from "viem";

// Define Monad chain
export const monad = {
  id: 10143,
  name: "Monad",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "MonadExplorer",
      url: "https://testnet.monadexplorer.com/",
    },
  },
} as const satisfies Chain;

// Create wagmi config using RainbowKit
export const config = getDefaultConfig({
  appName: "Monad Perpetual DEX",
  projectId: "YOUR_PROJECT_ID", // Get from https://cloud.walletconnect.com
  chains: [monad],
  ssr: true, // Because this is a Next.js app
});
