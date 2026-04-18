import React, { useState } from 'react';
import {
  DollarSign, ArrowUpRight, ArrowDownLeft, RefreshCw,
  CreditCard, Clock, CheckCircle, XCircle, Send
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

// ── Types ──────────────────────────────────────────────────────────────────
type TxType   = 'deposit' | 'withdraw' | 'transfer' | 'funding';
type TxStatus = 'completed' | 'pending' | 'failed';

interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  sender: string;
  receiver: string;
  status: TxStatus;
  date: string;
  note?: string;
}

// ── Seed Data ──────────────────────────────────────────────────────────────
const initialTransactions: Transaction[] = [
  { id: 't1', type: 'funding',  amount: 50000, sender: 'Sarah (Investor)',  receiver: 'TechWave AI',       status: 'completed', date: '2026-04-10', note: 'Seed round funding'       },
  { id: 't2', type: 'deposit',  amount: 10000, sender: 'Bank Transfer',     receiver: 'Your Wallet',       status: 'completed', date: '2026-04-08'                                     },
  { id: 't3', type: 'transfer', amount: 2500,  sender: 'Your Wallet',       receiver: 'Ahmed (Entrepreneur)', status: 'pending', date: '2026-04-07', note: 'Milestone payment'       },
  { id: 't4', type: 'withdraw', amount: 5000,  sender: 'Your Wallet',       receiver: 'Bank Account',      status: 'completed', date: '2026-04-05'                                     },
  { id: 't5', type: 'funding',  amount: 25000, sender: 'Arham Ventures',    receiver: 'GreenLife Solutions', status: 'pending', date: '2026-04-03', note: 'Series A tranche 1'      },
  { id: 't6', type: 'deposit',  amount: 8000,  sender: 'Wire Transfer',     receiver: 'Your Wallet',       status: 'failed',    date: '2026-04-01'                                     },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const statusVariant: Record<TxStatus, 'success' | 'warning' | 'error'> = {
  completed: 'success',
  pending:   'warning',
  failed:    'error',
};

const statusIcon: Record<TxStatus, React.ReactNode> = {
  completed: <CheckCircle size={13} className="mr-1" />,
  pending:   <Clock       size={13} className="mr-1" />,
  failed:    <XCircle     size={13} className="mr-1" />,
};

const typeIcon: Record<TxType, React.ReactNode> = {
  deposit:  <ArrowDownLeft size={18} className="text-green-600"  />,
  withdraw: <ArrowUpRight  size={18} className="text-red-500"    />,
  transfer: <Send          size={18} className="text-blue-500"   />,
  funding:  <DollarSign    size={18} className="text-purple-600" />,
};

const typeBg: Record<TxType, string> = {
  deposit:  'bg-green-50',
  withdraw: 'bg-red-50',
  transfer: 'bg-blue-50',
  funding:  'bg-purple-50',
};

// ── Modal ──────────────────────────────────────────────────────────────────
type ModalType = 'deposit' | 'withdraw' | 'transfer' | 'funding' | null;

interface ActionModalProps {
  type: ModalType;
  onClose: () => void;
  onConfirm: (amount: number, note: string, receiver: string) => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ type, onClose, onConfirm }) => {
  const [amount,   setAmount]   = useState('');
  const [note,     setNote]     = useState('');
  const [receiver, setReceiver] = useState('');

  if (!type) return null;

  const titles: Record<NonNullable<ModalType>, string> = {
    deposit:  'Deposit Funds',
    withdraw: 'Withdraw Funds',
    transfer: 'Transfer Funds',
    funding:  'Fund a Startup',
  };

  const handleConfirm = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    onConfirm(amt, note, receiver || 'Bank Account');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">{titles[type]}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500 text-sm">$</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Receiver — shown for transfer & funding */}
        {(type === 'transfer' || type === 'funding') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'funding' ? 'Startup / Entrepreneur' : 'Recipient'}
            </label>
            <input
              type="text"
              value={receiver}
              onChange={e => setReceiver(e.target.value)}
              placeholder={type === 'funding' ? 'e.g. TechWave AI' : 'e.g. Ahmed (Entrepreneur)'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. Milestone payment"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Stripe-style card mockup for deposit */}
        {type === 'deposit' && (
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-4 text-white space-y-3">
            <div className="flex justify-between items-center">
              <CreditCard size={22} />
              <span className="text-xs font-medium opacity-80">VISA</span>
            </div>
            <p className="text-lg font-mono tracking-widest">•••• •••• •••• 4242</p>
            <div className="flex justify-between text-xs opacity-80">
              <span>CARD HOLDER</span>
              <span>EXPIRES</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Your Name</span>
              <span>12/28</span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance]           = useState(62500);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [activeModal, setActiveModal]   = useState<ModalType>(null);
  const [filterType, setFilterType]     = useState<TxType | 'all'>('all');

  const handleConfirm = (amount: number, note: string, receiver: string) => {
    const typeMap: Record<NonNullable<ModalType>, TxType> = {
      deposit: 'deposit', withdraw: 'withdraw', transfer: 'transfer', funding: 'funding',
    };
    const type = typeMap[activeModal!];

    // Update balance
    if (type === 'deposit')                      setBalance(b => b + amount);
    if (type === 'withdraw' || type === 'transfer' || type === 'funding') setBalance(b => b - amount);

    const newTx: Transaction = {
      id:       Date.now().toString(),
      type,
      amount,
      sender:   type === 'deposit' ? 'Bank Transfer' : `${user?.name ?? 'You'}`,
      receiver: type === 'deposit' ? 'Your Wallet'   : receiver,
      status:   'pending',
      date:     new Date().toISOString().split('T')[0],
      note:     note || undefined,
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const filtered = filterType === 'all'
    ? transactions
    : transactions.filter(t => t.type === filterType);

  const totalIn  = transactions.filter(t => t.type === 'deposit'  && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'withdraw' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const pending  = transactions.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Manage your wallet, transactions and funding</p>
        </div>
      </div>

      {/* Wallet + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Wallet card */}
        <div className="md:col-span-2">
          <div className="bg-gradient-to-br from-primary-600 to-primary-900 rounded-2xl p-6 text-white h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-75">Total Wallet Balance</p>
                <h2 className="text-4xl font-bold mt-1">${balance.toLocaleString()}</h2>
              </div>
              <div className="p-2 bg-white bg-opacity-20 rounded-xl">
                <CreditCard size={24} />
              </div>
            </div>
            <div className="flex gap-3 mt-6 flex-wrap">
              <button
                onClick={() => setActiveModal('deposit')}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 transition px-4 py-2 rounded-xl text-sm font-medium"
              >
                <ArrowDownLeft size={16} /> Deposit
              </button>
              <button
                onClick={() => setActiveModal('withdraw')}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 transition px-4 py-2 rounded-xl text-sm font-medium"
              >
                <ArrowUpRight size={16} /> Withdraw
              </button>
              <button
                onClick={() => setActiveModal('transfer')}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 transition px-4 py-2 rounded-xl text-sm font-medium"
              >
                <Send size={16} /> Transfer
              </button>
              <button
                onClick={() => setActiveModal('funding')}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 transition px-4 py-2 rounded-xl text-sm font-medium"
              >
                <DollarSign size={16} /> Fund Startup
              </button>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <ArrowDownLeft size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Deposited</p>
                <p className="text-xl font-bold text-gray-900">${totalIn.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <ArrowUpRight size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Withdrawn</p>
                <p className="text-xl font-bold text-gray-900">${totalOut.toLocaleString()}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Funding deal flow */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-primary-600" />
            <h2 className="text-lg font-medium text-gray-900">Funding Deal Flow</h2>
            <span className="text-xs text-gray-400">(Investor → Entrepreneur)</span>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between flex-wrap gap-4">
            {[
              { step: '1', label: 'Deal Initiated',  desc: 'Investor selects startup',   done: true  },
              { step: '2', label: 'Due Diligence',   desc: 'Documents reviewed',         done: true  },
              { step: '3', label: 'Term Sheet',      desc: 'Terms agreed upon',          done: true  },
              { step: '4', label: 'Funds Released',  desc: 'Payment transferred',        done: false },
              { step: '5', label: 'Deal Closed',     desc: 'Equity confirmed',           done: false },
            ].map((s, i, arr) => (
              <React.Fragment key={s.step}>
                <div className="flex flex-col items-center text-center w-24">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                    s.done ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }`}>
                    {s.done ? '✓' : s.step}
                  </div>
                  <p className="text-xs font-semibold text-gray-800">{s.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 ${s.done ? 'bg-primary-400' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button leftIcon={<DollarSign size={16} />} onClick={() => setActiveModal('funding')}>
              Initiate New Funding
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader className="flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'deposit', 'withdraw', 'transfer', 'funding'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all capitalize ${
                  filterType === f
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Type', 'Amount', 'Sender', 'Receiver', 'Note', 'Date', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg ${typeBg[tx.type]}`}>
                        {typeIcon[tx.type]}
                        <span className="text-xs font-medium capitalize">{tx.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ${tx.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{tx.sender}</td>
                    <td className="px-4 py-3 text-gray-600">{tx.receiver}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{tx.note ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{tx.date}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[tx.status]} size="sm">
                        <span className="flex items-center">
                          {statusIcon[tx.status]}{tx.status}
                        </span>
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-gray-500 py-8 text-sm">No transactions found.</p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Modal */}
      {activeModal && (
        <ActionModal
          type={activeModal}
          onClose={() => setActiveModal(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
};