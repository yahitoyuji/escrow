// lib/github.js

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;

// Helper Simpan File JSON Baru ke GitHub
export async function createTransactionJson(trxId, data) {
  const path = `transactions/${trxId}.json`;
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;

  const contentBase64 = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "Paywuzz-App",
    },
    body: JSON.stringify({
      message: `Create transaction ${trxId}`,
      content: contentBase64,
    }),
  });

  return response.ok;
}

// Helper Baca File JSON dari GitHub
export async function getTransactionJson(trxId) {
  const path = `transactions/${trxId}.json`;
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "User-Agent": "Paywuzz-App",
    },
    cache: "no-store", // Agar data selalu terbaru
  });

  if (!response.ok) return null;

  const fileData = await response.json();
  const content = Buffer.from(fileData.content, "base64").toString("utf-8");
  return JSON.parse(content);
}
