export const MIRAI_MARKETPLACE_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_miraiCoin', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'entityId', type: 'bytes32' },
      { internalType: 'address', name: 'entityOwner', type: 'address' },
    ],
    name: 'registerEntity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'entityId', type: 'bytes32' },
      { internalType: 'uint256', name: 'price', type: 'uint256' },
    ],
    name: 'listEntity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'entityId', type: 'bytes32' },
    ],
    name: 'buyEntity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'entityId', type: 'bytes32' },
      { internalType: 'string', name: 'emotionData', type: 'string' },
    ],
    name: 'emotionSync',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'nftContract', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'uint256', name: 'price', type: 'uint256' },
    ],
    name: 'listCard',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'nftContract', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'buyCard',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'setOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'entityId', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'uint256', name: 'price', type: 'uint256' },
    ],
    name: 'Listed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'entityId', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'buyer', type: 'address' },
      { internalType: 'uint256', name: 'price', type: 'uint256' },
    ],
    name: 'Sold',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'RoyaltyPaid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'entityId', type: 'bytes32' },
      { internalType: 'string', name: 'emotionData', type: 'string' },
    ],
    name: 'EmotionSynced',
    type: 'event',
  },
] as const
