// app/api/get-trx/route.js
import { NextResponse } from "next/server";
import { getTransactionJson } from "@/lib/github";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
  }

  const data = await getTransactionJson(id);
  if (!data) {
    return NextResponse.json({ success: false, message: "Transaksi tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}
