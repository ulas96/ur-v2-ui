// ERC20 ABI (for USDC, WETH, and LP tokens)
export const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Keep USDC_ABI for backward compatibility
export const USDC_ABI = ERC20_ABI;

export const PERPETUAL_ABI = [
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "leverage", type: "uint256" },
      { internalType: "bool", name: "isLong", type: "bool" },
    ],
    name: "createPositionForToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "lpAmount", type: "uint256" },
      { internalType: "uint256", name: "leverage", type: "uint256" },
      { internalType: "bool", name: "isLong", type: "bool" },
    ],
    name: "createPositionForLpToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "positionId", type: "uint256" },
      { internalType: "address", name: "token", type: "address" },
    ],
    name: "closePositionForToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "positionId", type: "uint256" }],
    name: "closePositionForLpToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "lend",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserPositions",
    outputs: [
      {
        internalType: "struct Perpetual.Position[]",
        name: "",
        type: "tuple[]",
        components: [
          { internalType: "address", name: "trader", type: "address" },
          { internalType: "uint256", name: "collateral", type: "uint256" },
          { internalType: "uint256", name: "size", type: "uint256" },
          { internalType: "uint256", name: "entryPrice", type: "uint256" },
          { internalType: "bool", name: "isLong", type: "bool" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "bool", name: "isOpen", type: "bool" },
          { internalType: "address", name: "collateralToken", type: "address" },
          { internalType: "bool", name: "isLpPosition", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPoolBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserDeposit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "positions",
    outputs: [
      { internalType: "address", name: "trader", type: "address" },
      { internalType: "uint256", name: "collateral", type: "uint256" },
      { internalType: "uint256", name: "size", type: "uint256" },
      { internalType: "uint256", name: "entryPrice", type: "uint256" },
      { internalType: "bool", name: "isLong", type: "bool" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
      { internalType: "bool", name: "isOpen", type: "bool" },
      { internalType: "address", name: "collateralToken", type: "address" },
      { internalType: "bool", name: "isLpPosition", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
