// app/api/telegram-webhook/route.js
import { NextResponse } from "next/server";
import { getTransactionJson, createTransactionJson } from "@/lib/github";

export async function POST(request) {
  try {
    const body = await request.json();

    // Memproses aksi dari Inline Keyboard Telegram
    if (body.callback_query) {
      const callbackData = body.callback_query.data;
      const chatId = body.callback_query.message.chat.id;
      const messageId = body.callback_query.message.message_id;

      let newStatus = "";
      let trxId = "";

      if (callbackData.startsWith("APPROVE_PAYMENT_")) {
        trxId = callbackData.replace("APPROVE_PAYMENT_", "");
        newStatus = "PAYMENT_VERIFIED";
      } else if (callbackData.startsWith("REJECT_PAYMENT_")) {
        trxId = callbackData.replace("REJECT_PAYMENT_", "");
        newStatus = "PAYMENT_REJECTED";
      }

      if (trxId) {
        // 1. Ambil data transaksi dari GitHub
        const trxData = await getTransactionJson(trxId);
        if (trxData) {
          // 2. Perbarui status
          trxData.status = newStatus;
          trxData.verifiedAt = new Date().toISOString();
          await createTransactionJson(trxId, trxData);

          // 3. Edit pesan di Telegram Admin sebagai bukti status sudah diperbarui
          const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
          const statusText = newStatus === "PAYMENT_VERIFIED" ? "🟢 UANG DIVERIFIKASI (AMAN)" : "🔴 PEMBAYARAN DITOLAK";
          
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              text: `STATUS TRX ${trxId}: ${statusText}\n\nCatatan: Penjual telah diberi tahu untuk mengirim barang.`,
              parse_mode: "Markdown"
            }),
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
