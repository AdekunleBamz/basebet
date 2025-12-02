"use client";

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiProvider } from 'wagmi';
import { base } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState, useEffect } from 'react';

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "YOUR_PROJECT_ID";

// 2. Create wagmiConfig
const metadata = {
  name: 'BaseBets Mini',
  description: 'A prediction market protocol on the Base chain.',
  url: 'https://basebets.mini',
  icons: ['/logo.svg']
};

const chains = [base] as const;
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

// 3. Create modal
if (typeof window !== 'undefined') {
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
  });
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
