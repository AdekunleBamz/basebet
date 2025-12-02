"use client";

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiProvider } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "YOUR_PROJECT_ID";

// 2. Create wagmiConfig
const metadata = {
  name: 'BaseBets Mini',
  description: 'A prediction market protocol on the Base chain.',
  url: 'https://basebets.mini', // origin must match your domain & subdomain
  icons: ['/logo.svg']
};

const chains = [base] as const;
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
