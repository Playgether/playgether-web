"use client";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";
const FOLDER = "feedback-attachments";

/**
 * Upload assinado direto pro Cloudinary (sem upload preset — os parâmetros são
 * assinados um a um por /api/signed-feedback), usado pelos anexos de Feedback e
 * de "Ajuda e contato". Exige sessão autenticada (a rota de assinatura chama
 * authorizeCloudinaryMutation, que bloqueia usuários deslogados).
 */
export async function uploadFeedbackAttachment(file: File): Promise<string> {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder: FOLDER };

  const sigRes = await fetch("/api/signed-feedback", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paramsToSign }),
  });
  if (!sigRes.ok) {
    const data = await sigRes.json().catch(() => ({}) as { error?: string });
    throw new Error(
      sigRes.status === 401
        ? "Faça login para anexar arquivos."
        : (data.error ?? "Falha ao autorizar upload."),
    );
  }
  const { signature } = (await sigRes.json()) as { signature: string };

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", FOLDER);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: "POST", body: formData },
  );
  if (!uploadRes.ok) {
    throw new Error(`Falha ao enviar "${file.name}".`);
  }
  const data = (await uploadRes.json()) as { secure_url: string };
  return data.secure_url;
}
