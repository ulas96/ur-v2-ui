"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { PERPETUAL_ABI, USDC_ABI } from "@/lib/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";

export default function SupplyPage() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [needsApproval, setNeedsApproval] = useState(true);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: usdcBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.USDC,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: userDeposit } = useReadContract({
    address: CONTRACT_ADDRESSES.PERPETUAL,
    abi: PERPETUAL_ABI,
    functionName: "getUserDeposit",
    args: address ? [address] : undefined,
  });

  const { data: poolBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.PERPETUAL,
    abi: PERPETUAL_ABI,
    functionName: "getPoolBalance",
  });

  const { data: allowance } = useReadContract({
    address: CONTRACT_ADDRESSES.USDC,
    abi: USDC_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESSES.PERPETUAL] : undefined,
  });

  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: deposit, data: depositHash } = useWriteContract();
  const { writeContract: withdraw, data: withdrawHash } = useWriteContract();

  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isDepositing } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  const { isLoading: isWithdrawing } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  useEffect(() => {
    if (allowance && depositAmount) {
      try {
        const amountBigInt = parseUnits(depositAmount, 6);
        setNeedsApproval(allowance < amountBigInt);
      } catch {
        setNeedsApproval(true);
      }
    }
  }, [allowance, depositAmount]);

  const handleApprove = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const amountBigInt = parseUnits(depositAmount, 6);
      approve({
        address: CONTRACT_ADDRESSES.USDC,
        abi: USDC_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.PERPETUAL, amountBigInt],
        gas: 100000n,
        account: address,
      });
    } catch (error) {
      console.error("Approval error:", error);
    }
  };

  const handleDeposit = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const amountBigInt = parseUnits(depositAmount, 6);
      deposit({
        address: CONTRACT_ADDRESSES.PERPETUAL,
        abi: PERPETUAL_ABI,
        functionName: "lend",
        args: [amountBigInt],
        gas: 300000n,
        account: address,
      });
    } catch (error) {
      console.error("Deposit error:", error);
    }
  };

  const handleWithdraw = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const amountBigInt = parseUnits(withdrawAmount, 6);
      withdraw({
        address: CONTRACT_ADDRESSES.PERPETUAL,
        abi: PERPETUAL_ABI,
        functionName: "withdraw",
        args: [amountBigInt],
        gas: 300000n,
        account: address,
      });
    } catch (error) {
      console.error("Withdraw error:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Liquidity Pool
        </h1>

        {/* Pool Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Pool Balance
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${poolBalance ? formatUnits(poolBalance, 6) : "0.00"}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Your Deposit
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${userDeposit ? formatUnits(userDeposit, 6) : "0.00"}
            </div>
          </div>
        </div>

        {/* Deposit/Withdraw Interface */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("deposit")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "deposit"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => setActiveTab("withdraw")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "withdraw"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              Withdraw
            </button>
          </div>

          {activeTab === "deposit" ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deposit Amount (USDC)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                {usdcBalance && (
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Balance: {formatUnits(usdcBalance, 6)} USDC
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Deposit USDC to earn fees from traders. Your funds will be
                  used as liquidity for leveraged positions.
                </p>
              </div>

              {!mounted ? (
                <div className="w-full py-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ) : !isConnected ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Please connect your wallet
                </div>
              ) : needsApproval ? (
                <button
                  onClick={handleApprove}
                  disabled={!depositAmount || isApproving}
                  className="w-full py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isApproving ? "Approving..." : "Approve USDC"}
                </button>
              ) : (
                <button
                  onClick={handleDeposit}
                  disabled={!depositAmount || isDepositing}
                  className="w-full py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isDepositing ? "Depositing..." : "Deposit"}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Withdraw Amount (USDC)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                {userDeposit && (
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Available: {formatUnits(userDeposit, 6)} USDC
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Withdraw your deposited USDC from the pool. Ensure sufficient
                  liquidity remains for open positions.
                </p>
              </div>

              {!mounted ? (
                <div className="w-full py-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ) : !isConnected ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Please connect your wallet
                </div>
              ) : (
                <button
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || isWithdrawing}
                  className="w-full py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
