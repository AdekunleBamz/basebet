"use client";

import { useWeb3Modal } from '@web3modal/wagmi/react';

export function ConnectButton() {
  const { open } = useWeb3Modal();

  return (
    <button
      onClick={() => open()}
      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
    >
      Connect Wallet
    </button>
  );
}
