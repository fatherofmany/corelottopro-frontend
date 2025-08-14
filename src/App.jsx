import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import './App.css';
import { 
  Wallet, Trophy, Users, Timer, DollarSign, Star, Zap,
  ArrowUpDown, Settings, ChevronDown, ChevronUp, Coins,
  Shield, TrendingUp, Flame, Crown, Gift, Bell, X,
  CheckCircle, AlertCircle, Loader2, RefreshCw, ExternalLink,
  BarChart3, PieChart, Activity, Target, Award, Sparkles,
  Lock, Unlock, Eye, EyeOff, Copy, Download, Upload,
  Plus, Minus, ArrowRight, ArrowLeft, Home, Menu,
  Search, Filter, SortAsc, Calendar, Clock, Hash,
  Globe, Smartphone, Laptop, Headphones, Mail, MessageCircle,
  TrendingDown 
} from 'lucide-react';

import CoreDaoLogo from './assets/coredao-logo.svg';

// =====================================================================================
// REAL BLOCKCHAIN INTEGRATION 
// =====================================================================================
const CHAIN_ID = 1114; // Core Testnet
const RPC_URL = 'https://rpc.test2.btcs.network';
const LOTTERY_ADDRESS = '0x2eDfD44b4153e73c286C8deC5f41489f10E5189E'; // 

const LOTTERY_ABI = [
  "function enterLottery(uint256 tierId) external payable",
  "function getRoundInfo(uint256 tierId) external view returns (uint256 roundNumber,uint256 prizePool,uint256 playersCount,uint256 endTime,bool isActive)",
  "function getTierInfo(uint256 tierId) external view returns (uint256 minEntry,uint256 maxPlayers,uint256 winners,uint256 duration)",
  "function drawWinners(uint256 tierId, address[] calldata players) external returns (address[] winners, uint256[] prizes)",
  "event LotteryEntered(uint256 indexed tierId,address indexed player,uint256 amount)",
  "event WinnersSelected(uint256 indexed tierId,address[] winners,uint256[] prizes)",
  "event RoundStarted(uint256 indexed tierId,uint256 roundId)"
];

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)"
];

// =====================================================================================
//  CONFIG 
// =====================================================================================
const CONFIG = {
  // Network Configuration
  CORE_MAINNET: {
    chainId: 1116,
    name: 'Core Blockchain Mainnet',
    rpcUrl: 'https://rpc.coredao.org',
    explorerUrl: 'https://scan.coredao.org',
    nativeCurrency: { name: 'CORE', symbol: 'CORE', decimals: 18 }
  },

  CORE_TESTNET: {
    chainId: 1115,
    name: 'Core Blockchain Testnet',
    rpcUrl: 'https://rpc.test.btcs.network',
    explorerUrl: 'https://scan.test.btcs.network',
    nativeCurrency: { name: 'tCORE', symbol: 'tCORE', decimals: 18 }
  },

  
  CORE_TESTNET2: {
    chainId: 1114,
    name: 'Core Blockchain Testnet 2',
    rpcUrl: 'https://rpc.test2.btcs.network',
    explorerUrl: 'https://scan.test2.btcs.network',
    nativeCurrency: { name: 'tCORE2', symbol: 'tCORE2', decimals: 18 }
  },


  // Contract Addresses
  CONTRACTS: {
    LOTTERY_MASTER: LOTTERY_ADDRESS
  },

  // Supported Tokens
  SUPPORTED_TOKENS: {
    CORE: {
      address: 'native',
      symbol: 'CORE',
      name: 'Core DAO',
      decimals: 18,
      icon: '🔥',
      color: 'orange',
      gradient: 'from-orange-500 to-red-600'
    },
    USDT: {
      address: '0x6789012345678901234567890123456789012345',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      icon: '💚',
      color: 'green',
      gradient: 'from-green-500 to-emerald-600'
    },
    USDC: {
      address: '0x7890123456789012345678901234567890123456',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      icon: '💙',
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600'
    },
    WBTC: {
      address: '0x8901234567890123456789012345678901234567',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      icon: '₿',
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-600'
    }
  },

  // Lottery Tiers – ULTRA-LOW TEST FEES
  LOTTERY_TIERS: [
    {
      id: 1,
    name: 'Bronze',
    minEntry: 0.001,
    maxPlayers: 30,
    winners: 3,
    duration: 10 * 60 * 1000,
    icon: '🥉',
    gradient: 'from-orange-400 to-orange-600',
    bgGradient: 'from-orange-50 to-orange-100',
    borderColor: 'border-orange-400'
  },
     {
    id: 2,
    name: 'Silver',
    minEntry: 0.002,
    maxPlayers: 30,
    winners: 3,
    duration: 10 * 60 * 1000,
    icon: '🥈',
    gradient: 'from-gray-400 to-gray-600',
    bgGradient: 'from-gray-50 to-gray-100',
    borderColor: 'border-gray-400'
  },
  {
    id: 3,
    name: 'Gold',
    minEntry: 0.003,
    maxPlayers: 30,
    winners: 3,
    duration: 10 * 60 * 1000,
    icon: '🥇',
    gradient: 'from-yellow-400 to-yellow-600',
    bgGradient: 'from-yellow-50 to-yellow-100',
    borderColor: 'border-yellow-400'
  },
  {
    id: 4,
    name: 'Platinum',
    minEntry: 0.004,
    maxPlayers: 30,
    winners: 3,
    duration: 10 * 60 * 1000,
    icon: '🏆',
    gradient: 'from-blue-400 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100',
    borderColor: 'border-blue-400'
  },
  {
    id: 5,
    name: 'Diamond',
    minEntry: 0.005,
    maxPlayers: 30,
    winners: 3,
    duration: 10 * 60 * 1000,
    icon: '💎',
    gradient: 'from-purple-400 to-purple-600',
    bgGradient: 'from-purple-50 to-purple-100',
    borderColor: 'border-purple-400'
  },
  {
    id: 6,
    name: 'Ruby',
    minEntry: 0.006,
    maxPlayers: 30,
    winners: 3,
    duration: 10 * 60 * 1000,
    icon: '❤️',
    gradient: 'from-red-400 to-red-600',
    bgGradient: 'from-red-50 to-red-100',
    borderColor: 'border-red-400'
  }
  ],

  // Fee Structure
  FEES: {
    PLATFORM_FEE: 0.05,
    BRIDGE_FEE: 0.001,
    GAS_BUFFER: 1.2
  },

  // Analytics
  ANALYTICS: {
    UPDATE_INTERVAL: 30000,
    CHART_POINTS: 24,
    HISTORY_LIMIT: 100
  }
};

// =====================================================================================
//  WEB3 STATE MANAGER
// =====================================================================================
class EnhancedLotteryStateManager {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.state = {
      wallet: { 
        connected: false, 
        address: null, 
        balances: new Map(), 
        allowances: new Map() 
      },
      rounds: new Map(),
      activeRounds: new Set(),
      completedRounds: [],
      userEntries: new Map(),
      userRewards: [],
      userStats: { 
        totalWagered: 0, 
        totalWon: 0, 
        winRate: 0, 
        favoriteToken: 'CORE', 
        roundsParticipated: 0, 
        totalRewards: 0 
      },
      analytics: {
        totalVolume: 0,
        totalPlayers: 0,
        totalRounds: 0,
        tokenDistribution: new Map(),
        tierPopularity: new Map(),
        hourlyVolume: [],
        recentActivity: []
      },
      bridge: { 
        supportedPairs: new Map(), 
        rates: new Map(), 
        pendingSwaps: [] 
      },
      ui: { 
        selectedTier: 0, 
        selectedToken: 'CORE', 
        currentView: 'dashboard', 
        notifications: [], 
        loading: false, 
        errors: [] 
      }
    };
    this.listeners = new Set();
    this.initializeState();
  }

  initializeState() {
    CONFIG.LOTTERY_TIERS.forEach(tier => {
      // ✅ FIXED: Properly initialize prizePool as a Map
      this.state.rounds.set(tier.id, {
        ...tier,
        players: [],
        prizePool: new Map([['CORE', 0]]), // ✅ Initialize as Map
        status: 'open', // ✅ Changed from 'active' to 'open'
        startTime: Date.now(),
        endTime: Date.now() + tier.duration,
        winners: [],
        roundNumber: 1
      });
      this.state.activeRounds.add(tier.id);
      this.state.analytics.tierPopularity.set(tier.id, 0);
    });
    
    Object.keys(CONFIG.SUPPORTED_TOKENS).forEach(token => {
      this.state.analytics.tokenDistribution.set(token, 0);
    });
    
    for (let i = 0; i < 24; i++) {
      this.state.analytics.hourlyVolume.push({
        hour: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).getHours(),
        volume: Math.random() * 1000
      });
    }
  }

  subscribe(callback) { 
    this.listeners.add(callback); 
    return () => this.listeners.delete(callback); 
  }
  
  notify() { 
    this.listeners.forEach(callback => callback(this.state)); 
  }
  
  updateState(updates) { 
    this.state = { ...this.state, ...updates }; 
    this.notify(); 
  }

  // Web3 Connection
  async connectWallet(walletType = 'metamask') {
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);

      try {
  await provider.send('wallet_switchEthereumChain', [{ chainId: `0x${CHAIN_ID.toString(16)}` }]);
} catch (switchError) {
  // 4902 = chain not in wallet
  if (switchError.code === 4902) {
    await provider.send('wallet_addEthereumChain', [{
      chainId: `0x${CHAIN_ID.toString(16)}`,
      chainName: CONFIG.CORE_TESTNET2.name,
      nativeCurrency: CONFIG.CORE_TESTNET2.nativeCurrency,
      rpcUrls: [CONFIG.CORE_TESTNET2.rpcUrl],
      blockExplorerUrls: [CONFIG.CORE_TESTNET2.explorerUrl]
    }]);
  } else {
    throw switchError;
  }
}

      this.signer = await provider.getSigner();
      this.provider = provider;
      this.contract = new ethers.Contract(LOTTERY_ADDRESS, LOTTERY_ABI, this.signer);

      this.initializeEventListeners();
      
      const address = await this.signer.getAddress();
      await this.loadBalances(address);

      this.updateState({
        wallet: { ...this.state.wallet, connected: true, address }
      });
      return true;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  async loadBalances(address) {
    for (const [symbol, token] of Object.entries(CONFIG.SUPPORTED_TOKENS)) {
      try {
        let balance;
        if (token.address === 'native') {
          balance = await this.provider.getBalance(address);
        } else {
          const contract = new ethers.Contract(token.address, ERC20_ABI, this.provider);
          balance = await contract.balanceOf(address);
        }
        this.state.wallet.balances.set(symbol, ethers.formatUnits(balance, token.decimals));
      } catch {}
    }
    this.notify();
  }

  async enterLottery(tierId, amount, tokenSymbol) {
    try {
      const tierConfig = CONFIG.LOTTERY_TIERS.find(t => t.id === tierId);
      if (!tierConfig) throw new Error(`Invalid tier ID: ${tierId}`);

      const playerAddress = this.state.wallet.address;
      if (!playerAddress) throw new Error('Wallet not connected');

      const requiredEntry = tierConfig.minEntry.toString();
      const requiredWei = ethers.parseUnits(requiredEntry, 18);
      const amountWei = ethers.parseUnits(amount.toString(), 18);

      if (amountWei !== requiredWei) {
        throw new Error(`Entry amount must be exactly ${requiredEntry} ${tokenSymbol}`);
      }

      const tokenData = CONFIG.SUPPORTED_TOKENS[tokenSymbol];
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (tokenData.address === 'native') {
        await this.contract.connect(signer).enterLottery(tierId, { value: amountWei });
      } else {
        const tokenContract = new ethers.Contract(tokenData.address, ERC20_ABI, signer);
        const allowance = await tokenContract.allowance(playerAddress, LOTTERY_ADDRESS);
        if (allowance < amountWei) {
          const approveTx = await tokenContract.approve(LOTTERY_ADDRESS, amountWei);
          await approveTx.wait();
        }
        await this.contract.connect(signer).enterLottery(tierId, { value: 0 });
      }

      // handle round updates
      const rounds = new Map(this.state.rounds);
let currentRound = rounds.get(tierId);

if (!currentRound || currentRound.status !== 'open') {
  currentRound = {
    id: Date.now(),
    tierId,
    players: [],
    prizePool: new Map([['CORE', 0]]),
    startTime: Date.now(),
    status: 'open',
    timer: null,
    roundNumber: 1,
    endTime: Date.now() + tierConfig.duration,
    winners: []
  };
}

if (!currentRound.players.includes(playerAddress)) {
  currentRound.players.push(playerAddress);
  const currentPool = currentRound.prizePool.get(tokenSymbol) || 0;
  currentRound.prizePool.set(tokenSymbol, currentPool + parseFloat(amount));
}

if (currentRound.players.length === 1) {
  currentRound.timer = setTimeout(() => {
    if (currentRound.status === 'open') {
      this.processRound(tierId);
    }
  }, tierConfig.duration);
}

if (currentRound.players.length >= tierConfig.maxPlayers) {
  clearTimeout(currentRound.timer);
  this.processRound(tierId);
}

rounds.set(tierId, currentRound);
this.updateState({ rounds });
this.notify(`Successfully entered ${tierConfig.name} tier lottery`);
    } catch (error) {
      console.error('Error entering lottery:', error);
      this.notify(`Error: ${error.message}`);
    }
  }

  async processRound(tierId) {
  try {
    const tierConfig = CONFIG.LOTTERY_TIERS.find(t => t.id === tierId);
    if (!tierConfig) throw new Error(`Invalid tier ID: ${tierId}`);

    const rounds = new Map(this.state.rounds);
    let currentRound = rounds.get(tierId);

    if (!currentRound || currentRound.status !== 'open') {
      throw new Error(`No active round for tier ${tierId}`);
    }

    currentRound.status = 'drawing';
    rounds.set(tierId, currentRound);
    this.updateState({ rounds });
    this.notify(`Round ${currentRound.id} (${tierConfig.name}) is now drawing...`);

    if (!this.contract) throw new Error('Contract not initialized');

    // Request a draw from the smart contract
    const tx = await this.contract.drawWinners(tierId, currentRound.players);
    await tx.wait();

    currentRound.drawingRequestTx = tx.hash;
    rounds.set(tierId, currentRound);
    this.updateState({ rounds });

  } catch (error) {
    console.error(`processRound error for tier ${tierId}:`, error);
    this.notify(`Error processing round: ${error.message}`);

    try {
      const rounds = new Map(this.state.rounds);
      const currentRound = rounds.get(tierId);
      if (currentRound && currentRound.status === 'drawing') {
        currentRound.status = 'open';
        delete currentRound.drawingRequestTx;
        rounds.set(tierId, currentRound);
        this.updateState({ rounds });
      }
   } catch (e) {
      console.error('Failed to revert drawing state:', e);
    }
  }
  }

  initializeEventListeners() {
    if (!this.contract) {
      console.error('Contract not initialized for event listeners');
      return;
    }

    this.contract.removeAllListeners('LotteryEntered');
    this.contract.removeAllListeners('WinnersSelected');
    this.contract.removeAllListeners('RoundStarted');

    this.contract.on('LotteryEntered', (tierId, player) => {
      const rounds = new Map(this.state.rounds);
      let currentRound = rounds.get(Number(tierId));

      if (!currentRound || currentRound.status !== 'open') {
        currentRound = {
          id: Date.now(),
          tierId: Number(tierId),
          players: [],
          prizePool: new Map([['CORE', 0]]), // ✅ Initialize as Map
          startTime: Date.now(),
          status: 'open',
          timer: null,
          roundNumber: 1,
          endTime: Date.now() + (CONFIG.LOTTERY_TIERS.find(t => t.id === Number(tierId))?.duration || 600000),
          winners: []
        };
      }

      if (!currentRound.players.includes(player)) {
        currentRound.players.push(player);
      }

      rounds.set(Number(tierId), currentRound);
      this.updateState({ rounds });
      this.notify(`Player ${player} joined tier ${tierId}`);
    });

    this.contract.on('WinnersSelected', (tierId, winners, amounts) => {
      const rounds = new Map(this.state.rounds);
      let currentRound = rounds.get(Number(tierId));

      if (currentRound) {
        currentRound.status = 'completed';
        currentRound.winners = winners;
        currentRound.endedAt = Date.now();
        rounds.set(Number(tierId), currentRound);
      }

      this.updateState({ rounds });
      this.notify(`Winners selected for tier ${tierId}: ${winners.join(', ')}`);
    });

    this.contract.on('RoundStarted', (tierId, roundId) => {
      const rounds = new Map(this.state.rounds);
      const tierConfig = CONFIG.LOTTERY_TIERS.find(t => t.id === Number(tierId));
      
      rounds.set(Number(tierId), {
        id: Number(roundId),
        tierId: Number(tierId),
        players: [],
        prizePool: new Map([['CORE', 0]]), // ✅ Initialize as Map
        startTime: Date.now(),
        endTime: Date.now() + (tierConfig?.duration || 600000),
        status: 'open',
        timer: null,
        roundNumber: Number(roundId),
        winners: []
      });
      this.updateState({ rounds });
      this.notify(`New round ${roundId} started for tier ${tierId}`);
    });
  }
}


// =====================================================================================
//  UI COMPONENTS 
// =====================================================================================

//MultiCurrencyWallet
const MultiCurrencyWallet = ({ stateManager, onTokenSelect, onAmountChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState('CORE');
  const [amount, setAmount] = useState('');
  const [showBalance, setShowBalance] = useState(true);

  const tokens = Object.entries(CONFIG.SUPPORTED_TOKENS);
  const selectedTokenData = CONFIG.SUPPORTED_TOKENS[selectedToken];

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
    onTokenSelect(token);
    setIsOpen(false);
  };

  const handleAmountChange = (value) => {
    setAmount(value);
    onAmountChange(value);
  };

  const formatBalance = (balance) => {
    if (!balance) return '0.00';
    const val = parseFloat(balance);
    if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(2)}K`;
    return val.toFixed(4);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Wallet size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Multi-Currency Wallet</h2>
              <p className="text-blue-100 text-sm">Core Blockchain Powered</p>
            </div>
          </div>
          <button onClick={() => setShowBalance(!showBalance)} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors">
            {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-100">Total Portfolio Value</span>
            <div className="flex items-center space-x-2">
              <TrendingUp size={16} className="text-green-300" />
              <span className="text-green-300 text-sm">+12.5%</span>
            </div>
          </div>
          <div className="text-2xl font-bold mt-1">
            ${showBalance ? Array.from(stateManager.state.wallet.balances.entries()).reduce((sum, [sym, bal]) => {
              const rate = { CORE: 0.85, USDT: 1, USDC: 1, WBTC: 42000 }[sym] || 0;
              return sum + (parseFloat(bal) * rate);
            }, 0).toFixed(2) : '••••••'}
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Token</label>
        <div className="relative">
          <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 border-2 border-gray-300 rounded-xl hover:border-blue-400 transition-colors bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${selectedTokenData.gradient} flex items-center justify-center text-white font-bold`}>
                {selectedTokenData.icon}
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">{selectedTokenData.name}</div>
                <div className="text-sm text-gray-500">{selectedTokenData.symbol}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {showBalance && (
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatBalance(stateManager.state.wallet.balances.get(selectedToken))}</div>
                  <div className="text-sm text-gray-500">≈ ${(parseFloat(stateManager.state.wallet.balances.get(selectedToken) || 0) * 0.85).toFixed(2)}</div>
                </div>
              )}
              <ChevronDown size={20} className="text-gray-400" />
            </div>
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
              {tokens.map(([symbol, token]) => (
                <button key={symbol} onClick={() => handleTokenSelect(symbol)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${token.gradient} flex items-center justify-center text-white text-sm`}>
                      {token.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{token.name}</div>
                      <div className="text-sm text-gray-500">{token.symbol}</div>
                    </div>
                  </div>
                  {showBalance && (
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatBalance(stateManager.state.wallet.balances.get(symbol))}</div>
                      <div className="text-sm text-gray-500">${(parseFloat(stateManager.state.wallet.balances.get(symbol) || 0) * ({ CORE: 0.85, USDT: 1, USDC: 1, WBTC: 42000 }[symbol] || 0)).toFixed(2)}</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
        <div className="relative">
          <input type="number" value={amount} onChange={(e) => handleAmountChange(e.target.value)} placeholder="0.00" className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-blue-400 focus:outline-none text-2xl font-semibold text-right" />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <span className="text-2xl">{selectedTokenData.icon}</span>
            <span className="font-semibold text-gray-600">{selectedTokenData.symbol}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          {['25%', '50%', '75%', 'MAX'].map((percentage) => (
            <button key={percentage} onClick={() => handleAmountChange((parseFloat(stateManager.state.wallet.balances.get(selectedToken) || 0) * { '25%': 0.25, '50%': 0.5, '75%': 0.75, MAX: 1 }[percentage]).toFixed(2))} className="py-2 px-3 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-medium">
              {percentage}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <ArrowUpDown size={16} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Instant Token Bridge</span>
            </div>
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">0.1% Fee</span>
          </div>
          <p className="text-xs text-purple-600">Swap tokens instantly within the platform with minimal fees</p>
        </div>
      </div>
    </div>
  );
};


// AnalyticsDashboard (Live Auto-Refreshing)
const AnalyticsDashboard = ({ stateManager }) => {
  const [timeframe, setTimeframe] = useState('24h');
  const [liveData, setLiveData] = useState({
    totalRounds: 0,
    totalPlayers: 0,
    totalVolume: 0,
    hourlyVolume: [],
    tokenDistribution: new Map(),
    tierStats: [],
  });

  const formatCurrency = (amount) => {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(2)}K`;
    return `$${amount.toFixed(2)}`;
  };

  const recalcAnalytics = () => {
    const gameState = stateManager.state;
    const allRounds = Array.from(gameState.rounds.values());

    const totalRounds = allRounds.length;
    const totalPlayers = allRounds.reduce((sum, r) => sum + (r.players?.length || 0), 0);
    const totalVolume = allRounds.reduce((sum, r) => {
      let roundTotal = 0;
      r.prizePool?.forEach(amount => { roundTotal += amount; });
      return sum + roundTotal;
    }, 0);

    const now = Date.now();
    const hourlyVolume = Array.from({ length: 24 }, (_, i) => {
      const hourStart = now - (23 - i) * 60 * 60 * 1000;
      const volume = allRounds.reduce((sum, r) => {
        if (r.startTime >= hourStart && r.startTime < hourStart + 60 * 60 * 1000) {
          let roundTotal = 0;
          r.prizePool?.forEach(amount => { roundTotal += amount; });
          return sum + roundTotal;
        }
        return sum;
      }, 0);
      return { hour: i, volume };
    });

    const tokenDistribution = new Map();
    allRounds.forEach(round => {
      round.prizePoolTokens?.forEach((amount, token) => {
        tokenDistribution.set(token, (tokenDistribution.get(token) || 0) + amount);
      });
    });

    const tierStats = CONFIG.LOTTERY_TIERS.map(tier => {
      const tierRounds = allRounds.filter(r => r.tierId === tier.id);
      const entries = tierRounds.reduce((sum, r) => sum + (r.players?.length || 0), 0);
      const volume = tierRounds.reduce((sum, r) => {
        let v = 0;
        r.prizePool?.forEach(amount => { v += amount; });
        return sum + v;
      }, 0);
      const avgPrize = volume * 0.95 / (tier.winners || 1);
      const winRate = (tier.winners / (tier.maxPlayers || 1)) * 100;
      return { tier, entries, volume, avgPrize, winRate };
    });

    setLiveData({ totalRounds, totalPlayers, totalVolume, hourlyVolume, tokenDistribution, tierStats });
  };

  useEffect(() => {
    recalcAnalytics();
    const interval = setInterval(recalcAnalytics, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ title, value, change, icon: Icon, gradient, trend }) => (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${gradient} p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <div className="flex items-center mt-2 space-x-1">
            {trend === 'up' ? <TrendingUp size={14} className="text-green-300" /> : <TrendingDown size={14} className="text-red-300" />}
            <span className={`text-sm ${trend === 'up' ? 'text-green-300' : 'text-red-300'}`}>{change}</span>
          </div>
        </div>
        <div className="bg-white/20 p-3 rounded-full"><Icon size={32} /></div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
          <p className="text-gray-600">Real-time lottery platform insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 bg-white">
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={16} /><span>Export</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Volume" value={formatCurrency(liveData.totalVolume)} change="+0%" icon={DollarSign} gradient="from-green-500 to-emerald-600" trend="up" />
        <MetricCard title="Active Players" value={liveData.totalPlayers.toLocaleString()} change="+0%" icon={Users} gradient="from-blue-500 to-indigo-600" trend="up" />
        <MetricCard title="Total Rounds" value={liveData.totalRounds.toLocaleString()} change="+0%" icon={Trophy} gradient="from-purple-500 to-pink-600" trend="up" />
        <MetricCard title="Win Rate" value={`${((CONFIG.LOTTERY_TIERS.reduce((sum, t) => sum + t.winners, 0) / (liveData.totalPlayers || 1)) * 100).toFixed(1)}%`} change="+0%" icon={Target} gradient="from-orange-500 to-red-600" trend="up" />
      </div>

      {/* Volume Trends + Token Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Volume Trends */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Volume Trends</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Live Update:</span>
              <span className="text-green-600 font-semibold">Yes</span>
            </div>
          </div>
          <div className="h-64 flex items-end space-x-2">
            {liveData.hourlyVolume.map((data, index) => (
              <div key={index} className="bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-sm flex-1 transition-all duration-500 hover:from-blue-500 hover:to-blue-700" style={{ height: `${Math.max(20, (data.volume / (liveData.totalVolume || 1)) * 200)}px` }} title={`${data.hour}:00 - ${data.volume.toFixed(2)}`} />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-500">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
          </div>
        </div>

        {/* Token Distribution */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Token Distribution</h3>
          <div className="space-y-4">
            {Array.from(liveData.tokenDistribution.entries()).map(([token, volume]) => {
              const tokenData = CONFIG.SUPPORTED_TOKENS[token] || {};
              const percentage = (volume / liveData.totalVolume) * 100 || 0;
              return (
                <div key={token} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{tokenData.icon}</span>
                      <span className="font-medium text-gray-900">{token}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full bg-gradient-to-r ${tokenData.gradient || ''} transition-all duration-1000`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tier Performance */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Tier Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-semibold text-gray-700">Tier</th>
                <th className="text-left py-3 font-semibold text-gray-700">Entries</th>
                <th className="text-left py-3 font-semibold text-gray-700">Volume</th>
                <th className="text-left py-3 font-semibold text-gray-700">Avg Prize</th>
                <th className="text-left py-3 font-semibold text-gray-700">Win Rate</th>
                <th className="text-left py-3 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {liveData.tierStats.map(({ tier, entries, volume, avgPrize, winRate }) => (
                <tr key={tier.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 flex items-center space-x-3">
                    <span className="text-2xl">{tier.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{tier.name}</div>
                      <div className="text-sm text-gray-500">Min: {tier.minEntry} CORE</div>
                    </div>
                  </td>
                  <td className="py-4 font-semibold text-gray-900">{entries.toLocaleString()}</td>
                  <td className="py-4 font-semibold text-green-600">{formatCurrency(volume)}</td>
                  <td className="py-4 font-semibold text-purple-600">{formatCurrency(avgPrize)}</td>
                  <td className="py-4 text-blue-600 font-semibold">{winRate.toFixed(1)}%</td>
                  <td className="py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

//  LotteryRoundDisplay 

const LotteryRoundDisplay = ({ tier, round, stateManager, onEnterRound }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  // ✅ SAFETY CHECK: Return early if round is not properly initialized
  if (!round || !round.prizePool) {
    return (
      <div className="rounded-2xl bg-gray-100 border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <Loader2 size={24} className="animate-spin mx-auto mb-2" />
          <p>Loading round data...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
  const timer = setInterval(() => {
    const timeLeft = Math.max(0, round.endTime - Date.now());
    setTimeLeft(timeLeft);

    // Auto-trigger draw when round is full OR time expires
    if (
      (round.players.length >= tier.maxPlayers || timeLeft === 0) &&
      round.status === 'open'
    ) {
      clearInterval(timer);
      stateManager.processRound(tier.id);
    }
  }, 1000);
  return () => clearInterval(timer);
}, [round.endTime, round.players.length, round.status, tier.id, stateManager]);

  const formatTimeLeft = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  const getTotalPrizePool = () => {
    // Safe handling of prizePool
    if (!round || !round.prizePool || typeof round.prizePool.entries !== 'function') return 0;
    
    const poolEntries = Array.from(round.prizePool.entries());
    return poolEntries.reduce((sum, [token, amount]) => {
      const rate = { CORE: 0.85, USDT: 1, USDC: 1, WBTC: 42000 }[token] || 0;
      return sum + (amount * rate);
    }, 0);
  };

  const getProgressPercentage = () => Math.min((round.players.length / tier.maxPlayers) * 100, 100);
  const isUrgent = timeLeft < 5 * 60 * 1000;
  const isCritical = timeLeft < 60 * 1000;

  const handleEnter = async () => {
  setIsEntering(true);
  try {
    await stateManager.enterLottery(tier.id, tier.minEntry, 'CORE');
    if (onEnterRound) onEnterRound(); // ✅ triggers confirmation
  } catch (error) {
    console.error('Enter failed:', error);
  } finally {
    setIsEntering(false);
  }
};

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tier.bgGradient} border-2 ${tier.borderColor} transition-all duration-500 hover:shadow-2xl hover:scale-105 group`}>
      <div className="absolute inset-0 opacity-10">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tier.gradient} rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-1000`} />
        <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${tier.gradient} rounded-full translate-y-12 -translate-x-12 group-hover:scale-150 transition-transform duration-1000 delay-200`} />
      </div>

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`relative w-12 h-12 rounded-full bg-gradient-to-r ${tier.gradient} flex items-center justify-center text-white text-2xl shadow-lg`}>
              {tier.icon}
              {round.status === 'drawing' && <div className="absolute inset-0 rounded-full border-2 border-white animate-spin" />}
            </div>
            <div>
              <h3 className={`text-xl font-bold bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>{tier.name} Tier</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Hash size={12} /><span>Round #{round.roundNumber}</span><span className="text-gray-400">•</span><span>{tier.minEntry} CORE min</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">${getTotalPrizePool().toLocaleString()}</div>
            <div className="text-sm text-gray-500">Prize Pool</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/70 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-1"><Users size={14} className="text-gray-600" /><span className="text-xs font-medium text-gray-600">Players</span></div>
            <div className="flex items-baseline space-x-1"><span className="text-lg font-bold text-gray-900">{round.players.length}</span><span className="text-sm text-gray-500">/ {tier.maxPlayers}</span></div>
          </div>

          <div className="bg-white/70 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-1"><Timer size={14} className={`${isCritical ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-gray-600'}`} /><span className="text-xs font-medium text-gray-600">Time Left</span></div>
            <div className={`text-lg font-bold ${isCritical ? 'text-red-600 animate-pulse' : isUrgent ? 'text-orange-600' : 'text-gray-900'}`}>{round.status === 'drawing' ? 'Drawing...' : formatTimeLeft(timeLeft)}</div>
          </div>

          <div className="bg-white/70 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-1"><Trophy size={14} className="text-gray-600" /><span className="text-xs font-medium text-gray-600">Winners</span></div>
            <div className="text-lg font-bold text-gray-900">{tier.winners}</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Round Progress</span>
            <span className="text-sm font-semibold text-gray-900">{getProgressPercentage().toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className={`h-3 rounded-full bg-gradient-to-r ${tier.gradient} transition-all duration-1000 relative overflow-hidden`} style={{ width: `${getProgressPercentage()}%` }}>
              <div className="absolute inset-0 bg-white/30 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>0 players</span>
            <span>{tier.maxPlayers} players (Auto-draw)</span>
          </div>
        </div>

        {/* Safe check for prizePool size */}
        {round.prizePool && typeof round.prizePool.entries === 'function' && round.prizePool.size > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Coins size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Prize Pool Breakdown</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from(round.prizePool.entries()).map(([token, amount]) => {
                const tokenData = CONFIG.SUPPORTED_TOKENS[token];
                if (!tokenData) return null;
                return (
                  <div key={token} className="flex items-center space-x-2 bg-white/50 rounded-lg p-2">
                    <span className="text-sm">{tokenData.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{amount.toFixed(2)} {token}</div>
                      <div className="text-xs text-gray-500">Per winner: {(amount * 0.95 / tier.winners).toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {round.status === 'drawing' ? (
            <div className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-xl flex items-center justify-center space-x-2">
              <Loader2 size={20} className="animate-spin" />
              <span className="font-semibold">Drawing Winners...</span>
            </div>
          ) : round.players.length >= tier.maxPlayers ? (
            <div className="w-full bg-gray-400 text-white py-4 px-6 rounded-xl text-center font-semibold">Round Full - Auto-drawing Soon</div>
          ) : (
            <button
  onClick={() => onEnterRound(tier.id)}
  disabled={round.players.length >= tier.maxPlayers || isEntering}
  className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-r ${tier.gradient} disabled:opacity-50 disabled:cursor-not-allowed`}
>
  <div className="relative flex items-center justify-center space-x-2">
    <Zap size={20} />
    <span>
      {round.players.length >= tier.maxPlayers
        ? 'Round Full'
        : isEntering
        ? 'Entering...'
        : `Enter Round - ${tier.minEntry} CORE+`}
    </span>
  </div>
</button>
          )}

          <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <span>{showDetails ? 'Hide' : 'Show'} Details</span>
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showDetails && (
          <div className="mt-6 space-y-4 border-t border-white/50 pt-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Entries</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {round.players.slice(-5).map((player, index) => (
                  <div key={index} className="flex items-center justify-between text-xs bg-white/50 rounded-lg p-2">
                    <span className="font-mono">{typeof player === 'string' ? `${player.slice(0, 6)}...${player.slice(-4)}` : `Player ${index + 1}`}</span>
                    <div className="flex items-center space-x-1">
                      <span>{tier.minEntry} CORE</span>
                      <span className="text-gray-500">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-600">Avg Entry Size</div>
                <div className="font-semibold text-gray-900">{tier.minEntry.toFixed(3)} CORE</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Win Probability</div>
                <div className="font-semibold text-purple-600">{((tier.winners / Math.max(tier.maxPlayers, round.players.length + 1)) * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-0.5 right-0.5">
          {round.status === 'open' && <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1"><div className="w-2 h-2 bg-white rounded-full animate-pulse" /><span>LIVE</span></div>}
          {round.status === 'drawing' && <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1"><Loader2 size={12} className="animate-spin" /><span>DRAWING</span></div>}
        </div>
      </div>
    </div>
  );
};

// =====================================================================================
// MAIN APP 
// =====================================================================================
const AdvancedLotterySystem = () => {
  const [stateManager] = useState(() => new EnhancedLotteryStateManager());
  const [gameState, setGameState] = useState(stateManager.state);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedToken, setSelectedToken] = useState('CORE');
  const [entryAmount, setEntryAmount] = useState('');
const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
 const [enteredTier, setEnteredTier] = useState(null);
const [showConfirmation, setShowConfirmation] = useState(false);
const [selectedTierForEntry, setSelectedTierForEntry] = useState(null);

  useEffect(() => {
    return stateManager.subscribe(setGameState);
  }, [stateManager]);

  const connectWallet = async () => {
  setLoading(true);
  try {
    await stateManager.connectWallet();
    setWalletConnected(true); // ✅ this is the key change
    addNotification('success', 'Wallet Connected', 'Successfully connected to Core Blockchain');
    setCurrentView('dashboard'); // optional, if you want to force view change
  } catch (error) {
    addNotification('error', 'Connection Failed', error.message);
  } finally {
    setLoading(false);
  }
};

  const addNotification = (type, title, message) => {
    const notification = { id: Date.now(), type, title, message, timestamp: Date.now() };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== notification.id)), 5000);
  };


  // Wallet Connect Welcome Screen
    const renderLobbyView = () => {
  const activeRounds = Array.from(gameState.activeRounds)
    .map(id => gameState.rounds.get(id))
    .filter(Boolean);

  const totalActivePlayers = activeRounds.reduce((sum, round) => sum + (round.players?.length || 0), 0);

  const totalPrizePool = activeRounds.reduce((sum, round) => {
    let roundTotal = 0;
    round.prizePool.forEach((amount) => { roundTotal += amount; });
    return sum + roundTotal;
  }, 0);

  // Use notification-based error display if present
  const errorNotification = notifications.find(n => n.type === 'error');
  const clearError = () => {
    if (errorNotification) setNotifications(prev => prev.filter(n => n.id !== errorNotification.id));
  };

  return (
    <div className="flex items-center justify-center py-16 space-x-30 min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      <img 
        src={CoreDaoLogo} 
        alt="Core DAO" 
        className="w-500 h-500 animate-spin-slow"
      />

      <div className="text-center flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
          Welcome to CoreLotto Pro!
        </h1>
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent"></h2>
        <p className="text-xl text-gray-600 mb-20">
          <span>An advanced multi-tier lottery system, secure, transparent and fair!</span><br />
          <span>30 Participants, 3 Winners, Equal and Instant Rewards!</span><br />
          <span>Powered by Core Blockchain!</span>
        </p>

        <button
          onClick={connectWallet}
          disabled={loading}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet size={20} />
              <span>Connect Wallet</span>
            </>
          )}
        </button>

        <div className="mt-6 text-sm text-gray-500">
          <p>Supported Wallets: Rabby, MetaMask, WalletConnect, and other Web3 wallets</p>
          <p className="mt-2">
            Make sure you're connected to <span className="font-semibold">Core Testnet</span>
          </p>
        </div>

        {errorNotification && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle size={20} />
              <span>{errorNotification.message}</span>
            </div>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              <X size={16} />
            </button>
          </div>
        )}

        {/* small stats (kept purely informational) */}
        <div className="mt-6 text-sm text-gray-500">
          <div>Total active players: <span className="font-semibold">{totalActivePlayers}</span></div>
          <div>Total prize pool (raw units): <span className="font-semibold">{totalPrizePool.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
};


const handleTierEntry = (tierId) => {
  setSelectedTierForEntry(tierId);
  setCurrentView('entry');
};


// Navigation
  const NavButton = ({ view, icon: Icon, label, badge }) => (
    <button onClick={() => setCurrentView(view)} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${currentView === view ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
      <Icon size={20} />
      <span className="font-medium">{label}</span>
      {badge && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">{badge}</span>}
    </button>
  );

  const renderEntryView = () => {
  if (!selectedTierForEntry) return null;
  
  const tierData = CONFIG.LOTTERY_TIERS.find(t => t.id === selectedTierForEntry);
  const round = gameState.rounds.get(selectedTierForEntry);

  return (
    <div className="max-w-2xl mx-auto">
    

      <div className={`bg-gradient-to-r ${tierData.bgGradient} rounded-2xl border-2 ${tierData.borderColor} p-8`}>
        <div className="text-center">
          <span className="text-6xl mb-4 block">{tierData.icon}</span>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{tierData.name} Tier</h1>
          <p className="text-gray-600 mb-8">Entry Fee: {tierData.minEntry} CORE</p>

          {/* Round Information */}
          <div className="bg-white/80 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-lg mb-4">Current Round #{round?.roundNumber || 1}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Prize Pool</p>
                <p className="font-bold text-green-600 text-lg">
                  {(Array.from(round?.prizePool?.values() || [0]).reduce((a, b) => a + b, 0) + tierData.minEntry).toFixed(3)} CORE
                </p>
              </div>
              <div>
                <p className="text-gray-600">Players Joined</p>
                <p className="font-bold text-blue-600 text-lg">{round?.players?.length || 0}/{tierData.maxPlayers}</p>
              </div>
              <div>
                <p className="text-gray-600">Time Remaining</p>
                <p className="font-bold text-orange-600 text-lg">
                  {Math.max(0, Math.floor((round?.endTime - Date.now()) / 1000 / 60))}m
                </p>
              </div>
              <div>
                <p className="text-gray-600">Winner Reward</p>
                <p className="font-bold text-purple-600 text-lg">
                  {(((Array.from(round?.prizePool?.values() || [0]).reduce((a, b) => a + b, 0) + tierData.minEntry) * 0.95) / tierData.winners).toFixed(3)} CORE
                </p>
              </div>
            </div>
          </div>

          {/* Entry Rules */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <AlertCircle size={16} className="mr-2" />
              Entry Rules
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Maximum {tierData.maxPlayers} players per round</li>
              <li>• {tierData.winners} winners selected randomly</li>
              <li>• 95% of prize pool distributed to winners</li>
              <li>• Round ends automatically when full or after {tierData.duration / (1000 * 60)} minutes</li>
              <li>• Winners can claim rewards immediately after draw</li>
            </ul>
          </div>

          {/* Entry Button */}
        <button
  onClick={async () => {
  const tier = CONFIG.LOTTERY_TIERS.find(t => t.id === selectedTierForEntry);
  setLoading(true);
  try {
    await stateManager.enterLottery(selectedTierForEntry, tier.minEntry.toString(), 'CORE');
    setCurrentView('confirmation');
  } catch (err) {
    addNotification('error', 'Entry Failed', err.message);
  } finally {
    setLoading(false);
  }
}}
  className={`w-full py-4 px-6 rounded-lg font-bold text-lg bg-gradient-to-r ${tierData.gradient} text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
>
  Enter Round - {tierData.minEntry} CORE
</button>
        </div>
      </div>
    </div>
  );
};


const renderConfirmationView = () => {
  if (!selectedTierForEntry) return null;
  
  const tierData = CONFIG.LOTTERY_TIERS.find(t => t.id === selectedTierForEntry);
  const round = gameState.rounds.get(selectedTierForEntry);
  
  if (!tierData) return null;
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
        <div className="mb-6">
          <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Entry Confirmed!</h1>
          <p className="text-gray-600">You have successfully entered the {tierData?.name} tier</p>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">{tierData?.icon}</span>
            <h3 className="text-xl font-bold">{tierData?.name} Tier</h3>
          </div>
          <p className="text-gray-600 mb-4">Round #{round?.roundNumber || 1}</p>
          <div className="text-sm text-gray-700">
            <p>You're now waiting for the draw results!</p>
            <p>Winners will be announced when the round ends.</p>
          </div>
        </div>

        <div className="space-y-4">
           <button
    onClick={() => {
      setCurrentView('dashboard'); // Go to dashboard instead of lobby
      setSelectedTierForEntry(null); // Clear tier selection
    }}
    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
  >
    Return to Dashboard
  </button>
  <button
    onClick={() => {
      setCurrentView('lottery'); // Go to lottery rounds
      setSelectedTierForEntry(null); // Clear tier selection
    }}
    className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
  >
    View Other Rounds
  </button>
        </div>
      </div>
    </div>
  );
};


if (!walletConnected) {
    return renderLobbyView();
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">🔥</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">CoreLotto Pro</h1>
                <p className="text-sm text-gray-500">Multi-Currency Lottery Platform</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <NavButton view="dashboard" icon={Home} label="Dashboard" />
              <NavButton view="lottery" icon={Trophy} label="Lottery" badge={gameState.activeRounds.size} />
              <NavButton view="analytics" icon={BarChart3} label="Analytics" />
              <NavButton view="wallet" icon={Wallet} label="Wallet" />
            </div>

            <div className="flex items-center space-x-4">
              {gameState.wallet.connected ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{gameState.wallet.address?.slice(0, 6)}...{gameState.wallet.address?.slice(-4)}</div>
                    <div className="text-xs text-green-600">Core Testnet</div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">{gameState.wallet.address?.slice(2, 4).toUpperCase()}</div>
                </div>
              ) : (
                <button onClick={connectWallet} disabled={loading} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                  {loading ? <><Loader2 size={20} className="animate-spin" /><span>Connecting...</span></> : <><Wallet size={20} /><span>Connect Wallet</span></>}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      
       <main className="max-w-7xl mx-auto px-6 py-8">
  {currentView === 'entry' ? (
    renderEntryView()
  ) : currentView === 'confirmation' ? (
    renderConfirmationView()
  ) : currentView === 'dashboard' ? (
    <>
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to the Future of Lottery</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Experience the most advanced multi-currency lottery platform on Core Blockchain. Fair, transparent, and instantly rewarding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Volume</p>
              <p className="text-3xl font-bold">$2.4M</p>
              <p className="text-blue-200 text-sm">+23% this week</p>
            </div>
            <DollarSign size={36} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Players</p>
              <p className="text-3xl font-bold">15,247</p>
              <p className="text-purple-200 text-sm">+8% this week</p>
            </div>
            <Users size={36} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Rounds</p>
              <p className="text-3xl font-bold">89,432</p>
              <p className="text-orange-200 text-sm">+156 today</p>
            </div>
            <Trophy size={36} className="text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Win Rate</p>
              <p className="text-3xl font-bold">18.7%</p>
              <p className="text-green-200 text-sm">Above average</p>
            </div>
            <Target size={36} className="text-green-200" />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Featured Lottery Rounds</h3>
          <button
            onClick={() => setCurrentView('lottery')}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {CONFIG.LOTTERY_TIERS.map(tier => {
            const round = gameState.rounds.get(tier.id);
            return round ? (
              <LotteryRoundDisplay
                key={tier.id}
                tier={tier}
                round={round}
                stateManager={stateManager}
                onEnterRound={() => handleTierEntry(tier.id)}
              />
            ) : null;
          })}
        </div>
      </div>
    </>
  ) : currentView === 'lottery' ? (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Active Lottery Rounds</h2>
        <p className="text-gray-600">Choose your tier and enter for a chance to win big!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {CONFIG.LOTTERY_TIERS.map(tier => {
          const round = gameState.rounds.get(tier.id);
          return round ? (
            <LotteryRoundDisplay
              key={tier.id}
              tier={tier}
              round={round}
              stateManager={stateManager}
              onEnterRound={() => handleTierEntry(tier.id)}
            />
          ) : null;
        })}
      </div>
    </div>
  ) : null}

         
       
        {/* Analytics View */}
        {currentView === 'analytics' && <AnalyticsDashboard stateManager={stateManager} />}

        {/* Wallet View */}
        {currentView === 'wallet' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Multi-Currency Wallet</h2>
              <p className="text-gray-600">Manage your tokens and lottery entries</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2"><MultiCurrencyWallet stateManager={stateManager} onTokenSelect={setSelectedToken} onAmountChange={setEntryAmount} /></div>
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-colors"><Plus size={20} className="text-blue-600" /><span className="font-medium text-gray-900">Add Funds</span></button>
                    <button className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-colors"><ArrowUpDown size={20} className="text-purple-600" /><span className="font-medium text-gray-900">Swap Tokens</span></button>
                    <button className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-colors"><Download size={20} className="text-green-600" /><span className="font-medium text-gray-900">Withdraw</span></button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[{ type: 'entry', amount: '50 CORE', tier: 'Champion', time: '2 mins ago', status: 'pending' }, { type: 'win', amount: '127.5 USDT', tier: 'Explorer', time: '1 hour ago', status: 'completed' }].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'entry' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                          {activity.type === 'entry' ? <Trophy size={16} /> : <Gift size={16} />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{activity.type === 'entry' ? 'Lottery Entry' : 'Prize Won'}</div>
                          <div className="text-sm text-gray-500">{activity.amount} • {activity.tier}</div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${activity.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>{activity.status}</span>
                          <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                        </div>
                      </div>
                   ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Wagered</span>
                      <span className="font-semibold text-gray-900">${gameState.userStats.totalWagered.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Won</span>
                      <span className="font-semibold text-green-600">${gameState.userStats.totalWon.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Win Rate</span>
                      <span className="font-semibold text-blue-600">{(gameState.userStats.winRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rounds Played</span>
                      <span className="font-semibold text-purple-600">{gameState.userStats.roundsParticipated}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

       {/* Notifications */}
      <div className="fixed top-40 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div key={notification.id} className={`p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm max-w-sm transition-all duration-500 ${
            notification.type === 'success' ? 'bg-green-50/90 border-green-500 text-green-800' :
            notification.type === 'error' ? 'bg-red-50/90 border-red-500 text-red-800' :
            notification.type === 'warning' ? 'bg-yellow-50/90 border-yellow-500 text-yellow-800' :
            'bg-blue-50/90 border-blue-500 text-blue-800'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' && <CheckCircle size={20} className="text-green-500" />}
                {notification.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
                {notification.type === 'warning' && <AlertCircle size={20} className="text-yellow-500" />}
                {notification.type === 'info' && <Bell size={20} className="text-blue-500" />}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{notification.title}</h4>
                <p className="text-sm mt-1">{notification.message}</p>
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          <button onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}>
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button onClick={() => setCurrentView('lottery')} className={`flex flex-col items-center p-2 rounded-lg relative ${currentView === 'lottery' ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}>
            <Trophy size={20} />
            <span className="text-xs mt-1">Lottery</span>
            {gameState.activeRounds.size > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {gameState.activeRounds.size}
              </span>
            )}
          </button>
          <button onClick={() => setCurrentView('analytics')} className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'analytics' ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}>
            <BarChart3 size={20} />
            <span className="text-xs mt-1">Analytics</span>
          </button>
          <button onClick={() => setCurrentView('wallet')} className={`flex flex-col items-center p-2 rounded-lg ${currentView === 'wallet' ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}>
            <Wallet size={20} />
            <span className="text-xs mt-1">Wallet</span>
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4">
            <Loader2 size={48} className="animate-spin text-blue-600" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Processing Transaction</h3>
              <p className="text-gray-600">Please wait while we process your request...</p>
            </div>
          </div>
        </div>
      )}

       {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-black text-white mt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-2xl">
                  🔥
                </div>
                <div>
                  <h3 className="text-2xl font-bold">CoreLotto Pro</h3>
                  <p className="text-gray-400">Next-generation lottery platform</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Built on Core Blockchain with advanced multi-currency support, 
                instant rewards, and transparent smart contracts. The future of decentralized lottery gaming.
              </p>
              <div className="flex space-x-4">
                {[ '🐦', '📱', '💬', '📧' ].map((emoji, index) => (
                  <button
                    key={index}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-lg">{emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-orange-400">Platform</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div>Multi-Currency Support</div>
                <div>Instant Payouts</div>
                <div>Transparent Results</div>
                <div>Low Fees (5%)</div>
                <div>24/7 Support</div>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-orange-400">Core Blockchain</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div>Bitcoin-Powered Security</div>
                <div>Fast Transactions</div>
                <div>Low Gas Fees</div>
                <div>EVM Compatible</div>
                <div>Cross-Chain Bridge</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-400 text-sm">
                © 2025 CoreLotto Pro. Built with ❤️ on Core Blockchain. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
                <button className="hover:text-white transition-colors">Privacy Policy</button>
                <button className="hover:text-white transition-colors">Terms of Service</button>
                <button className="hover:text-white transition-colors">Audit Report</button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Advanced Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>
    </div>
  );
};

export default AdvancedLotterySystem;
