export interface Position {
  trader: `0x${string}`;
  collateral: bigint;
  size: bigint;
  entryPrice: bigint;
  isLong: boolean;
  timestamp: bigint;
  isOpen: boolean;
  collateralToken: `0x${string}`;
  isLpPosition: boolean;
}

export interface PositionWithId extends Position {
  id: number;
}
