// app/api/get-history/route.js
import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;

export async function GET() {
  try {
    // 1. Ambil daftar semua file dari folder transactions/ di GitHub Repo
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/transactions`;
    
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "User-Agent": "Paywuzz-App",
      },
      next: { revalidate: 60 } // Cache selama 60 detik agar hemat panggilan API GitHub
    });

    if (!res.ok) {
      return NextResponse.json({ success: true, history: [] });
    }

    const files = await res.json();
    
    // 2. Ambil isi tiap file secara paralel
    const historyPromises = files.map(async (file) => {
      const fileRes = await fetch(file.download_url);
      if (!fileRes.ok) return null;
      const data = await fileRes.json();

      // HANYA AMBIL TRANSAKSI YANG SUDAH SUKSES / COMPLETED
      if (data.status === "COMPLETED") {
        return {
          trxId: data.trxId.substring(0, 5) + "***", // Sensor ID Transaksi (misal: TRX-8F***)
          itemTitle: data.itemTitle,
          itemAmount: data.itemAmount,
          fee: data.fee,
          completedAt: data.verifiedAt || data.createdAt
        };
      }
      return null;
    });

    const results = await Promise.all(historyPromises);
    
    // Filter data null dan urutkan dari transaksi terbaru
    const cleanHistory = results
      .filter((item) => item !== null)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    return NextResponse.json({ success: true, history: cleanHistory });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
