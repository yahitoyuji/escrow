// app/api/create-trx/route.js

import { NextResponse } from "next/server";
import { createTransactionJson } from "@/lib/github";

export async function POST(request) {
  try {
    const body = await request.json();
    const { itemTitle, amount, sellerBank, sellerAccount, buyerAccount } = body;

    const itemAmount = Number(amount);

    // LOGIKA KALKULASI FEE
    let fee = 10000; // Fee Flat Rp10.000 untuk < Rp1 Juta
    if (itemAmount >= 1000000) {
      fee = Math.round(itemAmount * 0.01); // Misal 1% jika >= Rp1 Juta
    }

    const totalPay = itemAmount + fee;
    const trxId = "TRX-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newTransaction = {
      trxId,
      itemTitle,
      itemAmount,
      fee,
      totalPay, // Nominal yang dibayar Pembeli
      payoutAmount: itemAmount, // Nominal bersih yang diterima Penjual
      sellerBank,
      sellerAccount,
      buyerAccount,
      status: "WAITING_FOR_PAYMENT",
      createdAt: new Date().toISOString(),
    };

    // Simpan ke GitHub Private Repo
    const saved = await createTransactionJson(trxId, newTransaction);

    if (!saved) {
      return NextResponse.json({ success: false, message: "Gagal menyimpan ke DB" }, { status: 500 });
    }

    return NextResponse.json({ success: true, trxId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
