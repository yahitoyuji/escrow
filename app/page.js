// app/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    itemTitle: '',
    amount: '',
    sellerBank: '',
    sellerAccount: '',
    buyerAccount: ''
  });
  const [loading, setLoading] = useState(false);

  // Kalkulasi Fee Otomatis di Tampilan Web
  const itemAmount = Number(formData.amount) || 0;
  const fee = itemAmount > 0 ? (itemAmount < 1000000 ? 10000 : Math.round(itemAmount * 0.01)) : 0;
  const totalPay = itemAmount + fee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/create-trx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        // Redirection instan ke Halaman Detail Transaksi
        router.push(`/trx/${data.trxId}`);
      } else {
        alert('Gagal membuat transaksi: ' + data.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
        <h1 className="text-3xl font-extrabold text-amber-400 text-center mb-1">Paywuzz.com</h1>
        <p className="text-slate-400 text-xs text-center mb-6">Rekber Instan, Aman & Tanpa Ribet</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Nama Barang / Transaksi</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: Akun MLBB / Jasa Design" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400"
              onChange={(e) => setFormData({...formData, itemTitle: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Harga Barang (Rp)</label>
            <input 
              type="number" 
              required
              placeholder="Contoh: 150000" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400"
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
          </div>

          {/* Rincian Fee Transparan */}
          {itemAmount > 0 && (
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/50 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Harga Barang:</span>
                <span>Rp {itemAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Biaya Layanan Paywuzz:</span>
                <span className="text-amber-400 font-bold">Rp {fee.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-white font-bold border-t border-slate-700 pt-1 mt-1">
                <span>Total Tagihan Pembeli:</span>
                <span className="text-emerald-400">Rp {totalPay.toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Bank/E-Wallet Penjual</label>
              <input 
                type="text" 
                required
                placeholder="BCA / DANA" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400"
                onChange={(e) => setFormData({...formData, sellerBank: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">No. Rekening Penjual</label>
              <input 
                type="text" 
                required
                placeholder="1234567890" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400"
                onChange={(e) => setFormData({...formData, sellerAccount: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">No. Rekening Pembeli (Opsional Refund)</label>
            <input 
              type="text" 
              placeholder="BCA 0987654321" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400"
              onChange={(e) => setFormData({...formData, buyerAccount: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3 rounded-lg transition duration-200 mt-2 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Buat Link Rekber'}
          </button>
        </form>
      </div>
    </main>
  );
}
