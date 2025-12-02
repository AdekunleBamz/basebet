"use client";

import { useState } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import { baseBetsContract } from '@/lib/contract';

const CATEGORIES = [
  { value: 0, label: 'Crypto' },
  { value: 1, label: 'Sports' },
  { value: 2, label: 'Politics' },
  { value: 3, label: 'Entertainment' },
  { value: 4, label: 'Other' },
];

const DURATIONS = [
  { value: 3600, label: '1 Hour' },
  { value: 86400, label: '1 Day' },
  { value: 604800, label: '1 Week' },
  { value: 2592000, label: '1 Month' },
];

export function CreateMarket({ onClose }: { onClose?: () => void }) {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(0);
  const [duration, setDuration] = useState(86400);

  const { isConnected } = useAccount();
  const { writeContract, isPending, isSuccess } = useWriteContract();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    writeContract({
      ...baseBetsContract,
      functionName: 'createMarket',
      args: [question, description || question, category, BigInt(duration)],
    });
  };

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <p className="text-zinc-600 dark:text-zinc-400 text-center">
          Connect your wallet to create a market
        </p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
            Market Created!
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Your prediction market has been created successfully.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
        Create Market
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Will BTC reach $100k by end of 2025?"
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details about the market..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(Number(e.target.value))}
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
          >
            {DURATIONS.map((dur) => (
              <option key={dur.value} value={dur.value}>
                {dur.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || !question.trim()}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium transition-colors"
          >
            {isPending ? 'Creating...' : 'Create Market'}
          </button>
        </div>
      </form>
    </div>
  );
}
