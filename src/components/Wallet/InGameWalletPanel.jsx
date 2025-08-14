/******************************************************************************************
 *  InGameWalletPanel.jsx – Fully Synced with MultiCurrencySpinWheelService
 *  Secure in-game wallet + buffered winnings system
 ******************************************************************************************/
import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, Shield, RefreshCw } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '../../config/currencies';
import { MultiCurrencySpinWheelService } from '../../services/MultiCurrencySpinWheelService';

export default function InGameWalletPanel({ selectedCurrency, setSelectedCurrency, CONFIG }) {
  const [balanceState, setBalanceState] = useState({});
  const [loading, setLoading] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [balanceVerificationStatus, setBalanceVerificationStatus] = useState('pending');

  const loadAllCurrencyBalances = async () => {
    setLoading(true);
    try {
      const balances = await MultiCurrencySpinWheelService.fetchAllBalances(selectedCurrency.symbol);
      setBalanceState(balances);
      setBalanceVerificationStatus(balances.verificationStatus);
    } catch (err) {
      console.error('Balance fetch error:', err);
      setBalanceVerificationStatus('error');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedCurrency) loadAllCurrencyBalances();
    const id = setInterval(() => {
      if (selectedCurrency) loadAllCurrencyBalances();
    }, 30000);
    return () => clearInterval(id);
  }, [selectedCurrency]);

  const handleDeposit = async () => {
    if (!depositAmount) return alert('Enter deposit amount');
    setLoading(true);
    try {
      await MultiCurrencySpinWheelService.deposit(selectedCurrency.symbol, depositAmount);
      await loadAllCurrencyBalances();
      setDepositAmount('');
      setShowWalletModal(null);
    } catch (err) {
      console.error('Deposit error:', err);
    }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return alert('Enter withdrawal amount');
    if (parseFloat(withdrawAmount) > parseFloat(balanceState.inGame)) {
      return alert('Insufficient in-game balance');
    }
    setLoading(true);
    try {
      await MultiCurrencySpinWheelService.withdraw(selectedCurrency.symbol, withdrawAmount);
      await loadAllCurrencyBalances();
      setWithdrawAmount('');
      setShowWalletModal(null);
    } catch (err) {
      console.error('Withdraw error:', err);
    }
    setLoading(false);
  };

  const handleBufferedWithdraw = async () => {
    if (parseFloat(balanceState.buffered) <= 0) {
      return alert('No buffered winnings to withdraw');
    }
    setLoading(true);
    try {
      await MultiCurrencySpinWheelService.withdrawBuffered(selectedCurrency.symbol);
      await loadAllCurrencyBalances();
    } catch (err) {
      console.error('Buffered withdraw error:', err);
    }
    setLoading(false);
  };

  const renderWalletModal = () => {
    if (!showWalletModal) return null;
    const isDeposit = showWalletModal === 'deposit';
    const val = isDeposit ? depositAmount : withdrawAmount;
    const setVal = isDeposit ? setDepositAmount : setWithdrawAmount;
    const max = isDeposit ? balanceState.wallet : balanceState.inGame;
    const ok = parseFloat(val || 0) > 0 && parseFloat(val || 0) <= parseFloat(max || 0);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
        <div className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {isDeposit ? 'Deposit' : 'Withdraw'} {selectedCurrency?.symbol || 'Token'}
            </h2>
            <button onClick={() => setShowWalletModal(null)} className="text-gray-500 hover:text-black text-2xl font-bold">
              &times;
            </button>
          </div>

          {balanceVerificationStatus !== 'verified' && (
            <div className={`border rounded-lg p-3 mb-4 flex items-center space-x-2 ${
              balanceVerificationStatus === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <AlertTriangle
                size={16}
                className={balanceVerificationStatus === 'error' ? 'text-red-600' : 'text-yellow-600'}
              />
              <div className={`text-sm ${balanceVerificationStatus === 'error' ? 'text-red-800' : 'text-yellow-800'}`}>
                {balanceVerificationStatus === 'error'
                  ? 'Balance data has errors. Verify carefully.'
                  : 'Balance may be outdated.'}
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
              Available: {parseFloat(max || 0).toFixed(4)} {selectedCurrency?.symbol || 'Token'}
            </div>
            <input
              type="number"
              step="0.0001"
              placeholder={`Amount in ${selectedCurrency?.symbol || 'Token'}`}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              max={max}
              className={`w-full border rounded-full p-3 text-lg ${!ok && val ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            />
            {!ok && val && (
              <div className="text-xs text-red-600 mt-1">
                {parseFloat(val) <= 0
                  ? 'Amount must be greater than 0'
                  : `Amount exceeds available (${parseFloat(max || 0).toFixed(4)})`}
              </div>
            )}
            <button onClick={() => setVal(max)} className="text-xs underline text-blue-600 mt-1 hover:text-blue-800">
              Use Max ({parseFloat(max || 0).toFixed(4)})
            </button>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={isDeposit ? handleDeposit : handleWithdraw}
              disabled={loading || !ok}
              className={`flex-1 py-3 rounded-full text-lg font-semibold shadow-inner transition-all ${
                isDeposit
                  ? 'bg-gradient-to-b from-green-500 to-green-600 text-white hover:scale-105'
                  : 'bg-gradient-to-b from-blue-500 to-blue-600 text-white hover:scale-105'
              } disabled:opacity-50`}
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : `Confirm ${isDeposit ? 'Deposit' : 'Withdrawal'}`}
            </button>
            <button
              onClick={() => setShowWalletModal(null)}
              className="flex-1 py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 text-lg font-semibold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderBalanceCard = (label, value, isBuffered = false) => {
    const v = parseFloat(value || 0);
    let color = 'text-gray-600', icon = '⏳';
    if (balanceVerificationStatus === 'verified') { color = 'text-green-600'; icon = '✅'; }
    if (balanceVerificationStatus === 'stale') { color = 'text-yellow-600'; icon = '⚠️'; }
    if (balanceVerificationStatus === 'error') { color = 'text-red-600'; icon = '❌'; }

    return (
      <div className={`rounded-2xl p-4 mb-4 ${isBuffered ? 'bg-yellow-500/20 border border-yellow-300' : 'bg-white/10'}`}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm">{label}</span>
          <span className={`font-bold ${isBuffered ? 'text-yellow-200' : 'text-white'}`}>
            {v.toFixed(6)} {selectedCurrency?.symbol || ''}
          </span>
        </div>
        <div className={`text-xs ${color}`}>{icon} {balanceVerificationStatus}</div>
      </div>
    );
  };

  const displayCurrencies = SUPPORTED_CURRENCIES.map((c) => {
    if (c.symbol === 'CORE') {
      return CONFIG.CHAIN_ID === 1116
        ? { ...c, displaySymbol: 'tCORE', displayName: 'Test Core' }
        : { ...c, displaySymbol: 'CORE', displayName: 'Core' };
    }
    return { ...c, displaySymbol: c.symbol, displayName: c.name };
  });

  return (
    <>
      <div className="w-full max-w-md p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white rounded-xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">In-Game Wallet</h2>
          <button
            onClick={loadAllCurrencyBalances}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh all balances"
          >
            <RefreshCw size={16} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="mb-6">
          <label className="text-sm font-semibold">Select Currency:</label>
          <select
            value={selectedCurrency?.symbol || ''}
            onChange={(e) => setSelectedCurrency(displayCurrencies.find((c) => c.symbol === e.target.value))}
            className="mt-2 w-full bg-white text-black rounded-full p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {displayCurrencies.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.displayName} ({c.displaySymbol})
              </option>
            ))}
          </select>
        </div>

        {renderBalanceCard('In-Game Balance', balanceState.inGame)}
        {renderBalanceCard('Buffered Winnings', balanceState.buffered, true)}

        <div className="bg-blue-500/20 rounded-2xl p-4 mb-6">
          <div className="text-sm text-blue-300 mb-1">Wallet Balance</div>
          <div className="text-lg font-bold text-blue-200">
            {parseFloat(balanceState.wallet || 0).toFixed(6)} {selectedCurrency?.symbol || 'N/A'}
          </div>
        </div>

        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setShowWalletModal('deposit')}
            disabled={parseFloat(balanceState.wallet || 0) === 0}
            className={`flex-1 px-6 py-3 rounded-full text-lg font-semibold shadow-inner transition-all ${
              parseFloat(balanceState.wallet || 0) === 0
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-b from-green-600 to-green-700 text-white hover:scale-105'
            }`}
          >
            Deposit
          </button>
          <button
            onClick={() => setShowWalletModal('withdraw')}
            disabled={parseFloat(balanceState.inGame || 0) === 0}
            className={`flex-1 px-6 py-3 rounded-full text-lg font-semibold shadow-inner transition-all ${
              parseFloat(balanceState.inGame || 0) === 0
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-b from-blue-600 to-blue-700 text-white hover:scale-105'
            }`}
          >
            Withdraw
          </button>
        </div>

        <button
          onClick={handleBufferedWithdraw}
          disabled={parseFloat(balanceState.buffered || 0) === 0 || loading}
          className={`w-full px-6 py-3 rounded-full text-lg font-semibold shadow-inner flex items-center justify-center space-x-2 ${
            parseFloat(balanceState.buffered || 0) === 0 || loading
              ? 'bg-purple-500/40 text-white cursor-not-allowed'
              : 'bg-gradient-to-b from-purple-600 to-purple-700 text-white hover:scale-105'
          }`}
        >
          <Shield size={16} />
          <span>{loading ? 'Processing...' : 'Withdraw Buffered Winnings'}</span>
        </button>
      </div>

      {renderWalletModal()}
    </>
  );
}
