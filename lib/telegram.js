// lib/telegram.js

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

// Helper Kirim Pesan Teks + Tombol Approval ke Admin
export async function sendAdminNotification(trxData) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const messageText = 
`📥 *PEMBAYARAN MASUK!*
━━━━━━━━━━━━━━━━━━
*ID Transaksi:* \`${trxData.trxId}\`
*Barang/Jasa:* ${trxData.itemTitle}
*Total Tagihan:* *Rp${trxData.totalPay.toLocaleString('id-ID')}* (Inc. Fee Rp${trxData.fee.toLocaleString('id-ID')})
*Hak Penjual:* Rp${trxData.payoutAmount.toLocaleString('id-ID')}
*Rek. Penjual:* ${trxData.sellerBank.toUpperCase()} - ${trxData.sellerAccount}

_Silakan periksa mutasi m-Banking/E-Wallet Anda._`;

  // Menyiapkan tombol interaktif di bawah pesan Telegram
  const replyMarkup = {
    inline_keyboard: [
      [
        { text: "🟢 OK Uang Aman", callback_data: `APPROVE_PAYMENT_${trxData.trxId}` },
        { text: "🔴 Tolak / Palsu", callback_data: `REJECT_PAYMENT_${trxData.trxId}` }
      ]
    ]
  };

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: ADMIN_CHAT_ID,
      text: messageText,
      parse_mode: "Markdown",
      reply_markup: replyMarkup,
    }),
  });
}
