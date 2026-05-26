import React, { useState, useEffect } from 'react';
import { IndianRupee, Plus, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2 } from 'lucide-react';
import { weddingService } from '../../../../../services/weddingService';
import toast from 'react-hot-toast';
import VendorLayout from '../layouts/VendorLayout';

const VendorWallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await weddingService.getVendorWallet();
      if (res.success && res.data) {
        setBalance(res.data.balance || 0);
        setTransactions(res.data.transactions || []);
      }
    } catch (error) {
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!amountToAdd || isNaN(amountToAdd) || amountToAdd <= 0) return;
    
    try {
      const toastId = toast.loading('Processing payment...');
      // Simulate gateway
      await new Promise(r => setTimeout(r, 1000));
      
      const res = await weddingService.addMoneyToWallet(amountToAdd, 'mock_pay_' + Date.now());
      if (res.success) {
        toast.success('Wallet recharged successfully!', { id: toastId });
        setBalance(res.data.balance);
        setTransactions(res.data.transactions.sort((a,b) => new Date(b.date) - new Date(a.date)));
        setShowAddMoney(false);
        setAmountToAdd('');
      }
    } catch(err) {
      toast.dismiss();
      toast.error('Failed to add money');
    }
  };

  return (
    <VendorLayout title="My Wallet">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className={`text-3xl font-serif text-[hsl(353,45%,35%)]`}>My Wallet</h2>
            <p className="text-gray-500 text-sm mt-1">Manage your funds for purchasing extra leads and boosting your profile.</p>
            <div className="flex flex-wrap gap-2 mt-4">
               <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                 ⚡ Buy Extra Leads
               </span>
               <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold border border-purple-100">
                 🚀 Boost Profile Visibility
               </span>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-[hsl(353,45%,35%)] to-[hsl(353,45%,20%)] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <IndianRupee size={120} />
          </div>
          
          <div className="relative z-10">
            <p className="text-white/70 text-sm font-bold tracking-widest uppercase mb-2">Available Balance</p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-3xl font-bold">₹</span>
              <span className="text-5xl font-black">{balance.toLocaleString()}</span>
            </div>
            
            <button 
              onClick={() => setShowAddMoney(!showAddMoney)}
              className="w-full py-4 bg-white text-[hsl(353,45%,35%)] rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Add Money to Wallet
            </button>
          </div>
        </div>

        {/* Add Money Form (Collapsible) */}
        {showAddMoney && (
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-xl font-black text-slate-800 mb-6">Recharge Wallet</h3>
            <form onSubmit={handleAddMoney} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Enter Amount (₹)</label>
                <input 
                  type="number"
                  required
                  min="100"
                  value={amountToAdd}
                  onChange={(e) => setAmountToAdd(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#B06A6C]/20"
                />
              </div>
              <button 
                type="submit"
                className="w-full md:w-auto px-8 py-4 bg-[hsl(353,45%,35%)] text-white rounded-2xl font-bold hover:bg-[hsl(353,45%,30%)] transition-colors shadow-md flex items-center justify-center gap-2"
              >
                Proceed to Pay
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
              <CheckCircle2 size={14} className="text-green-500" /> Secure payment gateway integration coming soon.
            </p>
          </div>
        )}

        {/* Transactions List */}
        <div className={`lg:col-span-${showAddMoney ? '3' : '2'} bg-white p-8 rounded-3xl shadow-sm border border-gray-100`}>
          <h3 className="text-xl font-black text-slate-800 mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions yet.</p>
            ) : (
              transactions.map((tx, idx) => (
                <div key={tx._id || idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {tx.type === 'credit' ? <ArrowDownRight size={24} /> : <ArrowUpRight size={24} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{tx.description}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock size={12} /> {new Date(tx.date).toLocaleDateString()} at {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-slate-800'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-xs font-bold text-green-500 mt-1">Success</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorWallet;
