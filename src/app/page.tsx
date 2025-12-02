import { ConnectButton } from "@/components/ConnectButton";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <h1 className="text-xl font-bold">BaseBets Mini</h1>
          <ConnectButton />
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Welcome to BaseBets
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Connect your wallet to get started.
          </p>
        </div>
      </main>
    </div>
  );
}
