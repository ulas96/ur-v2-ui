"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { PERPETUAL_ABI, ERC20_ABI } from "@/lib/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";

type CollateralType = "USDC" | "WETH" | "LP";

const COLLATERAL_OPTIONS = [
  { value: "USDC" as CollateralType, label: "USDC", address: CONTRACT_ADDRESSES.USDC, decimals: 6 },
  { value: "WETH" as CollateralType, label: "WETH", address: CONTRACT_ADDRESSES.WETH, decimals: 18 },
  { value: "LP" as CollateralType, label: "WETH/USDC LP", address: CONTRACT_ADDRESSES.WETH_USDC_PAIR, decimals: 18 },
];

export default function TradePage() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [leverage, setLeverage] = useState("2");
  const [isLong, setIsLong] = useState(true);
  const [collateralType, setCollateralType] = useState<CollateralType>("USDC");
  const [needsApproval, setNeedsApproval] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedCollateral = COLLATERAL_OPTIONS.find(c => c.value === collateralType)!;

  const { data: currentPrice } = useReadContract({
    address: CONTRACT_ADDRESSES.PERPETUAL,
    abi: PERPETUAL_ABI,
    functionName: "getCurrentPrice",
  });

  const { data: collateralBalance } = useReadContract({
    address: selectedCollateral.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: allowance } = useReadContract({
    address: selectedCollateral.address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESSES.PERPETUAL] : undefined,
  });

  const { writeContract: approve, data: approveHash, error: approveError } = useWriteContract();
  const { writeContract: openPosition, data: openHash, error: openError } = useWriteContract();

  const { isLoading: isApproving, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isOpening, isSuccess: isOpenSuccess } = useWaitForTransactionReceipt({
    hash: openHash,
  });

  // Show errors
  useEffect(() => {
    if (approveError) {
      console.error("Approve error:", approveError);
      alert(`Approval failed: ${approveError.message}`);
    }
  }, [approveError]);

  useEffect(() => {
    if (openError) {
      console.error("Open position error:", openError);
      alert(`Open position failed: ${openError.message}`);
    }
  }, [openError]);

  useEffect(() => {
    if (isOpenSuccess) {
      alert("Position opened successfully!");
      setAmount("");
    }
  }, [isOpenSuccess]);

  useEffect(() => {
    if (allowance && amount) {
      try {
        const amountBigInt = parseUnits(amount, selectedCollateral.decimals);
        setNeedsApproval(allowance < amountBigInt);
      } catch {
        setNeedsApproval(true);
      }
    } else {
      setNeedsApproval(true);
    }
  }, [allowance, amount, selectedCollateral.decimals]);

  // Refetch allowance after approval
  useEffect(() => {
    if (isApproveSuccess) {
      // Allowance will be refetched automatically by wagmi
      setNeedsApproval(false);
    }
  }, [isApproveSuccess]);

  const handleApprove = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // Approve max uint256 for convenience (infinite approval)
      const maxApproval = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

      console.log("Approving token:", selectedCollateral.address);
      console.log("Spender:", CONTRACT_ADDRESSES.PERPETUAL);

      approve({
        address: selectedCollateral.address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.PERPETUAL, maxApproval],
        gas: 100000n,
        account: address,
      });
    } catch (error) {
      console.error("Approval error:", error);
      alert("Approval failed. Check console for details.");
    }
  };

  const handleOpenPosition = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const amountBigInt = parseUnits(amount, selectedCollateral.decimals);
      const leverageBigInt = BigInt(leverage);

      console.log("Opening position with:");
      console.log("- Collateral type:", collateralType);
      console.log("- Amount:", amountBigInt.toString());
      console.log("- Leverage:", leverageBigInt.toString());
      console.log("- Is Long:", isLong);

      if (collateralType === "LP") {
        // Use createPositionForLpToken for LP tokens
        console.log("Calling createPositionForLpToken");
        openPosition({
          address: CONTRACT_ADDRESSES.PERPETUAL,
          abi: PERPETUAL_ABI,
          functionName: "createPositionForLpToken",
          args: [amountBigInt, leverageBigInt, isLong],
          gas: 500000n,
          account: address,
        });
      } else {
        // Use createPositionForToken for WETH and USDC
        console.log("Calling createPositionForToken with token:", selectedCollateral.address);
        openPosition({
          address: CONTRACT_ADDRESSES.PERPETUAL,
          abi: PERPETUAL_ABI,
          functionName: "createPositionForToken",
          args: [selectedCollateral.address, amountBigInt, leverageBigInt, isLong],
          gas: 500000n,
          account: address,
        });
      }
    } catch (error) {
      console.error("Open position error:", error);
      alert("Failed to open position. Check console for details.");
    }
  };

  const positionSize = amount && leverage
    ? (parseFloat(amount) * parseFloat(leverage)).toFixed(selectedCollateral.decimals === 6 ? 2 : 4)
    : "0";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Open Leveraged Position
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          {/* Current Price */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Current Price
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${currentPrice ? formatUnits(currentPrice, 6) : "0.00"}
            </div>
          </div>

          {/* Collateral Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Collateral Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {COLLATERAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setCollateralType(option.value);
                    setAmount(""); // Reset amount when changing collateral type
                  }}
                  className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                    collateralType === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Collateral Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Collateral Amount ({selectedCollateral.label})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step={selectedCollateral.decimals === 6 ? "0.01" : "0.0001"}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            {collateralBalance && (
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Balance: {formatUnits(collateralBalance, selectedCollateral.decimals)} {selectedCollateral.label}
              </div>
            )}
          </div>

          {/* Leverage Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Leverage: {leverage}x
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1x</span>
              <span>5x</span>
              <span>10x</span>
            </div>
          </div>

          {/* Long/Short Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Direction
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setIsLong(true)}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  isLong
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                Long
              </button>
              <button
                onClick={() => setIsLong(false)}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  !isLong
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                Short
              </button>
            </div>
          </div>

          {/* Position Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Collateral
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {amount || "0"} {selectedCollateral.label}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Position Size
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {positionSize} {selectedCollateral.label}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Leverage
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {leverage}x
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Direction
              </span>
              <span
                className={`font-medium ${
                  isLong ? "text-green-600" : "text-red-600"
                }`}
              >
                {isLong ? "Long" : "Short"}
              </span>
            </div>
          </div>

          {/* Action Button */}
          {!mounted ? (
            <div className="w-full py-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ) : !isConnected ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              Please connect your wallet
            </div>
          ) : needsApproval ? (
            <button
              onClick={handleApprove}
              disabled={!amount || isApproving}
              className="w-full py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isApproving ? "Approving..." : `Approve ${selectedCollateral.label}`}
            </button>
          ) : (
            <button
              onClick={handleOpenPosition}
              disabled={!amount || isOpening}
              className={`w-full py-4 rounded-lg font-medium transition-colors ${
                isLong
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {isOpening
                ? "Opening Position..."
                : `Open ${isLong ? "Long" : "Short"} Position`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
