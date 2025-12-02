"use client";

import { formatEther, parseEther } from 'viem';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { baseBetsContract } from '@/lib/contract';
import { useState } from 'react';

// Category enum mapping
const CATEGORIES = ['Crypto', 'Sports', 'Politics', 'Entertainment', 'Other'];

// Market status enum mapping  
const STATUS = ['Active', 'Resolved', 'Cancelled'];

// Outcome enum mapping
const OUTCOME = ['None', 'Yes', 'No'];

interface MarketCardProps {
  marketId: bigint;
}

export function MarketCard({ marketId }: MarketCardProps) {
  const [betAmount, setBetAmount] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  
  const { address, isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  // Get market core data
  const { data: marketCore } = useReadContract({
    ...baseBetsContract,
    functionName: 'getMarketCore',
    args: [marketId],
  });

  // Get market bets data
  const { data: marketBets } = useReadContract({
    ...baseBetsContract,
    functionName: 'getMarketBets',
    args: [marketId],
  });

  // Get odds
  const { data: odds } = useReadContract({
    ...baseBetsContract,
    functionName: 'getOdds',
    args: [marketId],
  });

  // Get user's bet on this market
  const { data: userBet } = useReadContract({
    ...baseBetsContract,
    functionName: 'getUserBet',
    args: [marketId, address!],
    query: {
      enabled: !!address,
    },
  });

  if (!marketCore) {
    return (
      <div className="animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6 h-48">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
      </div>
    );
  }

  const [id, creator, question, category, endTime, status, outcome] = marketCore;
  const isActive = status === 0;
  const isEnded = Number(endTime) * 1000 < Date.now();
  const canBet = isActive && !isEnded && isConnected;

  const totalYes = marketBets ? marketBets[0] : 0n;
  const totalNo = marketBets ? marketBets[1] : 0n;
  const totalPool = totalYes + totalNo;

  const yesOdds = odds ? Number(odds[0]) / 100 : 50;
  const noOdds = odds ? Number(odds[1]) / 100 : 50;

  const handlePlaceBet = async (position: 1 | 2) => {
    if (!betAmount || parseFloat(betAmount) <= 0) return;

    writeContract({
      ...baseBetsContract,
      functionName: 'placeBet',
      args: [marketId, position],
      value: parseEther(betAmount),
    });
  };

  const handleClaimWinnings = async () => {
    writeContract({
      ...baseBetsContract,
      functionName: 'claimWinnings',
      args: [marketId],
    });
  };

  const hasUserBet = userBet && userBet[0] > 0n;
  const userPosition = userBet ? Number(userBet[1]) : 0;
  const userClaimed = userBet ? userBet[2] : false;
  const canClaim = status === 1 && hasUserBet && !userClaimed && userPosition === outcome;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="p-6">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            {CATEGORIES[category] || 'Other'}
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            isActive 
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
              : status === 1 
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
          }`}>
            {STATUS[status]}
          </span>
        </div>

        {/* Question */}
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          {question}
        </h3>

        {/* Pool Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-xs text-green-600 dark:text-green-400 mb-1">Yes ({yesOdds.toFixed(0)}%)</p>
            <p className="text-lg font-bold text-green-700 dark:text-green-300">
              {formatEther(totalYes)} ETH
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
            <p className="text-xs text-red-600 dark:text-red-400 mb-1">No ({noOdds.toFixed(0)}%)</p>
            <p className="text-lg font-bold text-red-700 dark:text-red-300">
              {formatEther(totalNo)} ETH
            </p>
          </div>
        </div>

        {/* End Time */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          {isEnded ? 'Ended' : 'Ends'}: {new Date(Number(endTime) * 1000).toLocaleDateString()}
        </p>

        {/* User's Bet */}
        {hasUserBet && (
          <div className="mb-4 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Your bet: <span className="font-semibold">{formatEther(userBet![0])} ETH on {OUTCOME[userPosition]}</span>
            </p>
          </div>
        )}

        {/* Betting Form */}
        {canBet && !hasUserBet && (
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Amount in ETH"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              step="0.001"
              min="0"
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePlaceBet(1)}
                disabled={isPending || !betAmount}
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium transition-colors"
              >
                {isPending ? 'Betting...' : 'Bet Yes'}
              </button>
              <button
                onClick={() => handlePlaceBet(2)}
                disabled={isPending || !betAmount}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium transition-colors"
              >
                {isPending ? 'Betting...' : 'Bet No'}
              </button>
            </div>
          </div>
        )}

        {/* Claim Button */}
        {canClaim && (
          <button
            onClick={handleClaimWinnings}
            disabled={isPending}
            className="w-full px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white font-medium transition-colors"
          >
            {isPending ? 'Claiming...' : 'Claim Winnings'}
          </button>
        )}

        {/* Resolved Outcome */}
        {status === 1 && (
          <div className="mt-4 p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-center">
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Resolved: <span className="font-bold">{OUTCOME[outcome]}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
