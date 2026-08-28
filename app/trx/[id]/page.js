// app/trx/[id]/page.js
'use client';

import { useEffect, useState, use } from 'react';
import { sendAdminNotification } from '@/lib/telegram'; // Panggilan dari API Route

export default function TransactionPage({ params }) {
  const resolvedParams = use(params);
  const trxId = resolvedParams.id;

  const [trx, setTrx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Polling Fungsi: Mengecek Status Terbaru Tiap 5 Detik
  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/get-trx?id=${trxId}`);
      const data = await res.json();
      if (data.success) {
        setTrx(data.data);
      }
    } catch (err) {
      console.error("Gagal polling status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Polling 5 Detik
    return () => clearInterval(interval);
  }, [trxId]);

  // Aksi Pembeli Klik "Saya Sudah Bayar"
  const handlePaid = async () => {
    setActionLoading(true);
    try {
      // Update status ke WAITING_ADMIN_CHECK
      const res = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trxId, status: 'WAITING_ADMIN_CHECK' })
      });
      if (res.ok) fetchStatus();
    } catch (err) {
      alert("Terjadi kesalahan.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Memuat Transaksi...</div>;
  }

  if (!trx) {
    return <div className="min-h-screen bg-slate-900 text-red-400 flex items-center justify-center">Transaksi Tidak Ditemukan.</div>;
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
          <span className="text-xs font-mono bg-slate-700 text-amber-400 px-2 py-1 rounded">{trx.trxId}</span>
          <span className="text-xs text-slate-400">{new Date(trx.createdAt).toLocaleDateString('id-ID')}</span>
        </div>

        <h2 className="text-xl font-bold mb-1">{trx.itemTitle}</h2>
        <div className="bg-slate-900 p-3 rounded-lg my-3 space-y-1 text-sm border border-slate-700/50">
          <div className="flex justify-between text-slate-400">
            <span>Harga Barang:</span>
            <span>Rp {trx.itemAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Biaya Layanan Paywuzz:</span>
            <span className="text-amber-400">Rp {trx.fee.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-white font-bold border-t border-slate-700 pt-1 mt-1 text-base">
            <span>Total Harus Dibayar:</span>
            <span className="text-emerald-400">Rp {trx.totalPay.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* STATUS CONTAINER BLOCK */}
        <div className="my-6 p-4 rounded-xl text-center border">
          {trx.status === 'WAITING_FOR_PAYMENT' && (
            <div className="bg-amber-500/10 border-amber-500/30 text-amber-400">
              <p className="font-bold text-base mb-1">Menunggu Pembayaran Pembeli</p>
              <p className="text-xs text-slate-300">Silakan transfer sebesar <b>Rp {trx.totalPay.toLocaleString('id-ID')}</b> ke rekening penampungan Paywuzz.</p>
              
              {/* Nomor Rekening Admin Anda */}
              <div className="bg-slate-900 p-3 rounded mt-3 text-left border border-slate-700 text-xs text-white">
                <p className="text-slate-400">Rekening Resmi Paywuzz:</p>
                <p className="font-bold text-sm">BCA: 1234567890 (a.n Paywuzz Escrow)</p>
              </div>

              <button 
                onClick={handlePaid}
                disabled={actionLoading}
                className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg text-sm transition"
              >
                {actionLoading ? 'Memproses...' : 'Saya Sudah Transfer'}
              </button>
            </div>
          )}

          {trx.status === 'WAITING_ADMIN_CHECK' && (
            <div className="bg-blue-500/10 border-blue-500/30 text-blue-400">
              <p className="font-bold text-base">Sedang Diverifikasi Admin</p>
              <p className="text-xs text-slate-300 mt-1">Sistem sedang mencocokkan pembayaran Anda dengan mutasi bank. Harap tunggu sebentar...</p>
            </div>
          )}

          {trx.status === 'PAYMENT_VERIFIED' && (
            <div className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
              <p className="font-bold text-base">🟢 Uang Aman di Paywuzz!</p>
              <p className="text-xs text-slate-300 mt-1">Penjual dipersilakan mengirimkan barang/akun ke Pembeli sekarang.</p>
            </div>
          )}

          {trx.status === 'PAYMENT_REJECTED' && (
            <div className="bg-rose-500/10 border-rose-500/30 text-rose-400">
              <p className="font-bold text-base">🔴 Pembayaran Ditolak</p>
              <p className="text-xs text-slate-300 mt-1">Dana belum terdeteksi di mutasi bank. Harap hubungi Admin jika ada kendala.</p>
            </div>
          )}
        </div>

        {/* Share Link Info */}
        <div className="text-center text-xs text-slate-500">
          Bagikan tautan ini ke lawan transaksi Anda: <br/>
          <code className="text-amber-400 bg-slate-900 px-2 py-1 rounded mt-1 inline-block">
            {typeof window !== 'undefined' ? window.location.href : ''}
          </code>
        </div>
      </div>
    </main>
  );
}
