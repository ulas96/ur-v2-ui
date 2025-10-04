import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Monad Perpetual DEX
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
          Trade with leverage on Monad. Decentralized, permissionless, and efficient.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/trade"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors"
          >
            Start Trading
          </Link>
          <Link
            href="/supply"
            className="px-8 py-4 bg-green-600 text-white rounded-lg font-medium text-lg hover:bg-green-700 transition-colors"
          >
            Provide Liquidity
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Up to 10x Leverage
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Open long or short positions with up to 10x leverage for maximum capital efficiency.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Earn Fees
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Deposit USDC to the liquidity pool and earn trading fees from leveraged positions.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              On Monad
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Built on Monad for ultra-fast transactions and low fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
