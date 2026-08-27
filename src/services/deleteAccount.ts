import { apiFetch } from "@/services/apiFetch";

interface DeleteAccountParams {
  currentPassword?: string;
  confirmation: string;
  totpCode?: string;
}

export async function deleteAccount(params: DeleteAccountParams): Promise<void> {
  const resp = await apiFetch("/api/v1/users/delete-account/", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      current_password: params.currentPassword ?? "",
      confirmation: params.confirmation,
      totp_code: params.totpCode ?? "",
    }),
  });

  if (!resp.ok) {
    const err = (await resp.json().catch(() => ({}))) as {
      detail?: string;
      requires_2fa?: boolean;
    };
    const error = new Error(err.detail ?? "Não foi possível excluir a conta.") as Error & {
      requires_2fa?: boolean;
    };
    if (err.requires_2fa) error.requires_2fa = true;
    throw error;
  }
}
