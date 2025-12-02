"use client";

import { useState } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { ConnectButton } from "@/components/ConnectButton";
import { MarketCard } from "@/components/MarketCard";
import { CreateMarket } from "@/components/CreateMarket";
import { baseBetsContract } from '@/lib/contract';

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'my-bets'>('active');
  
  const { address, isConnected } = useAccount();

  // Get total market count
  const { data: marketCount } = useReadContract({
    ...baseBetsContract,
    functionName: 'marketCount',
  });

  // Get protocol stats
  const { data: protocolStats } = useReadContract({
    ...baseBetsContract,
    functionName: 'getProtocolStats',
  });

  // Get user's bet markets
  const { data: userBetMarkets } = useReadContract({
    ...baseBetsContract,
    functionName: 'getUserBetMarkets',
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  // Get user stats
  const { data: userStats } = useReadContract({
    ...baseBetsContract,
    functionName: 'getUserStats',
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  const totalMarkets = marketCount ? Number(marketCount) : 0;
  const marketIds = Array.from({ length: totalMarkets }, (_, i) => BigInt(i));

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60">
        <div className="container flex h-16 max-w-screen-xl mx-auto items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">BaseBets</h1>
          </div>
          <ConnectButton />
        </div>
      </header>

      <main className="flex-1 container max-w-screen-xl mx-auto py-8 px-4">
        {/* Protocol Stats */}
        {protocolStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Markets</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{protocolStats[0].toString()}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Volume</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{formatEther(protocolStats[1])} ETH</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Resolved</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{protocolStats[3].toString()}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Users</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{protocolStats[4].toString()}</p>
            </div>
          </div>
        )}

        {/* User Stats */}
        {isConnected && userStats && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Your Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-white/70">Total Bets</p>
                <p className="text-xl font-bold text-white">{userStats[0].toString()}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Wagered</p>
                <p className="text-xl font-bold text-white">{formatEther(userStats[1])} ETH</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Won</p>
                <p className="text-xl font-bold text-white">{formatEther(userStats[2])} ETH</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Markets Created</p>
                <p className="text-xl font-bold text-white">{userStats[3].toString()}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Wins</p>
                <p className="text-xl font-bold text-white">{userStats[4].toString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              All Markets
            </button>
            {isConnected && (
              <button
                onClick={() => setActiveTab('my-bets')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'my-bets'
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                My Bets ({userBetMarkets?.length || 0})
              </button>
            )}
          </div>
          
          {isConnected && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Market
            </button>
          )}
        </div>

        {/* Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'active' ? (
            marketIds.length > 0 ? (
              marketIds.map((id) => (
                <MarketCard key={id.toString()} marketId={id} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-zinc-500 dark:text-zinc-400 mb-4">No markets yet. Be the first to create one!</p>
                {isConnected && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                  >
                    Create First Market
                  </button>
                )}
              </div>
            )
          ) : (
            userBetMarkets && userBetMarkets.length > 0 ? (
              userBetMarkets.map((id) => (
                <MarketCard key={id.toString()} marketId={id} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-zinc-500 dark:text-zinc-400">You haven&apos;t placed any bets yet.</p>
              </div>
            )
          )}
        </div>
      </main>

      {/* Create Market Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md">
            <CreateMarket onClose={() => setShowCreateModal(false)} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6">
        <div className="container max-w-screen-xl mx-auto px-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>BaseBets - Prediction Markets on Base</p>
        </div>
      </footer>
    </div>
  );
}
