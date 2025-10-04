"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits } from "viem";
import { PERPETUAL_ABI } from "@/lib/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import type { Position } from "@/lib/types";

export default function PositionsPage() {
  const { address, isConnected } = useAccount();

  const { data: positions, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.PERPETUAL,
    abi: PERPETUAL_ABI,
    functionName: "getUserPositions",
    args: address ? [address] : undefined,
  });

  const { data: currentPrice } = useReadContract({
    address: CONTRACT_ADDRESSES.PERPETUAL,
    abi: PERPETUAL_ABI,
    functionName: "getCurrentPrice",
  });

  const { writeContract: closePosition, data: closeHash } = useWriteContract();

  const { isLoading: isClosing, isSuccess: isCloseSuccess } = useWaitForTransactionReceipt({
    hash: closeHash,
  });

  const handleClosePosition = async (positionId: number, position: Position) => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      if (position.isLpPosition) {
        // Close LP position
        closePosition({
          address: CONTRACT_ADDRESSES.PERPETUAL,
          abi: PERPETUAL_ABI,
          functionName: "closePositionForLpToken",
          args: [BigInt(positionId)],
          gas: 500000n,
          account: address,
        });
      } else {
        // Close token position (WETH or USDC)
        closePosition({
          address: CONTRACT_ADDRESSES.PERPETUAL,
          abi: PERPETUAL_ABI,
          functionName: "closePositionForToken",
          args: [BigInt(positionId), position.collateralToken],
          gas: 500000n,
          account: address,
        });
      }
    } catch (error) {
      console.error("Close position error:", error);
    }
  };

  const getCollateralLabel = (position: Position) => {
    const tokenAddress = position.collateralToken.toLowerCase();
    if (position.isLpPosition || tokenAddress === CONTRACT_ADDRESSES.WETH_USDC_PAIR.toLowerCase()) {
      return "WETH/USDC LP";
    } else if (tokenAddress === CONTRACT_ADDRESSES.WETH.toLowerCase()) {
      return "WETH";
    } else if (tokenAddress === CONTRACT_ADDRESSES.USDC.toLowerCase()) {
      return "USDC";
    }
    return "Unknown";
  };

  const getCollateralDecimals = (position: Position) => {
    const tokenAddress = position.collateralToken.toLowerCase();
    if (tokenAddress === CONTRACT_ADDRESSES.USDC.toLowerCase()) {
      return 6;
    }
    return 18; // WETH and LP tokens use 18 decimals
  };

  const calculatePnL = (position: Position) => {
    if (!currentPrice) return "0.00";

    const decimals = getCollateralDecimals(position);
    const entryPrice = Number(formatUnits(position.entryPrice, 6));
    const current = Number(formatUnits(currentPrice, 6));
    const size = Number(formatUnits(position.size, decimals));

    const priceDiff = position.isLong ? current - entryPrice : entryPrice - current;
    const pnl = (priceDiff / entryPrice) * size;

    return pnl.toFixed(decimals === 6 ? 2 : 4);
  };

  const calculatePnLPercentage = (position: Position) => {
    if (!currentPrice) return "0.00";

    const entryPrice = Number(formatUnits(position.entryPrice, 6));
    const current = Number(formatUnits(currentPrice, 6));

    const priceDiff = position.isLong ? current - entryPrice : entryPrice - current;
    const percentage = (priceDiff / entryPrice) * 100;

    return percentage.toFixed(2);
  };

  // Refetch positions after successful close
  if (isCloseSuccess) {
    refetch();
  }

  const openPositions = positions?.filter((p: Position) => p.isOpen) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Your Positions
        </h1>

        {!isConnected ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Please connect your wallet to view your positions
            </p>
          </div>
        ) : openPositions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              You don't have any open positions
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {openPositions.map((position: Position, index: number) => {
              const pnl = calculatePnL(position);
              const pnlPercentage = calculatePnLPercentage(position);
              const isProfitable = parseFloat(pnl) >= 0;
              const collateralLabel = getCollateralLabel(position);
              const decimals = getCollateralDecimals(position);

              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                    {/* Direction */}
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Direction
                      </div>
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          position.isLong
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {position.isLong ? "Long" : "Short"}
                      </div>
                    </div>

                    {/* Collateral Type */}
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Collateral
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {collateralLabel}
                      </div>
                    </div>

                    {/* Collateral Amount */}
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Amount
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatUnits(position.collateral, decimals)}
                      </div>
                    </div>

                    {/* Size */}
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Size
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatUnits(position.size, decimals)}
                      </div>
                    </div>

                    {/* Entry Price */}
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Entry Price
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        ${formatUnits(position.entryPrice, 6)}
                      </div>
                    </div>

                    {/* PnL */}
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        PnL
                      </div>
                      <div
                        className={`font-bold ${
                          isProfitable ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isProfitable ? "+" : ""}{pnl} ({isProfitable ? "+" : ""}
                        {pnlPercentage}%)
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleClosePosition(index, position)}
                        disabled={isClosing}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {isClosing ? "Closing..." : "Close"}
                      </button>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                      <div className="text-gray-500 dark:text-gray-400">
                        Opened:{" "}
                        {new Date(
                          Number(position.timestamp) * 1000
                        ).toLocaleString()}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        Current Price: ${currentPrice ? formatUnits(currentPrice, 6) : "0.00"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
