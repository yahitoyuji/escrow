// app/history/page.js
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/get-history');
        const data = await res.json();
        if (data.success) {
          setHistory(data.history);
        }
      } catch (err) {
        console.error("Gagal memuat riwayat:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  // Hitung Total Volume Transaksi Sukses
  const totalVolume = history.reduce((sum, item) => sum + item.itemAmount, 0);

  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        
        {/* Navigation Bar Sederhana */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="text-amber-400 font-extrabold text-2xl">Paywuzz.com</Link>
          <Link href="/" className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-2 rounded-lg border border-slate-700">
            + Buat Rekber
          </Link>
        </div>

        {/* Ringkasan Statistik Trust Badge */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl text-center">
            <p className="text-slate-400 text-xs mb-1">Total Transaksi Sukses</p>
            <p className="text-2xl font-black text-emerald-400">{history.length} TRX</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl text-center">
            <p className="text-slate-400 text-xs mb-1">Total Nilai Terproses</p>
            <p className="text-xl font-black text-amber-400">
              Rp {totalVolume.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>📜</span> Riwayat Transaksi Berhasil
        </h2>

        {/* Tabel / List Riwayat Transaksi */}
        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Memuat data transaksi...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm bg-slate-800 rounded-xl border border-slate-700">
            Belum ada riwayat transaksi publik.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, index) => (
              <div 
                key={index} 
                className="bg-slate-800 border border-slate-700/80 rounded-xl p-4 flex justify-between items-center hover:border-slate-600 transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/20">
                      SUKSES
                    </span>
                    <span className="text-xs font-mono text-slate-400">{item.trxId}</span>
                  </div>
                  <p className="font-semibold text-sm text-slate-200">{item.itemTitle}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(item.completedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-emerald-400 font-bold text-sm">
                    Rp {item.itemAmount.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Fee: Rp {item.fee.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
